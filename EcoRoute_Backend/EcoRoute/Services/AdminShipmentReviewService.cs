using System.Text.RegularExpressions;
using AutoMapper;
using EcoRoute.Data;
using EcoRoute.Models;
using EcoRoute.Models.DTOs;
using EcoRoute.Models.Entities;
using EcoRoute.Models.HelperClasses;
using EcoRoute.Repositories;
using EcoRoute.Utils;

namespace EcoRoute.Services
{

    public interface IAdminShipmentReviewService
    {
        Task<List<OrderDto>> GetShipmentsForReview();

        Task ApproveShipment(OrderDto orderDto);

        Task CancelShipment(OrderDto orderDto);

        Task<List<ImproviseShipmentGroupDto>> ImproviseShipments(List<OrderDto> orderDtos);

        Task ApproveGroupedShipment(ImproviseShipmentGroupDto groupDto);
    }
    public class AdminShipmentReviewService : IAdminShipmentReviewService
    {
        private readonly IShipmentRepository _shipmentRepo;
        private readonly IOrderRepository _orderRepo;
        private readonly INotificationRepository _notifRepo;
        private readonly ICompanyRepository _companyRepo;
        private readonly ITruckRepository _truckRepo;

        private readonly IMapper _mapper;

        private readonly RouteOptimizationService _ROS;

        private readonly EcoRouteDbContext _dbcontext;

        public AdminShipmentReviewService(IShipmentRepository _shipmentRepo, IMapper _mapper
                                        , IOrderRepository _orderRepo, INotificationRepository _notifRepo,
                                        ITruckRepository _truckRepo, RouteOptimizationService _ROS
                                        ,EcoRouteDbContext _dbcontext, ICompanyRepository _companyRepo)
        {
            this._shipmentRepo = _shipmentRepo;
            this._mapper = _mapper;
            this._orderRepo = _orderRepo;
            this._notifRepo = _notifRepo;
            this._companyRepo = _companyRepo;
            this._truckRepo = _truckRepo;
            this._ROS = _ROS;
            this._dbcontext = _dbcontext;
        }
        
        public async Task<List<OrderDto>> GetShipmentsForReview()
        {
            var orderDtos = new List<OrderDto>();


            var orders = await _shipmentRepo.GetShipmentsForReview();

            foreach(var order in orders)
            {
                var orderDto = _mapper.Map<OrderDto>(order);

                orderDtos.Add(orderDto);
            }

            return orderDtos;
        }

        public async Task ApproveShipment(OrderDto orderDto)
        {
            string status = "placed";
            
            int shipId = await _shipmentRepo.CreateShipment(orderDto);

            await _orderRepo.ChangeOrderStatus(orderDto.OrderId, status);
            await _orderRepo.InsertShipmentIdInOrder(orderDto.OrderId, shipId);

            var notification = new Notification(){
                Message = $"Your order for ID({orderDto.OrderCode}) from {orderDto.OrderOrigin} -> {orderDto.OrderDestination} has been placed successfully!",
                IsRead = false,
                TargetCompanyId = orderDto.CompanyId
            };

            await _notifRepo.AddNotificationAsync(notification);
            await _notifRepo.SaveChangesAsync();
        }

        public async Task CancelShipment(OrderDto orderDto)
        {
            string status = "cancelled";
            await _orderRepo.ChangeOrderStatus(orderDto.OrderId, status);

            var refundCredits = orderDto.OrderCO2Emission / 1000;
            await _companyRepo.RefundCompanyCredits(orderDto.CompanyId, refundCredits);
             
            var notification = new Notification(){
                Message = $"Your order for ID({orderDto.OrderCode}) from {orderDto.OrderOrigin} -> {orderDto.OrderDestination} has been cancelled by the admin",
                IsRead = false,
                TargetCompanyId = orderDto.CompanyId
            };

            await _notifRepo.AddNotificationAsync(notification);
            await _notifRepo.SaveChangesAsync();
        }

        public async Task<List<ImproviseShipmentGroupDto>> ImproviseShipments(List<OrderDto> orderDtos)
        {
            var optimizedGroups = new List<ImproviseShipmentGroupDto>();

            var processedOrderIds = new HashSet<int>();

            var sharedRoutes = orderDtos.Where(o => o.OrderMode.ToLower() == "shared");
            var routeGroups = sharedRoutes.GroupBy(o => o.SelectedRouteSummary);

            foreach(var rG in routeGroups)
            {
                var ordersInRoute = rG.ToList();

                for(int i = 0; i< ordersInRoute.Count; i++)
                {
                    var anchor = ordersInRoute[i];

                    if (processedOrderIds.Contains(anchor.OrderId))
                    {
                        continue;
                    }

                    var currentCluster = new List<OrderDto>
                    {
                        anchor
                    };
                    processedOrderIds.Add(anchor.OrderId);

                    for(int j = i+1; j< ordersInRoute.Count; j++)
                    {
                        var candidate = ordersInRoute[j];

                        if (processedOrderIds.Contains(candidate.OrderId))
                        {
                            continue;
                        }
                        Console.WriteLine("OUTSIDE THE IF CHECK");
                        if(await IsSpatiallyCompatible(anchor, candidate) && await IsTemporallyCompatible(anchor, candidate))
                        {
                        Console.WriteLine("INSIDE THE IF CHECK");
                            currentCluster.Add(candidate);
                            processedOrderIds.Add(candidate.OrderId);
                        }
                    }
                    var packingInput = new ClusterPackingInputDto
                    {
                        TotalWeightKg = currentCluster.Sum(c => c.OrderWeightKg),
                        Items = currentCluster.Select(o => new PackableItem
                        {
                            Length = o.OrderLength,
                            Width  = o.OrderWidth,
                            Height = o.OrderHeight,
                            Quantity = o.OrderTotalItems
                        }).ToList()
                    };

                    var candidateTrucks = await _truckRepo.GetTruckTypeAsync(packingInput.TotalWeightKg);

                    TruckType truck = null;

                    foreach (var t in candidateTrucks)
                    {
                        if (CanFitCluster(packingInput.Items, t))
                        {
                            truck = t;
                            break;
                        }
                    }

                    Console.WriteLine($"TRUCK FOR COMBINED ORDER ::::::::::::::{truck.TruckName}");

                    if (truck == null) continue;
                    
                    var optimizedRouteData = await _ROS.GenerateOptimizedRoute(currentCluster);

                    Console.WriteLine($"ROUTE STOPS LENGTH _____----------____________{optimizedRouteData.Stops.Count()}");
                    optimizedGroups.Add(new ImproviseShipmentGroupDto
                    {
                        Orders = currentCluster,
                        OptimizedGroupPolyline = optimizedRouteData.Polyline,
                        TransportVehicle = truck.TruckName,
                        RouteStops = optimizedRouteData.Stops,
                        OptimizedDistance = optimizedRouteData.TotalDistanceMeters,

                        CombinedOrderWeightKg = packingInput.TotalWeightKg,

                        CombinedOrderTotalItems =
                            currentCluster.Sum(o => o.OrderTotalItems),

                        ApproxCombinedVolume =
                            currentCluster.Sum(o =>
                                o.OrderLength * o.OrderWidth * o.OrderHeight * o.OrderTotalItems)
                    });

                    foreach(var order in currentCluster)
                    {
                        order.TransportMode = truck.TruckName;
                    }
                }
            }
            return optimizedGroups;
        }

        public async Task ApproveGroupedShipment(ImproviseShipmentGroupDto groupDto)
        {
            if(groupDto.Orders == null || !groupDto.Orders.Any())
            {
                throw new Exception("empty shipment group");
            }

            using var transaction = await _dbcontext.Database.BeginTransactionAsync();

            var earliestDate = groupDto.Orders.Min(o => o.OrderDate);

            var lastDrop = groupDto.RouteStops.Where(s => s.StopType == "DROP")
                                                .OrderByDescending(s => s.Sequence)
                                                    .FirstOrDefault();

            if(lastDrop == null)
            {
                throw new InvalidOperationException("no DROP found for grouped shipment");
            }

            var destinationOrder = groupDto.Orders.First( o=> o.OrderId == lastDrop.OrderId);
            var shipment =  new Shipment
            {
                ShipmentDate = earliestDate,
                ShipmentOrgin = groupDto.RouteStops.OrderBy(s => s.Sequence)
                                                        .First().StopType == "PICKUP"
                                                            ? groupDto.Orders.First().OrderOrigin
                                                            : groupDto.RouteStops.First().Lat + "," + groupDto.RouteStops.First().Lng,
                
                ShipmentDestination = destinationOrder.OrderDestination,

                ShipmentTotalItems = groupDto.Orders.Sum(o => o.OrderTotalItems),
                ShipmentWeightKg = groupDto.Orders.Sum(o => o.OrderWeightKg),

                ShipmentLength = groupDto.Orders.Max(o => o.OrderLength),
                ShipmentWidth  = groupDto.Orders.Max(o => o.OrderWidth),
                ShipmentHeight = groupDto.Orders.Max(o => o.OrderHeight), 
                ShipmentDistance =  groupDto.OptimizedDistance,
                Vehicle = groupDto.TransportVehicle,
                ShipmentCO2Emission = groupDto.Orders.Sum(o => o.OrderCO2Emission),

                OrderList = new List<Order>()
            };

            foreach(var orderDto in groupDto.Orders)
            {
                var order = await _orderRepo.GetOrderByOrderId(orderDto.OrderId);

                order.OrderStatus = "placed";
                order.TransportVehicle = groupDto.TransportVehicle;
                shipment.OrderList.Add(order);
            }

            await _shipmentRepo.AddShipmentAsync(shipment);
            await _shipmentRepo.SaveChangesAsync();

            await transaction.CommitAsync();
        }

        private async Task<bool> IsSpatiallyCompatible(OrderDto a, OrderDto b)
        {
            double distOrigin = Geometry.HaversineMeters(a.OriginRP.Lat, a.OriginRP.Lng, b.OriginRP.Lat, b.OriginRP.Lng);
            Console.WriteLine($"DISTANCE BTW TWO ORIGINS _________: {distOrigin}");
            double distDestination = Geometry.HaversineMeters(a.DestinationRP.Lat, a.DestinationRP.Lng, b.DestinationRP.Lat, b.DestinationRP.Lng);
            Console.WriteLine($"DISTANCE BTW TWO DESTINATIONS _________: {distDestination}");

            return distOrigin <= 50000 && distDestination <= 50000;
        }

        private async  Task<bool> IsTemporallyCompatible(OrderDto a, OrderDto b)
        {
            var minDate = a.OrderDate.AddDays(-1);
            var maxDate = a.OrderDate.AddDays(3);

            return b.OrderDate >= minDate && b.OrderDate <= maxDate;
        }

        public bool CanFitCluster(
        List<PackableItem> items,
        TruckType truck)
        {
            double truckL = truck.CargoLengthMeters;
            double truckW = truck.CargoWidthMeters;
            double truckH = truck.CargoHeightMeters;

            double usedHeight = 0;

            foreach (var item in items)
            {
                // 1. Check base orientation
                bool fitsBase =
                    (item.Length <= truckL && item.Width <= truckW) ||
                    (item.Width  <= truckL && item.Length <= truckW);

                if (!fitsBase)
                    return false;

                // 2. Compute best floor fit (orientation-aware)
                double floorL = Math.Max(item.Length, item.Width);
                double floorW = Math.Min(item.Length, item.Width);

                int itemsPerRow = (int)(truckL / floorL);
                int itemsPerCol = (int)(truckW / floorW);

                int itemsPerLayer = Math.Max(1, itemsPerRow * itemsPerCol);

                // 3. Layers needed for this item type
                int layersNeeded =
                    (int)Math.Ceiling((double)item.Quantity / itemsPerLayer);

                usedHeight += layersNeeded * item.Height;

                // 4. Early exit
                if (usedHeight > truckH)
                    return false;
            }

            // 5. Safety margin
            return usedHeight <= truckH * 0.9;
        }


    }
}
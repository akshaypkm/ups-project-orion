using AutoMapper;
using EcoRoute.Data;
using EcoRoute.Models;
using EcoRoute.Models.Entities;
using EcoRoute.Repositories;

namespace EcoRoute.Services
{
    public interface ICarbonQuoteService
    {
        public Task<(bool Success,string? Message, List<OrderDto>? OrderDto)> PostDataToCalculate(string companyName, OrderRequestDto orderRequestDto);
        
        public Task<(bool Success, string Message)> PlaceOrder(string companyName, OrderDto orderDto);
    }
    public class CarbonQuoteService : ICarbonQuoteService
    {
        private readonly EcoRouteDbContext _dbContext;
        private readonly IUserRepository _userRepo;
        private readonly ICompanyRepository _companyRepo;
        private readonly IEmissionRepository _emissionRepo;
        private readonly IShipmentRepository _shipmentRepo;
        private readonly ICreditRepository _creditRepo;
        private readonly ITruckRepository _truckRepo;
        private readonly IOrderRepository _orderRepo;
        private readonly IConfiguration _configuration;
        private readonly IMapper _mapper;
        

        public CarbonQuoteService(EcoRouteDbContext _dbContext, IUserRepository _userRepo, 
                            ICompanyRepository _companyRepo, IEmissionRepository _emissionRepo,
                            IShipmentRepository _shipmentRepo, ICreditRepository _creditRepo,
                             ITruckRepository _truckRepo,IOrderRepository _orderRepo,
                            IConfiguration _configuration, IMapper _mapper)
        {
            this._dbContext = _dbContext;
            this._userRepo = _userRepo;
            this._companyRepo = _companyRepo;
            this._emissionRepo = _emissionRepo;
            this._shipmentRepo = _shipmentRepo;
            this._creditRepo = _creditRepo;
            this._truckRepo = _truckRepo;
            this._orderRepo = _orderRepo;
            this._configuration = _configuration;
            this._mapper = _mapper;
        }

        public async Task<(bool Success,string? Message, List<OrderDto>? OrderDto)> PostDataToCalculate(string companyName, OrderRequestDto orderRequestDto)
        {
            var companyId = await _companyRepo.GetCompanyIdByName(companyName);

            var API_KEY = _configuration.GetConnectionString("GoogleAPIKey");
            string orderOrigin = orderRequestDto.OrderOrigin;
            string orderDestination = orderRequestDto.OrderDestination;

            double orderWeightKg = orderRequestDto.OrderWeightKg;
            int OrderTotalItems = orderRequestDto.OrderTotalItems;
            double orderTotalVolume = orderRequestDto.OrderLength * orderRequestDto.OrderHeight * orderRequestDto.OrderWidth * OrderTotalItems;

            if(string.IsNullOrEmpty(orderOrigin) || string.IsNullOrEmpty(orderDestination))
            {
                return (false,"provide valid origin and destination", null);
            }

            var truckType = await _truckRepo.GetTruckTypeAsync(orderRequestDto);
            Console.WriteLine($"-------=-=======-=-=-----=-==-Selected truck is: {truckType.TruckName}");
            if(truckType == null){
                truckType = await _truckRepo.GetOpenTrailerTruckAsync();
            }

            double kerbWeight = truckType.KerbWeight;
            double engineEff = truckType.EngineEfficiency;

            var orderDtoList = new List<OrderDto>();
            var gms = new GoogleMapsService(API_KEY);

            try
            {
                var routes = await gms.GetRoutePointsAsync(orderOrigin, orderDestination, API_KEY!);
                
                if(routes == null || routes.Count == 0)
                {
                    return (false, "No routes found for given destination from origin", null);
                }

                Console.WriteLine($"Found {routes.Count} distinct routes.");

                int routeIndex = 1;
                double leastDurationRoute = double.MaxValue;
                foreach(var r in routes)
                {
                    var route = r.Points;
                    var summary = r.Summary;
                    var routeDuration = r.Duration;

                    Console.WriteLine($"Duration for ROUTE::::::::::::: {routeDuration}");

                    Console.WriteLine($"\n--- Processing Route #{routeIndex} ---");
                    Console.WriteLine($"Decoded {route.Count} step-points from route.");
                    
                    double maxSegmentMeters = 50.0;
                    var densePoints = Geometry.Densify(route, maxSegmentMeters);
                    Console.WriteLine($"Densified to {densePoints.Count} points (max segment ~{maxSegmentMeters} m).");

                    Console.WriteLine("Fetching elevations for densified points (batch requests)...");
                    await gms.FillElevationAsync(densePoints);


                    double positiveGainMeters = 0.0;
                    for(int i = 0; i < densePoints.Count - 1; i++)
                    {
                        double dh = densePoints[i+1].Elevation - densePoints[i].Elevation;
                        if(dh > 0)
                        {
                            positiveGainMeters = positiveGainMeters + dh;
                        }
                    }

                    double massPerTonne = Physics.EffectiveMassPerTonne(kerbWeight, orderWeightKg);

                    Console.WriteLine("--- DEBUG Vals ---");
                    Console.WriteLine($"Mass per tonne (kg): {massPerTonne}");
                    Console.WriteLine($"TotalPositiveGain (m): {positiveGainMeters:F1}");
                    Console.WriteLine($"tareKg: {kerbWeight}, payloadTonnes: {orderWeightKg}");

                    Console.WriteLine($"LHV_J_per_L: {36e6}, engineEff: {0.40}, CO2_per_L: {2.70}");
                    Console.WriteLine("------------------");

                    var result = Physics.ComputeGradeCO2AndExport(densePoints, massPerTonne, engineEff);

                    double totalDistanceKm = densePoints.Sum(p => p.SegmentMeters) / 1000.0;
                    double totalLitersUsed = result.totalLiters_per_tonne * (orderWeightKg / 1000);
                    double totalKgCO2_per_tonne = result.totalKgCO2_per_tonne;

                    Console.WriteLine("------------------");
                    Console.WriteLine("------------------");

                    Console.WriteLine($"total distance: {totalDistanceKm}");
                    Console.WriteLine($"total liters: {totalLitersUsed}");
                    Console.WriteLine($"totalkgco2: {totalKgCO2_per_tonne}");

                    Console.WriteLine("------------------");
                    Console.WriteLine("------------------");


                    double averageMileage = totalDistanceKm / totalLitersUsed;

                    var orderDto = _mapper.Map<OrderDto>(orderRequestDto);


                    orderDto.OrderCO2Emission = Math.Round(result.totalKgCO2_per_tonne,2);
                    orderDto.SelectedRouteSummary = summary;
                    orderDto.OrderDistance = Math.Round(totalDistanceKm, 2);
                    orderDto.TransportVehicle = truckType.TruckName;
                    orderDto.TransportMode = "truck";
                    orderDto.OrderStatus = "processing";
                    orderDto.CompanyId = companyId;
                    orderDto.RouteDuration = routeDuration;

                    routeIndex++;

                    orderDtoList.Add(orderDto);
            }
            }
            catch(Exception e)
            {
                return (false, e.StackTrace, null);
            }

            return (true, "Carbon quotes obtained successfully", orderDtoList);
        }

        public async Task<(bool Success, string Message)> PlaceOrder(string companyName, OrderDto orderDto)
        {
            
            int companyId = await _companyRepo.GetCompanyIdByName(companyName);

            using var transaction = await _dbContext.Database.BeginTransactionAsync();

            var orderToDb = _mapper.Map<Order>(orderDto);

            orderToDb.CompanyId = companyId;

            await _orderRepo.AddOrdersAsync(orderToDb);
            await _orderRepo.SaveChangesAsync();

            await transaction.CommitAsync();

            return (true, "order has been placed successfully");
        }
    }
}
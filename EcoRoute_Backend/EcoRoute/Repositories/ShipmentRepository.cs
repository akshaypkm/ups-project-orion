using EcoRoute.Data;
using EcoRoute.Models;
using EcoRoute.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace EcoRoute.Repositories
{
    public interface IShipmentRepository
    {
        Task<int> GetTotalShipmentsCompanyAndDateWise(int companyId, DateTime ShipmentStartDate, DateTime ShipmentEndDate);

        Task<string> GetShipmentCodeByShipmentId(int shipmentId);


        
        // CONTRACTS FOR ADMIN

        Task<int> GetAdminDashTotalShipments(DateTime ShipmentStartDate, DateTime ShipmentEndDate);

        Task<int> GetSoFarReviewedShipmentCount();

        Task<List<Order>> GetShipmentsForReview();

        Task CreateShipment(OrderDto orderDto);
    }
    public class ShipmentRepository(EcoRouteDbContext dbContext) : IShipmentRepository
    {
        private readonly EcoRouteDbContext dbContext = dbContext;

        public async Task<int> GetTotalShipmentsCompanyAndDateWise(int companyId, DateTime ShipmentStartDate, DateTime ShipmentEndDate)
        {
            return await dbContext.Shipments.Where(s => s.OrderList.Any(o => o.CompanyId == companyId) 
                                            && s.ShipmentDate >= ShipmentStartDate && s.ShipmentDate <= ShipmentEndDate).CountAsync();
        }

        public async Task<string> GetShipmentCodeByShipmentId(int shipmentId)
        {
            string shipmentCode = await dbContext.Shipments.Where(s => s.Id == shipmentId)
                                            .Select(s => s.ShipmentCode).FirstOrDefaultAsync();

            Console.WriteLine($"shipment code: {shipmentCode}");
            return shipmentCode;
        }




        // METHODS FOR ADMIN

        public async Task<int> GetAdminDashTotalShipments(DateTime ShipmentStartDate, DateTime ShipmentEndDate)
        {
            return await dbContext.Shipments.Where(s => s.ShipmentDate >= ShipmentStartDate && s.ShipmentDate <= ShipmentEndDate).CountAsync();
        }

        public async Task<int> GetSoFarReviewedShipmentCount()
        {
            return await dbContext.Shipments.CountAsync();
        }

        public async Task<List<Order>> GetShipmentsForReview()
        {
            return await dbContext.Orders.Where(o => o.OrderStatus == "processing" 
                                        || o.OrderStatus == "planned").ToListAsync();
        }

        public async Task CreateShipment(OrderDto orderDto)
        {
            var shipmentToAdd = new Shipment()
            {
                ShipmentCO2Emission = orderDto.OrderCO2Emission,
                ShipmentDate = orderDto.OrderDate,
                ShipmentTotalItems = orderDto.OrderTotalItems,
                ShipmentWeightKg = orderDto.OrderWeightKg,
                ShipmentLength = orderDto.OrderLength,
                ShipmentWidth = orderDto.OrderWidth,
                ShipmentHeight= orderDto.OrderHeight,
                ShipmentOrgin = orderDto.OrderOrigin,
                ShipmentDestination = orderDto.OrderDestination,
                ShipmentDistance = orderDto.OrderDistance,
                Vehicle = orderDto.TransportVehicle
            };

            await dbContext.AddAsync(shipmentToAdd);
            await dbContext.SaveChangesAsync();
        }
    }
}
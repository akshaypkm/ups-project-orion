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

        Task<int> CreateShipment(OrderDto orderDto);

        Task<List<Shipment>> GetAllAdminShipmentsAsync();

        Task AddShipmentAsync(Shipment shipment);

        Task SaveChangesAsync();
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
                                        || o.OrderStatus == "planned").OrderByDescending(c => c.Id).ToListAsync();
        }

        public async Task<int> CreateShipment(OrderDto orderDto)
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

            int shipId = shipmentToAdd.Id;

            return shipId;
        }

        public async Task<List<Shipment>> GetAllAdminShipmentsAsync()
        {
            // Eager load OrderList and Company for each order
            return await dbContext.Shipments
                .Include(s => s.OrderList)
                    .ThenInclude(o => o.Company).OrderByDescending(c => c.Id)
                .ToListAsync();
        }

        public async Task AddShipmentAsync(Shipment shipment)
        {
            await dbContext.AddAsync(shipment);
        }

        public async Task SaveChangesAsync()
        {
            await dbContext.SaveChangesAsync();
        }
    }
}
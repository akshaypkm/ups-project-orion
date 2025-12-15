using EcoRoute.Data;
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
            return await dbContext.Orders.Where(o => o.OrderStatus == "processing").ToListAsync();
        }
    }
}
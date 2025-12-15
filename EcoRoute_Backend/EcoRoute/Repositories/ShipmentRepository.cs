using EcoRoute.Data;
using EcoRoute.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace EcoRoute.Repositories
{
    public interface IShipmentRepository
    {
        Task<int> GetTotalShipmentsCompanyAndDateWise(int companyId, DateTime ShipmentStartDate, DateTime ShipmentEndDate);
        Task<string> GetShipmentCodeByShipmentId(int shipmentId);
        Task<List<Shipment>> GetAllAdminShipmentsAsync();
    }

    public class ShipmentRepository : IShipmentRepository
    {
        private readonly EcoRouteDbContext dbContext;

        public ShipmentRepository(EcoRouteDbContext dbContext)
        {
            this.dbContext = dbContext;
        }

        public async Task<int> GetTotalShipmentsCompanyAndDateWise(int companyId, DateTime ShipmentStartDate, DateTime ShipmentEndDate)
        {
            return await dbContext.Shipments
                .Where(s => s.OrderList.Any(o => o.CompanyId == companyId) 
                            && s.ShipmentDate >= ShipmentStartDate 
                            && s.ShipmentDate <= ShipmentEndDate)
                .CountAsync();
        }

        public async Task<string> GetShipmentCodeByShipmentId(int shipmentId)
        {
            string shipmentCode = await dbContext.Shipments
                .Where(s => s.Id == shipmentId)
                .Select(s => s.ShipmentCode)
                .FirstOrDefaultAsync();

            Console.WriteLine($"shipment code: {shipmentCode}");
            return shipmentCode;
        }
        
        public async Task<List<Shipment>> GetAllAdminShipmentsAsync()
        {
            // Eager load OrderList and Company for each order
            return await dbContext.Shipments
                .Include(s => s.OrderList)
                    .ThenInclude(o => o.Company)
                .ToListAsync();
        }
    }
}

using EcoRoute.Data;
using Microsoft.EntityFrameworkCore;

namespace EcoRoute.Repositories
{
    public interface IShipmentRepository
    {
        Task<int> GetTotalShipmentsCompanyAndDateWise(int companyId, DateTime ShipmentStartDate, DateTime ShipmentEndDate);
    }
    public class ShipmentRepository(EcoRouteDbContext dbContext) : IShipmentRepository
    {
        private readonly EcoRouteDbContext dbContext = dbContext;

        public async Task<int> GetTotalShipmentsCompanyAndDateWise(int companyId, DateTime ShipmentStartDate, DateTime ShipmentEndDate)
        {
            return await dbContext.Shipments.Where(s => s.OrderList.Any(o => o.CompanyId == companyId) 
                                            && s.ShipmentDate >= ShipmentStartDate && s.ShipmentDate <= ShipmentEndDate).CountAsync();
        }

    }
}
using EcoRoute.Data;
using EcoRoute.Models.DTOs;
using Microsoft.EntityFrameworkCore;

namespace EcoRoute.Repositories
{

    public interface IEmissionRepository
    {
        Task<double> GetTotalEmissionsFromOrdersCompanyAndDateWise(int companyId, DateTime EmissionStartDate, DateTime EmisisonEndDate);
    
        Task<double> GetTotalEmissionsSavedFromOrdersCompanyAndDateWise(int companyId, DateTime EmissionsSavedStartDate, DateTime EmissionsSavedEndDate);

        Task<IEnumerable<MonthlyEmissionStatDto>> GetEmissionsDataForGraph(int companyId, DateTime GraphYearStart, DateTime GraphNowDate);
    }
    public class EmissionRepository : IEmissionRepository
    {
        private readonly EcoRouteDbContext dbContext;

        public EmissionRepository(EcoRouteDbContext dbContext)
        {
            this.dbContext = dbContext;
        }

        public async Task<double> GetTotalEmissionsFromOrdersCompanyAndDateWise(int companyId, DateTime EmissionStartDate, DateTime EmissionEndDate)
        {
            return await dbContext.Orders.Where(o => o.CompanyId == companyId && o.OrderDate >= EmissionStartDate 
                                                            && o.OrderDate <= EmissionEndDate && o.OrderStatus == "placed" )
                                                            .SumAsync(o => o.OrderCO2Emission);
        }

        public async Task<double> GetTotalEmissionsSavedFromOrdersCompanyAndDateWise(int companyId, DateTime EmissionsSavedStartDate, DateTime EmissionsSavedEndDate)
        {
            return await dbContext.Orders.Where(o => o.CompanyId == companyId && o.OrderDate >= EmissionsSavedStartDate
                                                            && o.OrderDate <= EmissionsSavedEndDate && o.OrderStatus == "placed")
                                                            .SumAsync(o => o.OrderStandardCO2Emissions - o.OrderCO2Emission);
        }

        public async Task<IEnumerable<MonthlyEmissionStatDto>> GetEmissionsDataForGraph(int companyId, DateTime GraphYearStart, DateTime GraphNowDate)
        {
            return await dbContext.Orders.Where(o => o.CompanyId == companyId 
                                                && o.OrderDate>= GraphYearStart && o.OrderDate <= GraphNowDate)
                                                    .GroupBy(o => o.OrderDate.Month)
                                                        .Select(s => new MonthlyEmissionStatDto
                                                        {
                                                            Month = s.Key,
                                                            TotalEmissions = s.Sum(s => s.OrderCO2Emission)
                                                        }).OrderBy(o => o.Month).ToListAsync();
        }
    }
}
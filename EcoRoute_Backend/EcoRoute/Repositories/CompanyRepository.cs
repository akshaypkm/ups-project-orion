using EcoRoute.Data;
using EcoRoute.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace EcoRoute.Repositories
{

    public interface ICompanyRepository
    {
        Task<bool> CompanyExistsByNameAsync(string CompanyName);

        Task<Company> GetCompanyByNameAsync(string CompanyName);

        Task AddCompanyAsync(Company company);

        Task SaveChangesAsync();

        Task<double> GetCompanyCreditsByNameAsync(string CompanyName);

        Task<int> GetCompanyIdByName(string CompanyName);

        Task<double> GetCompanyCreditsBySectorAsync(string CompanySector);
    }
    public class CompanyRepository : ICompanyRepository
    {
        private readonly EcoRouteDbContext dbContext;
        public CompanyRepository(EcoRouteDbContext dbContext)
        {
            this.dbContext = dbContext;
        }

        public async Task<Company> GetCompanyByNameAsync(string CompanyName)
        {
            return await dbContext.Companies.FirstOrDefaultAsync(c => c.CompanyName == CompanyName);
        }

        public async Task<bool> CompanyExistsByNameAsync(string CompanyName)
        {
            return await dbContext.Companies.AnyAsync(c => c.CompanyName == CompanyName);
        }

        public async Task AddCompanyAsync(Company company)
        {
            await dbContext.Companies.AddAsync(company);
        }

        public async Task SaveChangesAsync()
        {
            await dbContext.SaveChangesAsync();
        }

        public async Task<double> GetCompanyCreditsByNameAsync(string CompanyName)
        {
            return await dbContext.Companies.Where(c => c.CompanyName == CompanyName)
                                            .Select(c => c.CompanyCredits).FirstOrDefaultAsync();
        }

        public async Task<int> GetCompanyIdByName(string CompanyName)
        {
            return await dbContext.Companies.Where(c => c.CompanyName == CompanyName)
                                            .Select(c => c.Id).FirstOrDefaultAsync();
        }

        public async Task<double> GetCompanyCreditsBySectorAsync(string CompanySector)
        {
            return await dbContext.Credits.Where(c => c.Sector == CompanySector)
                                            .Select(c => c.SectorCredits).FirstOrDefaultAsync();
            
        }
    }
}

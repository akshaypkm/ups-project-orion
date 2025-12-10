using EcoRoute.Data;
using EcoRoute.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace EcoRoute.Repositories
{

    public interface ICompanyRepository
    {
        Task<bool> CompanyExistsByNameAsync(string CompanyName);

        Task AddCompanyAsync(Company company);

        Task SaveChangesAsync();

    }
    public class CompanyRepository : ICompanyRepository
    {
        private readonly EcoRouteDbContext dbContext;
        public CompanyRepository(EcoRouteDbContext dbContext)
        {
            this.dbContext = dbContext;
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
            dbContext.SaveChangesAsync();
        }
    }
}
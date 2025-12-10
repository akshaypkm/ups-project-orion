using EcoRoute.Data;
using EcoRoute.Models;
using EcoRoute.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace EcoRoute.Repositories
{
    public interface ICreditRepository
    {
        Task<double> GetCreditMarketPriceAsync();

        Task<List<CreditListingDto>> GetListingAsync(string CompanyName);

        Task AddCreditListingAsync(CreditListing creditListing);

        Task SaveChangesAsync();

        Task<CreditListing> GetCreditListingByIdAsync(int creditListingId);

        Task<int> GetCompanyIdByCreditListingId(int creditListingId);
    }
    public class CreditRepository(EcoRouteDbContext dbContext) : ICreditRepository
    {
        private readonly EcoRouteDbContext dbContext = dbContext;

        public async Task<double> GetCreditMarketPriceAsync()
        {
            return await dbContext.Credits.OrderByDescending(cr => cr.Id)
                                            .Select(cr => cr.CreditMarketPrice)
                                                .FirstOrDefaultAsync();
        } 

        public async Task<List<CreditListingDto>> GetListingAsync(string companyName)
        {
            var creditListings = await dbContext.CreditListings.
                                        Where(cl => cl.CompanyName != companyName
                                            && cl.Status == "available")
                                            .Select(cl => new CreditListingDto{
                                                SellerCompanyName = cl.CompanyName,
                                                CreditsListed = cl.CreditsListed,
                                                Status = cl.Status
                                            }).ToListAsync();
            return creditListings;
        }

        public async Task AddCreditListingAsync(CreditListing creditListing)
        {
            await dbContext.CreditListings.AddAsync(creditListing);
        }

        public async Task SaveChangesAsync()
        {
            await dbContext.SaveChangesAsync();
        }

        public async Task<CreditListing> GetCreditListingByIdAsync(int creditListingId)
        {
            return await dbContext.CreditListings.Where(cl => cl.Id == creditListingId).FirstOrDefaultAsync();
        }

        public async Task<int> GetCompanyIdByCreditListingId(int creditListingId)
        {
            return await dbContext.CreditListings.Where(cl => cl.Id == creditListingId)
                                                .Select(cl => cl.SellerCompanyId).FirstOrDefaultAsync();
        }
    }
}
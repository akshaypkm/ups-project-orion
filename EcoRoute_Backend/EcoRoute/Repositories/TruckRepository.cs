using EcoRoute.Data;
using EcoRoute.Models;
using EcoRoute.Models.DTOs;
using EcoRoute.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace EcoRoute.Repositories
{
    public interface ITruckRepository
    {
        Task<List<TruckType>> GetTruckTypeAsync(double OrderWeightKg);

        Task<TruckType> GetOpenTrailerTruckAsync();
    }
    public class TruckRepository(EcoRouteDbContext dbContext) : ITruckRepository
    {
        public readonly EcoRouteDbContext dbContext = dbContext;

        public async Task<List<TruckType>> GetTruckTypeAsync(double OrderWeightKg)
        {   
            return await dbContext.TruckTypes.Where(t => t.MaxPayloadKg >= OrderWeightKg)
                                                .OrderBy(t => t.MaxPayloadKg)
                                                    .ToListAsync();
        }

        public async Task<TruckType> GetOpenTrailerTruckAsync()
        {
            return await dbContext.TruckTypes.Where(t => t.CargoHeightMeters == 4).FirstOrDefaultAsync();
        }
    }
}
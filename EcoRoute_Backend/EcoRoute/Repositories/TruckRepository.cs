using EcoRoute.Data;
using EcoRoute.Models;
using EcoRoute.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace EcoRoute.Repositories
{
    public interface ITruckRepository
    {
        Task<TruckType> GetTruckTypeAsync(OrderRequestDto orderRequestDto);

        Task<TruckType> GetOpenTrailerTruckAsync();
    }
    public class TruckRepository(EcoRouteDbContext dbContext) : ITruckRepository
    {
        public readonly EcoRouteDbContext dbContext = dbContext;

        public async Task<TruckType> GetTruckTypeAsync(OrderRequestDto orderRequestDto)
        {   
            double orderTotalVolume = orderRequestDto.OrderLength * orderRequestDto.OrderHeight * orderRequestDto.OrderWidth * orderRequestDto.OrderTotalItems;

            return await dbContext.TruckTypes.Where(t => t.MaxPayloadKg > orderRequestDto.OrderWeightKg && 
                                                                (t.CargoHeightMeters * t.CargoLengthMeters * t.CargoWidthMeters * 0.90) 
                                                                    > orderTotalVolume &&
                                                                        t. CargoHeightMeters > orderRequestDto.OrderHeight &&
                                                                            ((t.CargoLengthMeters > orderRequestDto.OrderLength && 
                                                                                t.CargoWidthMeters > orderRequestDto.OrderWidth) || 
                                                                                    t.CargoLengthMeters > orderRequestDto.OrderWidth && 
                                                                                        t.CargoWidthMeters > orderRequestDto.OrderLength))   
                                                                                            .OrderBy(t => t.MaxPayloadKg)
                                                                                                .FirstOrDefaultAsync();
        }

        public async Task<TruckType> GetOpenTrailerTruckAsync()
        {
            return await dbContext.TruckTypes.Where(t => t.CargoHeightMeters == 4 
                                                                ).FirstOrDefaultAsync();
        }
    }
}
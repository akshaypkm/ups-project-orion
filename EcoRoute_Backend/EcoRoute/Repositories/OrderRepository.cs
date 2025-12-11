using System.ComponentModel.DataAnnotations;
using EcoRoute.Data;
using EcoRoute.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace EcoRoute.Repositories
{

    public interface IOrderRepository
    {
        Task AddOrdersAsync(Order order);
        Task SaveChangesAsync();
        IQueryable<Order> GetOrdersByCompanyId(int companyId);
        Task<IEnumerable<Order>> GetOrderByDateRange(DateTime startDate, DateTime endDate);
    }
    public class OrderRepository(EcoRouteDbContext dbContext) : IOrderRepository
    {
        private readonly EcoRouteDbContext dbContext = dbContext;
        public async Task AddOrdersAsync(Order order)
        {
            await dbContext.Orders.AddAsync(order);
        }

        public async Task SaveChangesAsync()
        {
            await dbContext.SaveChangesAsync();
        }

        public IQueryable<Order> GetOrdersByCompanyId(int companyId)
        {
            return dbContext.Orders.Where(o => o.CompanyId == companyId);
        }

        public async Task<IEnumerable<Order>> GetOrderByDateRange(DateTime startDate, DateTime endDate)
        {
            return await dbContext.Orders.Where(o => o.OrderDate >= startDate && o.OrderDate <= endDate).ToListAsync();
        }
    }
}
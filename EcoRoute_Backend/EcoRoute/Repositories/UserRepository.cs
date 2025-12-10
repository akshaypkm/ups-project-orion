using System.Data.Common;
using EcoRoute.Data;
using EcoRoute.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace EcoRoute.Repositories
{

    public interface IUserRepository
    {
        Task<IEnumerable<User>> GetAllUsersAsync();
        Task<User?> GetUserByIdAsync(string UserId);

        Task<bool> UserExistsAsync(string UserId);

        Task AddUserAsync(User user);

        Task SaveChangesAsync();
        // void InsertUser();
        
    }
    public class UserRepository : IUserRepository
    {
        private readonly EcoRouteDbContext dbContext;
        public UserRepository(EcoRouteDbContext dbContext)
        {
            this.dbContext = dbContext;
        }

        public async Task<IEnumerable<User>> GetAllUsersAsync()
        {
            return await dbContext.Users.ToListAsync();
        }

        public async Task<User?> GetUserByIdAsync(string UserId)
        {
            return await dbContext.Users.Where(u => u.UserId == UserId).FirstOrDefaultAsync();
        }

        public async Task<bool> UserExistsAsync(string UserId)
        {
            return await dbContext.Users.AnyAsync(u => u.UserId == UserId);
        }

        public async Task AddUserAsync(User user)
        {
            await dbContext.Users.AddAsync(user);
        }

        public async Task SaveChangesAsync()
        {
            await dbContext.SaveChangesAsync();
        }
    }
}
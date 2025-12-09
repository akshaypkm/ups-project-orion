using System.Net;
using EcoRoute.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace EcoRoute.Data
{
    public class EcoRouteDbContext : DbContext
    {
        public EcoRouteDbContext(DbContextOptions options) : base(options)
        {
            
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Company>()
                .Property(s => s.CompanyCode)
                .HasComputedColumnSql("'COMP-' + CAST(Id AS NVARCHAR(20))", stored: true);

            modelBuilder.Entity<Order>()
            .Property(s => s.OrderCode)
            .HasComputedColumnSql("'ODR-' + CAST(Id AS NVARCHAR(20))", stored: true);

            modelBuilder.Entity<Shipment>()
            .Property(s => s.ShipmentCode)
            .HasComputedColumnSql("'SHIP-' + CAST(Id AS NVARCHAR(20))", stored: true);
        }

        public DbSet<User> Users{get; set;}

        public DbSet<Company> Companies{get; set;}

        public DbSet<Order> Orders{get; set;}

        public DbSet<Shipment> Shipments{get; set;}

        public DbSet<CreditListing> CreditListings{get; set;}

        public DbSet<Credit> Credits{get; set;}

        public DbSet<TruckType> TruckTypes{get; set;}
    }
}
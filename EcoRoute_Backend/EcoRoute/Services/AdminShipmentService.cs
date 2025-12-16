using EcoRoute.Models;
using EcoRoute.Models.DTOs;
using EcoRoute.Repositories;
using Microsoft.EntityFrameworkCore;

namespace EcoRoute.Services
{
    public interface IAdminShipmentService
    {
        Task<List<AdminShipmentDto>> GetAllCompanyShipmentsAsync();
    }

    public class AdminShipmentService : IAdminShipmentService
    {
        private readonly IShipmentRepository _shipmentRepository;

        public AdminShipmentService(IShipmentRepository shipmentRepository)
        {
            _shipmentRepository = shipmentRepository;
        }

        public async Task<List<AdminShipmentDto>> GetAllCompanyShipmentsAsync()
        {
            // Directly get DTOs from repository
            var dtoList = await _shipmentRepository.GetAllAdminShipmentsAsync()
                .ContinueWith(task => task.Result
                    .Select(s => new AdminShipmentDto
                    {
                        ShipmentCode = s.ShipmentCode,
                        ShipmentDate = s.ShipmentDate,
                        CompanyName = s.OrderList.FirstOrDefault()?.Company?.CompanyName ?? string.Empty,
                        ShipmentOrigin = s.ShipmentOrgin,
                        ShipmentDestination = s.ShipmentDestination,
                        ShipmentTotalItems = s.OrderList.Sum(o => o.OrderTotalItems),
                        ShipmentCO2Emission = s.ShipmentCO2Emission,
                        ShipmentStatus = s.OrderList.FirstOrDefault()?.OrderStatus ?? string.Empty
                    }).ToList()
                );

            return dtoList;
        }
    }
}
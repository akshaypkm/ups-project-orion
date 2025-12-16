using AutoMapper;
using EcoRoute.Models;
using EcoRoute.Repositories;

namespace EcoRoute.Services
{

    public interface IAdminShipmentReviewService
    {
        Task<List<OrderDto>> GetShipmentsForReview();
    }
    public class AdminShipmentReviewService : IAdminShipmentReviewService
    {
        private readonly IShipmentRepository _shipmentRepo;

        private readonly IMapper _mapper;
        public AdminShipmentReviewService(IShipmentRepository _shipmentRepo, IMapper _mapper)
        {
            this._shipmentRepo = _shipmentRepo;
            this._mapper = _mapper;
        }
        
        public async Task<List<OrderDto>> GetShipmentsForReview()
        {
            var orderDtos = new List<OrderDto>();


            var orders = await _shipmentRepo.GetShipmentsForReview();

            foreach(var order in orders)
            {
                var orderDto = _mapper.Map<OrderDto>(order);

                orderDtos.Add(orderDto);
            }

            return orderDtos;
        }
    }
}
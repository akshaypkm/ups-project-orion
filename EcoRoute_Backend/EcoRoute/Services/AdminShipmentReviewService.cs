using AutoMapper;
using EcoRoute.Models;
using EcoRoute.Models.HelperClasses;
using EcoRoute.Repositories;

namespace EcoRoute.Services
{

    public interface IAdminShipmentReviewService
    {
        Task<List<OrderDto>> GetShipmentsForReview();

        Task ApproveShipment(OrderDto orderDto);

        Task CancelShipment(OrderDto orderDto);
    }
    public class AdminShipmentReviewService : IAdminShipmentReviewService
    {
        private readonly IShipmentRepository _shipmentRepo;
        private readonly IOrderRepository _orderRepo;
        private readonly INotificationRepository _notifRepo;

        private readonly IMapper _mapper;
        public AdminShipmentReviewService(IShipmentRepository _shipmentRepo, IMapper _mapper
                                        , IOrderRepository _orderRepo, INotificationRepository _notifRepo)
        {
            this._shipmentRepo = _shipmentRepo;
            this._mapper = _mapper;
            this._orderRepo = _orderRepo;
            this._notifRepo = _notifRepo;
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

        public async Task ApproveShipment(OrderDto orderDto)
        {
            string status = "placed";
            
            int shipId = await _shipmentRepo.CreateShipment(orderDto);

            await _orderRepo.ChangeOrderStatus(orderDto.OrderId, status);
            await _orderRepo.InsertShipmentIdInOrder(orderDto.OrderId, shipId);

            var notification = new Notification(){
                Message = $"Your order for ID({orderDto.OrderCode}) from {orderDto.OrderOrigin} -> {orderDto.OrderDestination} has been placed successfully!",
                IsRead = false,
                TargetCompanyId = orderDto.CompanyId
            };

            await _notifRepo.AddNotificationAsync(notification);
            await _notifRepo.SaveChangesAsync();
        }

        public async Task CancelShipment(OrderDto orderDto)
        {
            string status = "cancelled";
            await _orderRepo.ChangeOrderStatus(orderDto.OrderId, status);
             
            var notification = new Notification(){
                Message = $"Your order for ID({orderDto.OrderCode}) from {orderDto.OrderOrigin} -> {orderDto.OrderDestination} has been cancelled by the admin",
                IsRead = false,
                TargetCompanyId = orderDto.CompanyId
            };

            await _notifRepo.AddNotificationAsync(notification);
            await _notifRepo.SaveChangesAsync();
        }
    }
}
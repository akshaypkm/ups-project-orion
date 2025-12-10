using AutoMapper;
using EcoRoute.Models;
using EcoRoute.Repositories;
using Microsoft.EntityFrameworkCore;

namespace EcoRoute.Services
{
    public interface IClientShipmentHistoryService
    {
        Task<List<OrderHistoryDto>> GetShipmentHistory(string companyName, string OrderPeriod = "month", string Filter = "bySavings");
    }
    public class ClientShipmentHistoryService : IClientShipmentHistoryService
    {
        private readonly ICompanyRepository _companyRepo;
        private readonly IOrderRepository _orderRepo;
        private readonly IShipmentRepository _shipmentRepo;
        private readonly IMapper _mapper;
        public ClientShipmentHistoryService(ICompanyRepository _companyRepo, IOrderRepository _orderRepo
                                            ,IShipmentRepository _shipmentRepo, IMapper _mapper)
        {
            this._companyRepo = _companyRepo;
            this._orderRepo = _orderRepo;
            this._shipmentRepo = _shipmentRepo;
            this._mapper = _mapper;
        }
        public async Task<List<OrderHistoryDto>> GetShipmentHistory(string companyName, string OrderPeriod = "month", string Filter = "bySavings")
        {
            var company = await _companyRepo.GetCompanyByNameAsync(companyName);

            var query = _orderRepo.GetOrdersByCompanyId(company.Id);

            DateTime OrderStartDate;
            DateTime OrderEndDate = DateTime.Now;

            switch (OrderPeriod.ToLower())
            {
                case "year":
                    OrderStartDate = new DateTime(DateTime.Now.Year, 1, 1);
                    break;
                case "day":
                    OrderStartDate = DateTime.Today;
                    break;
                case "month":
                default:
                    OrderStartDate = new DateTime(DateTime.Now.Year, DateTime.Now.Month, 1);
                    break;
            }

            query = query.Where(o => o.OrderDate >= OrderStartDate && o.OrderDate <= OrderEndDate);
            
            switch (Filter.ToLower())
            {
                case "bySavings":
                    query = query.OrderByDescending(o => o.OrderEmissionsSaved);
                    break;
                case "byOrderCO2Emissions":
                    query = query.OrderByDescending(o => o.OrderCO2Emission);
                    break;
                case "byDistance":
                    query = query.OrderByDescending(o => o.OrderDistance);
                    break;
                case "byWeight":
                    query = query.OrderByDescending(o => o.OrderWeightKg);
                    break;
                case "byQuantity":
                    query = query.OrderByDescending(o => o.OrderTotalItems);
                    break;
                case "byDate":
                default:
                    query = query.OrderByDescending(o => o.OrderDate);
                    break;
            }

            var orders = await query.ToListAsync();

            List<OrderHistoryDto> orderHistoryDtos = new List<OrderHistoryDto>();
            
            foreach(var order in orders)
            {
                string shipmentCode;
                if(order.ShipmentId == null)
                {
                    shipmentCode = "-";
                }
                shipmentCode = await _shipmentRepo.GetShipmentCodeByShipmentId((int) order.ShipmentId);
            
                var orderHistoryDto = _mapper.Map<OrderHistoryDto>(order);
                orderHistoryDto.ShipmentCode = shipmentCode;

                orderHistoryDtos.Add(orderHistoryDto);            
            }

            return orderHistoryDtos;
        }
    }
}
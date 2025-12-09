using System.Security.Claims;
using EcoRoute.Data;
using EcoRoute.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EcoRoute.Controllers
{
    [Route("api/client-shipment-history")]
    [ApiController]
    public class ClientShipmentHistoryController : ControllerBase
    {
        private readonly EcoRouteDbContext dbContext;

        public ClientShipmentHistoryController(EcoRouteDbContext dbContext)
        {
            this.dbContext = dbContext;
        }


        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetShipmentHistory([FromQuery] string OrderPeriod = "month", string Filter = "bySavings")
        {
            var userIdFromToken = User.FindFirst(ClaimTypes.Name)?.Value;

            var companyClaim = User.FindFirst("CompanyName");

            if(companyClaim == null)
            {
                return Unauthorized("token is missing the right company name");
            }

            string companyName = companyClaim.Value;

            var company = await dbContext.Companies.Where(c => c.CompanyName == companyName)
                                                    .FirstOrDefaultAsync();

            var query = dbContext.Orders.Where(o => o.CompanyId == company!.Id);
            
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
                var shipmentCode = await dbContext.Shipments.Where(s => s.Id == order.ShipmentId)
                                                            .Select(s => s.ShipmentCode).FirstOrDefaultAsync();

                if(shipmentCode == null)
                {
                    shipmentCode = "-";
                }
                var orderHistoryDto = new OrderHistoryDto
                {
                    ShipmentCode = shipmentCode,
                    OrderDate = order.OrderDate,
                    OrderOrigin = order.OrderOrigin,
                    OrderDestination = order.OrderDestination,
                    OrderTotalItems = order.OrderTotalItems,
                    OrderWeightKg = order.OrderWeightKg,
                    OrderCO2Emission = order.OrderCO2Emission,
                    OrderEmissionsSaved = order.OrderEmissionsSaved
                };

                orderHistoryDtos.Add(orderHistoryDto);
            }

            return Ok(orderHistoryDtos);
        }
    }
}
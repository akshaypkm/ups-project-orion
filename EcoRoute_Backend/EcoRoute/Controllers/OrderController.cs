using EcoRoute.Data;
using EcoRoute.Models;
using EcoRoute.Models.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EcoRoute.Controllers
{
    [Route("api/client-placeorder")]
    [ApiController]
    public class OrderController : ControllerBase
    {   
        private readonly EcoRouteDbContext dbContext;

        public OrderController(EcoRouteDbContext dbContext)
        {
            this.dbContext = dbContext;
        }

        [HttpPost]
        public async Task<IActionResult> PlaceOrder([FromBody] OrderDto orderDto)
        {

            // if(await dbContext.Orders.FirstAsync(o => o.OrderCode == orderDto.))
            
            var order = new Order
            {
                OrderCO2Emission = orderDto.OrderCo2Emission,
                SelectedRouteSummary = orderDto.SelectedRouteSummary,
                SelectedPolyline = orderDto.SelectedPolyline,
                OrderDistance = orderDto.OrderDistance,
                OrderWeightKg = orderDto.OrderWeightKg,
                OrderTotalItems = orderDto.OrderTotalItems,
                OrderOrigin = orderDto.OrderOrigin,
                OrderDestination = orderDto.OrderDestination,
                OrderStatus = orderDto.OrderStatus,
                OrderNature = orderDto.OrderNature,
                OrderMode = orderDto.OrderMode,
                IsRefrigerated = orderDto.IsRefrigerated,
                CompanyId = orderDto.CompanyId
            };
            
            await dbContext.Orders.AddAsync(order);
            await dbContext.SaveChangesAsync();

            return Ok("Order is placed!");
        }
        
    }
}
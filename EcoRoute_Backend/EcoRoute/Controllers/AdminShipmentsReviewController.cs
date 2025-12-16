using EcoRoute.Models;
using EcoRoute.Repositories;
using EcoRoute.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EcoRoute.Controllers
{

    [Route("api/admin-shipments-review")]
    [Authorize]
    public class AdminShipmentsReviewController : ControllerBase
    {
        private readonly IAdminShipmentReviewService _adminShipmentReviewService;
        private readonly IOrderRepository _orderRepo;

        public AdminShipmentsReviewController(IAdminShipmentReviewService _adminShipmentReviewService,
                                            IOrderRepository _orderRepo)
        {
            this._adminShipmentReviewService = _adminShipmentReviewService;
            this._orderRepo = _orderRepo;
        }

        [HttpGet("get-review-shipments")]
        [Authorize]
        public async Task<IActionResult> GetShipmentsForReview()
        {
            var result = await _adminShipmentReviewService.GetShipmentsForReview();


            return Ok(result);
        }

        [HttpPost("approve")]
        public async Task<IActionResult> ApproveShipment([FromBody] OrderDto orderDto)
        {

            await _adminShipmentReviewService.ApproveShipment(orderDto);

            return Ok("inserted shipment and updated order status");
        }

        [HttpPost("cancel")]
        public async Task<IActionResult> CancelShipment([FromBody] OrderDto orderDto)
        {
            
            await _adminShipmentReviewService.CancelShipment(orderDto);

            return Ok();
        }
    }
}
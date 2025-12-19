using EcoRoute.Models;
using EcoRoute.Repositories;
using EcoRoute.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EcoRoute.Controllers
{

    [Route("api/admin-shipments-review")]
    [ApiController]
    [Authorize(Roles = "admin")]
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

        [HttpPost("improvise-shipment")]
        public async Task<IActionResult> ImproviseShipment([FromBody] List<OrderDto> orderDtos)
        {
            var result = await _adminShipmentReviewService.ImproviseShipments(orderDtos);
            return Ok(result);
        }

        [HttpPost("improvise-shipment-approve")]
        public async Task<IActionResult> ApproveGroup([FromBody] List<OrderDto> orderDtos)
        {
            foreach(var orderDto in orderDtos)
            {
                await _adminShipmentReviewService.ApproveShipment(orderDto);
            }

            return Ok("order statuses changed");
        }

    }
}
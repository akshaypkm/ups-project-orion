using EcoRoute.Models;
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

        public AdminShipmentsReviewController(IAdminShipmentReviewService _adminShipmentReviewService)
        {
            this._adminShipmentReviewService = _adminShipmentReviewService;
        }

        [HttpGet("/get-review-shipments")]
        [Authorize]
        public async Task<IActionResult> GetShipmentsForReview()
        {
            var result = await _adminShipmentReviewService.GetShipmentsForReview();


            return Ok(result);
        }
    }
}
using System.Security.Claims;
using EcoRoute.Data;
using EcoRoute.Models;
using EcoRoute.Models.Entities;
using EcoRoute.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RouteAttribute = Microsoft.AspNetCore.Mvc.RouteAttribute;
namespace EcoRoute.Controllers
{
    [Route("api/admin/shipments")]
    [ApiController]
    public class AdminShipmentController : ControllerBase
    {
        private readonly IAdminShipmentService _AdminShipmentService;

        public AdminShipmentController(IAdminShipmentService shipmentService)
        {
            _AdminShipmentService = shipmentService;
        }

        [HttpGet]
        [Authorize]
        public async Task<ActionResult<List<AdminShipmentDto>>> GetAllCompanyNamesOfShipmentCodes()
        {
            var companyClaim = User.FindFirst("CompanyName");
            if (companyClaim == null)
            {
                return Unauthorized("Token does not contain CompanyName");
            }
            var result = await _AdminShipmentService.GetAllCompanyShipmentsAsync();
            return Ok(result);
        }
    }
    
}
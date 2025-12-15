using System.Security.Claims;
using EcoRoute.Data;
using EcoRoute.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EcoRoute.Controllers
{
    [Route("api/admin-dashboard")]
    [ApiController]
    public class AdminDashboardController : ControllerBase
    {
        private readonly IAdminDashboardService _adminDashboardService;

        public AdminDashboardController(IAdminDashboardService _adminDashboardService)
        {
            this._adminDashboardService = _adminDashboardService;
        }

        [HttpGet("stats")]
        [Authorize]
        public async Task<ActionResult> GetDashboardStatAsync([FromQuery] string EmissionsPeriod = "month", string ShipmentsPeriod = "month", string EmissionsSavedPeriod = "year")
        {
            var userIdFromToken = User.FindFirst(ClaimTypes.Name)?.Value;

            if(userIdFromToken == null)
            {
                return BadRequest("User does not exist");
            }

            var adminDashDto = await _adminDashboardService.GetDashboardStat(EmissionsPeriod, ShipmentsPeriod, EmissionsSavedPeriod);

            return Ok(adminDashDto);
        } 
    }
}
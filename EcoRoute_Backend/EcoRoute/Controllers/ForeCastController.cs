using System.Security.Claims;
using EcoRoute.Models.DTOs;
using EcoRoute.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EcoRoute.Controllers
{
    [Route("api/forecast")]
    [ApiController]
    [Authorize]
    public class ForecastController : ControllerBase
    {
        private readonly IForeCastService _forecastService;

        public ForecastController(IForeCastService forecastService)
        {
            _forecastService = forecastService;
        }
        [HttpGet("company")]
        public async Task<ActionResult<ForecastDto>> GetCompanyForecast([FromQuery] DateTime? asOfDate)
        {
            var companyClaim = User.FindFirst("CompanyName");
            if (companyClaim == null)
            {
                return Unauthorized("Token does not contain CompanyName");
            }
            string companyName = companyClaim.Value;
            DateTime effectiveDate = asOfDate ?? DateTime.Today;
            var forecastResult =await _forecastService.GetCompanyEmissionForecastAsync(companyName,effectiveDate);
            return Ok(forecastResult);
        }
    }
}

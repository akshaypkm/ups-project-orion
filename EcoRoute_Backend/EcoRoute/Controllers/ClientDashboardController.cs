using System.Linq;
using System.Security.Claims;
using EcoRoute.Data;
using EcoRoute.Models;
using EcoRoute.Models.Entities;
using EcoRoute.Models.HelperClasses;
using EcoRoute.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EcoRoute.Controllers
{
    [Route("api/client-dashboard")]
    [ApiController]
    public class ClientDashboardController : ControllerBase
    {
        
        private readonly IClientDashboardService _clientDashboardService; 
        public ClientDashboardController(IClientDashboardService _clientDashboardService)
        {
            this._clientDashboardService = _clientDashboardService;
        }

        [HttpGet("stats")]
        [Authorize(Roles = "Client")]
        public async Task<IActionResult> GetDashboardStat([FromQuery] string EmissionPeriod, [FromQuery] string ShipmentPeriod,[FromQuery] string EmissionsSavedPeriod)
        {
            var userRole = User.FindFirst("role");

            // if(userRole?.Value == "admin")
            // {
            //     return NotFound("Page not found");
            // }

            var userIdFromToken = User.FindFirst(ClaimTypes.Name)?.Value;

            var companyClaim = User.FindFirst("CompanyName");

            if(companyClaim == null)
            {
                return Unauthorized("token is missing the right company name");
            }

            string companyName = companyClaim.Value;
            
            var returnDto = await _clientDashboardService.GetClientDashboardStatAsync(companyName, EmissionPeriod, ShipmentPeriod, EmissionsSavedPeriod);
            
            if(returnDto.clientDashboardDto == null)
            {
                return BadRequest("company data not found");
            }

            return Ok(returnDto.clientDashboardDto);
        }

        [HttpGet("emissionscreditsystem")]
        public async Task<ActionResult> GetEmissionsCreditSystem()
        {           
            double creditMarketPrice = await _clientDashboardService.GetCreditMarketPrice();
            
            return Ok(creditMarketPrice);
        }   

        [HttpGet("emissionscreditsystem/listings")]
        public async Task<ActionResult<List<CreditListingDto>>> GetListing()
        {
            var companyClaim = User.FindFirst("CompanyName");

            if(companyClaim == null)
            {
                return Unauthorized("token is missing the right company name");
            }

            string companyName = companyClaim.Value;
            
            var creditListings = await _clientDashboardService.GetListing(companyName);

            return creditListings;
        }

        [HttpPost("emissionscreditsystem/sale")]
        public async Task<IActionResult> PutSale([FromBody] double saleUnits)
        {
            
            var companyClaim = User.FindFirst("CompanyName");

            if(companyClaim == null)
            {
                return Unauthorized("token is missing the right company name");
            }

            string companyName = companyClaim.Value;

            var res = await _clientDashboardService.PutSale(companyName, saleUnits);

            if (!res.Success)
            {
                return BadRequest($"Sale transaction failed: {res.Message}");
            }

            return Ok("Sale transaction placed successfully");
        }

        [HttpPut("emissionscreditsystem/buy")]
        public async Task<IActionResult> BuyOrder([FromBody] BuyCreditDto buyCreditDto)
        {

            var companyClaim = User.FindFirst("CompanyName");

            if(companyClaim == null)
            {
                return Unauthorized("token is missing the right company name");
            }

            string companyName = companyClaim.Value;

            var res = await _clientDashboardService.BuyCredits(companyName, buyCreditDto);

            if (!res.Success)
            {
                return BadRequest($"failed with error: {res.Message}");
            }

            return Ok("trade successful");
        }

        [HttpGet("notifications")]
        public async Task<ActionResult<List<Notification>>> ShowNotifications()
        {
            var companyClaim = User.FindFirst("CompanyName");

            if(companyClaim == null)
            {
                return Unauthorized("token is missing the right company name");
            }

            string companyName = companyClaim.Value;

            var notifications = await _clientDashboardService.ShowNotifications(companyName);

            return notifications;
        } 
    }
}
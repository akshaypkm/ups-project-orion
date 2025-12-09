using System.Linq;
using System.Security.Claims;
using EcoRoute.Data;
using EcoRoute.Models;
using EcoRoute.Models.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EcoRoute.Controllers
{
    [Route("api/client-dashboard")]
    [ApiController]
    public class ClientDashboardController : ControllerBase
    {
        
        private readonly EcoRouteDbContext dbContext;

        public ClientDashboardController(EcoRouteDbContext dbContext)
        {
            this.dbContext = dbContext;
        }

        [HttpGet("stats")]
        [Authorize]
        public async Task<IActionResult> GetDashboardStat([FromQuery] string EmissionPeriod, string ShipmentPeriod, string EmissionsSavedPeriod)
        {
            
            var userIdFromToken = User.FindFirst(ClaimTypes.Name)?.Value;

            var companyClaim = User.FindFirst("CompanyName");

            if(companyClaim == null)
            {
                return Unauthorized("token is missing the right company name");
            }

            string companyName = companyClaim.Value;

            var company = await dbContext.Companies.Where(c => c.CompanyName == companyName).FirstAsync();
            
            if(company == null)
            {
                return NotFound($"Company not found");
            }

            DateTime EmissionStartDate;
            DateTime EmissionEndDate = DateTime.Now;

            DateTime ShipmentStartDate;
            DateTime ShipmentEndDate = DateTime.Now;

            DateTime EmissionsSavedStartDate;
            DateTime EmissionsSavedEndDate = DateTime.Now;

            switch (EmissionPeriod.ToLower())
            {
                case "year":
                    EmissionStartDate = new DateTime(DateTime.Now.Year, 1, 1);
                    break;
                case "day":
                    EmissionStartDate = DateTime.Today;
                    break;
                case "month":
                default:
                    EmissionStartDate = new DateTime(DateTime.Now.Year, DateTime.Now.Month, 1);
                    break;
            }

            switch (ShipmentPeriod.ToLower())
            {
                case "year":
                    ShipmentStartDate = new DateTime(DateTime.Now.Year, 1, 1);
                    break;
                case "day":
                    ShipmentStartDate = DateTime.Today;
                    break;
                case "month":
                default:
                    ShipmentStartDate = new DateTime(DateTime.Now.Year, DateTime.Now.Month, 1);
                    break;
            }

            switch (EmissionsSavedPeriod.ToLower())
            {
                case "year":
                    EmissionsSavedStartDate = new DateTime(DateTime.Now.Year, 1, 1);
                    break;
                case "day":
                    EmissionsSavedStartDate = DateTime.Today;
                    break;
                case "month":
                default:
                    EmissionsSavedStartDate = new DateTime(DateTime.Now.Year, DateTime.Now.Month, 1);
                    break;
            }            

            var totalEmissions = await dbContext.Orders.Where(o => o.CompanyId == company.Id && o.OrderDate >= EmissionStartDate 
                                                            && o.OrderDate <= EmissionEndDate && o.OrderStatus == "placed" )
                                                            .SumAsync(o => o.OrderCO2Emission);

            var totalShipments = await dbContext.Shipments.Where(s => s.OrderList.Any(o => o.CompanyId == company.Id) 
                                            && s.ShipmentDate >= ShipmentStartDate && s.ShipmentDate <= ShipmentEndDate).CountAsync();

            var emissionsSaved = await dbContext.Orders.Where(o => o.CompanyId == company.Id && o.OrderDate >= EmissionsSavedStartDate
                                                            && o.OrderDate <= EmissionsSavedEndDate && o.OrderStatus == "placed")
                                                            .SumAsync(o => o.OrderStandardCO2Emissions - o.OrderCO2Emission);

            var totalForecastedEmissions = await CalculateTotalForecastedEmissions(company.Id); // USED IN THE SECTION BELOW EMISSION CREDIT SYSTEM

            var forecastedEmissions = await CalculateForecastedEmissions(company.Id); // USED IN EMISSION CREDIT SYSTEM

            // var emissionsSaved = await CalculateSavedEmissions
            DateTime yearStart = new(DateTime.Now.Year,1,1);
            DateTime nowDate = DateTime.Now;

            var rawData = await dbContext.Orders
                                    .Where(o => o.CompanyId == company.Id 
                                        && o.OrderDate >= yearStart && o.OrderDate <= nowDate)
                                            .GroupBy(o => o.OrderDate.Month)
                                                .Select(s => new
                                                    {
                                                        Month = s.Key,
                                                        TotalEmissions = s.Sum( o => o.OrderCO2Emission)
                                                    }).ToListAsync();
            
            double[] finalGraphData = new double[12];

            foreach(var rd in rawData)
            {
                finalGraphData[rd.Month - 1] = rd.TotalEmissions;
            }      

            var creditMarketPrice = await dbContext.Credits
                                            .OrderByDescending(cr => cr.Id)
                                                .Select(cr => cr.CreditMarketPrice).FirstAsync();

            var returnDto = new ClientDashboardDto{
                CompanyCode = company.CompanyCode,
                Shipments = totalShipments,
                CompanyCredits = company.CompanyCredits,
                CreditMarketPrice = creditMarketPrice, 
                TotalEmissions = totalEmissions,
                ForecastedEmissions = forecastedEmissions,
                TotalForecastedEmissions = totalForecastedEmissions, 
                EmissionsSaved = emissionsSaved, 
                GraphData = finalGraphData
            };
            
            return Ok(returnDto);
        }

        private async Task<double> CalculateTotalForecastedEmissions(int companyId)
        {
            
            
            return 10.00;
        }

        private async Task<double> CalculateForecastedEmissions(int companyId)
        {
            return 10.00;
        }

        [HttpGet("emissionscreditsystem")]
        public async Task<IActionResult> GetEmissionsCreditSystem()
        {   

            var creditMarketPrice = await (from c in dbContext.Credits
                                                        orderby c.LatestDate descending
                                                            select c.CreditMarketPrice).FirstAsync();

            
            return Ok(creditMarketPrice);
        }   

        [HttpGet("emissionscreditsystem/listings")]
        public async Task<ActionResult<List<CreditListingDto>>> GetListing()
        {

            var creditListings = await (from cr in dbContext.CreditListings
                                    where cr.Status == "available" 
                                        select new CreditListingDto
                                        {
                                            SellerCompanyName = cr.CompanyName,
                                            CreditsListed = cr.CreditsListed,
                                            Status = cr.Status
                                        }).ToListAsync();

            return creditListings;
        }

        [HttpPost("emissionscreditsystem/sale")]
        public async Task<IActionResult> PostSale([FromBody] double saleUnits)
        {
            
            var companyClaim = User.FindFirst("CompanyName");

            if(companyClaim == null)
            {
                return Unauthorized("token is missing the right company name");
            }

            string companyName = companyClaim.Value;

            var company = await dbContext.Companies
                                    .Where(c => c.CompanyName == companyName)
                                        .FirstAsync();

            if(saleUnits >= company.CompanyCredits)
            {
                return BadRequest("Low credit balance for the given request!");
            }

            Console.WriteLine($"Company Credits: {company.CompanyCredits}");

            var creditMarketPrice = await (from c in dbContext.Credits
                                                        orderby c.LatestDate descending
                                                            select c.CreditMarketPrice).FirstAsync();
                                                            
            Console.WriteLine($"-----------{creditMarketPrice}");

            var creditListing = new CreditListing
            {
                CompanyName = companyName,
                SellerCompanyId = company.Id,
                CreditsListed = saleUnits,
                PricePerCredit = creditMarketPrice,
                Status = "available",
            };

            company.CompanyCredits -= saleUnits;

            await dbContext.CreditListings.AddAsync(creditListing);
            await dbContext.SaveChangesAsync();
            return Ok(creditListing);
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

            var company = await dbContext.Companies
                                    .Where(c => c.CompanyName == companyName)
                                        .FirstAsync();

            var tradedCredit = await dbContext.CreditListings.Where(cl => cl.Id == buyCreditDto.SaleUnitId).FirstOrDefaultAsync();

            if(tradedCredit == null)
            {
                return BadRequest("The credits are not available to trade");
            }

            if(tradedCredit.Status == "sold")
            {
                return BadRequest("This listing is already sold");
            }

            if(buyCreditDto.UnitsBought != tradedCredit.CreditsListed)
            {
                return BadRequest("you must but exact number of credits listed");
            }

            tradedCredit.Status = "sold";

            tradedCredit.BuyerCompanyId = company.Id;

            company.CompanyCredits += buyCreditDto.UnitsBought;

            try
            {
                await dbContext.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                return Conflict("someone else bought this listing just now");
            }

            return Ok("trade successful");
        }
    }
}
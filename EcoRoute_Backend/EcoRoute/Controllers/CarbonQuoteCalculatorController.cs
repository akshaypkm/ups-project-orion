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
    [Route("api/calculate-carbon-quote")]
    [ApiController]
    public class CarbonQuoteCalculatorController : ControllerBase
    {
        private readonly EcoRouteDbContext dbContext;

        private readonly IConfiguration _configuration;

        public CarbonQuoteCalculatorController(EcoRouteDbContext dbContext, IConfiguration _configuration)
        {
            this.dbContext = dbContext;
            this._configuration = _configuration;
        }

        [HttpPost("calc")]
        [Authorize]
        public async Task<ActionResult<List<OrderDto>>> PostDataToCalculate([FromBody] OrderRequestDto orderRequestDto)
        {
            

            var userIdFromToken = User.FindFirst(ClaimTypes.Name)?.Value;

            var companyClaim = User.FindFirst("CompanyName");

            if(companyClaim == null)
            {
                return Unauthorized("token is missing the right company name");
            }

            if (orderRequestDto.OrderLength > 18.75 &&
                orderRequestDto.OrderWidth > 5.0 &&
                orderRequestDto.OrderHeight > 4.0)
            {
                return BadRequest("provide valid dimensions for the payload");
            }

            string companyName = companyClaim.Value;

            int companyId = await dbContext.Companies.Where(c => c.CompanyName == companyName)
                                                    .Select(c => c.Id).FirstOrDefaultAsync();
            
            var API_KEY = _configuration.GetConnectionString("GoogleAPIKey");
            string orderOrigin = orderRequestDto.OrderOrigin;
            string orderDestination = orderRequestDto.OrderDestination;
            
            double orderWeightKg = orderRequestDto.OrderWeightKg;
            int OrderTotalItems = orderRequestDto.OrderTotalItems;
            double orderTotalVolume = orderRequestDto.OrderLength * orderRequestDto.OrderHeight * orderRequestDto.OrderWidth * OrderTotalItems;

            if(string.IsNullOrEmpty(orderOrigin) || string.IsNullOrEmpty(orderDestination))
            {
                return BadRequest("provide valid origin and destination");
            }

            

            var truckType = await dbContext.TruckTypes.Where(t => t.MaxPayloadKg > orderWeightKg && 
                                                                (t.CargoHeightMeters * t.CargoLengthMeters * t.CargoWidthMeters * 0.90) 
                                                                    > orderTotalVolume &&
                                                                        t. CargoHeightMeters > orderRequestDto.OrderHeight &&
                                                                            ((t.CargoLengthMeters > orderRequestDto.OrderLength && 
                                                                                t.CargoWidthMeters > orderRequestDto.OrderWidth) || 
                                                                                    t.CargoLengthMeters > orderRequestDto.OrderWidth && 
                                                                                        t.CargoWidthMeters > orderRequestDto.OrderLength))   
                                                                                            .OrderBy(t => t.MaxPayloadKg)
                                                                                                .FirstOrDefaultAsync();
            if(truckType == null){
                truckType = await dbContext.TruckTypes.Where(t => t.CargoHeightMeters == 4 
                                                                ).FirstOrDefaultAsync();
            }

            double kerbWeight = truckType.KerbWeight;
            double engineEff = truckType.EngineEfficiency;

            var orderDtoList = new List<OrderDto>();
            var gms = new GoogleMapsService(API_KEY);

            // CALCULATION LOGIC FROM HERE
            
            try
            {

                var routes = await gms.GetRoutePointsAsync(orderOrigin, orderDestination, API_KEY!);

                if(routes == null || routes.Count == 0)
                {
                    return BadRequest("No routes found for given destination from origin");
                }

                Console.WriteLine($"Found {routes.Count} distinct routes.");

                int routeIndex = 1;
                double leastDurationRoute = double.MaxValue;
                foreach(var r in routes)
                {
                    var route = r.Points;
                    var summary = r.Summary;
                    var routeDuration = r.Duration;

                    Console.WriteLine($"Duration for ROUTE::::::::::::: {routeDuration}");

                    Console.WriteLine($"\n--- Processing Route #{routeIndex} ---");
                    Console.WriteLine($"Decoded {route.Count} step-points from route.");
                    
                    double maxSegmentMeters = 50.0;
                    var densePoints = Geometry.Densify(route, maxSegmentMeters);
                    Console.WriteLine($"Densified to {densePoints.Count} points (max segment ~{maxSegmentMeters} m).");

                    Console.WriteLine("Fetching elevations for densified points (batch requests)...");
                    await gms.FillElevationAsync(densePoints);


                    double positiveGainMeters = 0.0;
                    for(int i = 0; i < densePoints.Count - 1; i++)
                    {
                        double dh = densePoints[i+1].Elevation - densePoints[i].Elevation;
                        if(dh > 0)
                        {
                            positiveGainMeters = positiveGainMeters + dh;
                        }
                    }

                    double massPerTonne = Physics.EffectiveMassPerTonne(kerbWeight, orderWeightKg);

                    Console.WriteLine("--- DEBUG Vals ---");
                    Console.WriteLine($"Mass per tonne (kg): {massPerTonne}");
                    Console.WriteLine($"TotalPositiveGain (m): {positiveGainMeters:F1}");
                    Console.WriteLine($"tareKg: {kerbWeight}, payloadTonnes: {orderWeightKg}");

                    Console.WriteLine($"LHV_J_per_L: {36e6}, engineEff: {0.40}, CO2_per_L: {2.70}");
                    Console.WriteLine("------------------");

                    var result = Physics.ComputeGradeCO2AndExport(densePoints, massPerTonne, engineEff);

                    double totalDistanceKm = densePoints.Sum(p => p.SegmentMeters) / 1000.0;
                    double totalLitersUsed = result.totalLiters_per_tonne * (orderWeightKg / 1000);
                    double totalKgCO2_per_tonne = result.totalKgCO2_per_tonne;

                    Console.WriteLine("------------------");
                    Console.WriteLine("------------------");

                    Console.WriteLine($"total distance: {totalDistanceKm}");
                    Console.WriteLine($"total liters: {totalLitersUsed}");
                    Console.WriteLine($"totalkgco2: {totalKgCO2_per_tonne}");

                    Console.WriteLine("------------------");
                    Console.WriteLine("------------------");


                    double averageMileage = totalDistanceKm / totalLitersUsed;

                    var orderDto = new OrderDto
                    {
                        OrderCo2Emission = result.totalKgCO2_per_tonne,
                        SelectedRouteSummary = summary,
                        OrderDistance = totalDistanceKm,
                        OrderWeightKg = orderRequestDto.OrderWeightKg,
                        OrderLength = orderRequestDto.OrderLength,
                        OrderWidth =  orderRequestDto.OrderWeightKg,
                        OrderHeight = orderRequestDto.OrderHeight,
                        TransportVehicle = truckType.TruckName,
                        TransportMode = "Truck",
                        OrderTotalItems = orderRequestDto.OrderTotalItems,
                        OrderOrigin = orderOrigin,
                        OrderDestination = orderDestination,
                        OrderStatus = "processing",
                        OrderNature = orderRequestDto.OrderNature,
                        OrderMode = orderRequestDto.OrderMode,
                        IsRefrigerated = orderRequestDto.IsRefrigerated,
                        CompanyId = companyId,
                        RouteDuration = routeDuration
                    };
                    routeIndex ++;

                    orderDtoList.Add(orderDto);
                }
            }
            catch(Exception e)
            {
                Console.WriteLine($"ERROR: {e.Message}");
            }

            return Ok(orderDtoList);
        }

        [HttpPost("place-order")]
        [Authorize]
        public async Task<IActionResult> PlaceOrder([FromBody] OrderDto orderDto)
        {
            var userIdFromToken = User.FindFirst(ClaimTypes.Name)?.Value;
            var companyClaim = User.FindFirst("CompanyName");

            if(companyClaim == null)
            {
                return Unauthorized("token is missing the right company name");
            } 
            string companyName = companyClaim.Value;

            int companyId = await dbContext.Companies.Where(c => c.CompanyName == companyName)
                                                    .Select(c => c.Id).FirstOrDefaultAsync();
            
            var orderToDB = new Order
            {
                OrderCO2Emission = orderDto.OrderCo2Emission,
                SelectedRouteSummary = orderDto.SelectedRouteSummary,
                SelectedPolyline = orderDto.SelectedPolyline,
                OrderDistance = orderDto.OrderDistance,
                OrderWeightKg = orderDto.OrderWeightKg,
                OrderLength = orderDto.OrderLength,
                OrderWidth = orderDto.OrderWidth,
                OrderHeight = orderDto.OrderHeight,
                OrderTotalItems = orderDto.OrderTotalItems,
                OrderOrigin = orderDto.OrderOrigin,
                OrderDestination = orderDto.OrderDestination,
                IsRefrigerated = orderDto.IsRefrigerated,
                OrderStandardCO2Emissions = orderDto.OrderStandardCO2Emissions,
                CompanyId = companyId
            };
            await dbContext.Orders.AddAsync(orderToDB);

            await dbContext.SaveChangesAsync();

            return Ok(orderToDB);
        }
    }
}
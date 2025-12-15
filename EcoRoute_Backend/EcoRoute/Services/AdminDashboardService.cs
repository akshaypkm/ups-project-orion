using EcoRoute.Models.DTOs;
using EcoRoute.Models.Entities;
using EcoRoute.Repositories;

namespace EcoRoute.Services
{

    public interface IAdminDashboardService
    {
        Task<AdminDashboardDto> GetDashboardStat(string EmissionsPeriod, string ShipmentsPeriod, string EmissionsSavedPeriod);
    }
    public class AdminDashboardService : IAdminDashboardService
    {
        private readonly IEmissionRepository _emissionRepo;
        private readonly IShipmentRepository _shipmentRepo;
        private readonly IOrderRepository _orderRepo;

        public AdminDashboardService(IEmissionRepository _emissionRepo, IShipmentRepository _shipmentRepo,
                                    IOrderRepository _orderRepo)
        {
            this._emissionRepo = _emissionRepo;
            this._shipmentRepo = _shipmentRepo;
            this._orderRepo = _orderRepo;
        }
        public async Task<AdminDashboardDto> GetDashboardStat(string EmissionsPeriod, string ShipmentsPeriod, string EmissionsSavedPeriod)
        {
            DateTime EmissionsStartDate;
            DateTime EmissionsEndDate = DateTime.Now;

            DateTime ShipmentStartDate;
            DateTime ShipmentEndDate = DateTime.Now;

            DateTime EmissionsSavedStartDate;
            DateTime EmissionsSavedEndDate = DateTime.Now;

            DateTime GraphYearStart = new(DateTime.Now.Year,1,1);
            DateTime GraphNowDate = DateTime.Now;

            switch (EmissionsPeriod.ToLower())
            {
                case "year":
                    EmissionsStartDate = new DateTime(DateTime.Now.Year, 1, 1);
                    break;
                case "day":
                    EmissionsStartDate = DateTime.Today;
                    break;
                case "month":
                default:
                    EmissionsStartDate = new DateTime(DateTime.Now.Year, DateTime.Now.Month, 1);
                    break;
            }

            switch (ShipmentsPeriod.ToLower())
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
            
            var rawData = await _emissionRepo.GetAdminDashGraphEmissionsData(GraphYearStart, GraphNowDate);

            double[] finalGraphData = new double[12];

            foreach(var rd in rawData)
            {
                finalGraphData[rd.Month - 1] = rd.TotalEmissions;
            }


            var adminDashDto = new AdminDashboardDto
            {
                TotalCO2Emissions = await _emissionRepo.GetAdminDashTotalEmissions(EmissionsStartDate, EmissionsEndDate),
                TotalShipments = await _shipmentRepo.GetAdminDashTotalShipments(ShipmentStartDate, ShipmentEndDate),
                TotalOrdersForReview = await _orderRepo.GetAdminDashTotalOrdersForReview(),
                TotalEmissionsSaved = await _emissionRepo.GetAdminDashTotalEmissionsSaved(EmissionsSavedStartDate, EmissionsSavedEndDate),
                GraphData = finalGraphData,
                SoFarReviewedCount = await _shipmentRepo.GetSoFarReviewedShipmentCount()
            };

            return adminDashDto;
        }
    }
}
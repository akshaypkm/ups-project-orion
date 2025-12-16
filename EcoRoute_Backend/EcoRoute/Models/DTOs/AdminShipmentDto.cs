namespace EcoRoute.Models
{
       public class AdminShipmentDto
    {
        public string ShipmentCode{get; set;}=string.Empty;
        public DateTime ShipmentDate{get; set;}
        public string CompanyName{get; set;} =string.Empty;
        public string ShipmentOrigin{get; set;} =string.Empty;
        public string ShipmentDestination{get; set;} =string.Empty;
        public int ShipmentTotalItems{get; set;}
        public double ShipmentCO2Emission{get; set;}
        public string ShipmentStatus{get; set;} =string.Empty;
    }
}
namespace EcoRoute.Models
{
    public class OrderDto
    {

        public double OrderCO2Emission{get;set;}

        public string SelectedRouteSummary{get; set;}

        public string SelectedPolyline{get; set;}

        public double OrderDistance{get; set;}

        public double OrderWeightKg{get; set;}

        // DIMENSION FOR ONE ITEM
        public double OrderLength{get; set;} 

        public double OrderWidth{get; set;}

        public double OrderHeight{get; set;}

        public string TransportVehicle{get; set;}

        public string TransportMode{get; set;}

        public int OrderTotalItems{get; set;}

        public string OrderOrigin{get; set;}

        public string OrderDestination{get; set;}

        public string OrderStatus{get; set;} = "transit";

        public string OrderNature{get; set;} // UPSTREAM OR DOWNSTREAM

        public string OrderMode{get; set;} //SHARED OR DEDICATED

        public bool IsRefrigerated{get; set;}

        public double OrderStandardCO2Emissions{get; set;}

        public int CompanyId{get; set;}

        public double RouteDuration{get; set;}

        public DateTime OrderDate{get; set;}
    }
}
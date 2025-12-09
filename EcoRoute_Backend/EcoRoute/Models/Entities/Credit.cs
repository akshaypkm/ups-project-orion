namespace EcoRoute.Models.Entities
{
    public class Credit
    {
        public int Id{get; set;}

        public double CreditMarketPrice{get; set;}

        public DateTime LatestDate{get; set;} = DateTime.Now;
    }
}
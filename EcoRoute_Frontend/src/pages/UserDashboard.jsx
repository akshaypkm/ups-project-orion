import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// Fixed imports to match project structure (../../ assuming this is in src/pages/user/)
import api from "../api/api";
import Sidebar from "../Components/UserSideBar"; // Importing your new common Sidebar
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function ClientDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // --- Filters State ---
  const [emissionPeriod, setEmissionPeriod] = useState("Month");
  const [shipmentPeriod, setShipmentPeriod] = useState("Month");
  const [savingsPeriod, setSavingsPeriod] = useState("Year");

  // --- UI State ---
  const [tradeSection, setTradeSection] = useState(null); // 'buy', 'sell', or null
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [sellAmount, setSellAmount] = useState("");

  // --- Data State ---
  const [stats, setStats] = useState({
    totalEmissions: 0,
    shipments: 0,
    companyCredits: 0,
    creditMarketPrice: 0,
    forecastedEmissions: 0,
    totalForecastedEmissions: 0,
    emissionsSaved: 0,
    graphData: [],
  });
  const [listings, setListings] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // --- API Logic ---
  const fetchStats = async () => {
    try {
      const res = await api.get("/api/client-dashboard/stats", {
        params: { 
          EmissionPeriod: emissionPeriod, 
          ShipmentPeriod: shipmentPeriod, 
          EmissionsSavedPeriod: savingsPeriod 
        },
      });
      setStats(res.data);
    } catch (err) {
      console.error("Stats error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleNotifications = async () => {
    try{
        const res = await api.get("/api/client-dashboard/notifications");
        setNotifications(res.data);
    }
    catch(err){
        console.error("notifications loading failed");
    }
  };

  const fetchListings = async () => {
    try {
      const res = await api.get("/api/client-dashboard/emissionscreditsystem/listings");
      setListings(res.data);
    } catch (err) { console.error(err); }
  };

  // Re-fetch when filters change
  useEffect(() => { fetchStats(); }, [emissionPeriod, shipmentPeriod, savingsPeriod]);

  // Initial load & Polling
  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const res = await api.get("/api/client-dashboard/emissionscreditsystem");
        setStats(p => ({ ...p, creditMarketPrice: res.data }));
      } catch (err) { console.error(err); }
    };
    
    fetchListings(); 
    const interval = setInterval(fetchPrice, 5000); 
    return () => clearInterval(interval);
  }, []);

  // --- Handlers ---
  const handleSell = async () => {
    if (!sellAmount || parseFloat(sellAmount) <= 0) return alert("Enter valid amount");
    try {
      await api.post("/api/client-dashboard/emissionscreditsystem/sale", parseFloat(sellAmount), {
        headers: { "Content-Type": "application/json" }
      });
      alert("Listed successfully!");
      setSellAmount("");
      fetchStats(); 
      fetchListings();
    } catch (err) { alert("Sale failed"); }
  };

  const handleBuy = async (id, amount) => {
    try {
      await api.put("/api/client-dashboard/emissionscreditsystem/buy", {
        saleUnitId: id,
        unitsBought: amount
      });
      await fetchListings();
      await fetchStats(); 
      alert("Purchase successful!");
    } catch (err) {
      alert("failed to buy credits");
    }
  };

  

  const handleLogout = () => {
    localStorage.removeItem("ecoroute_token");
    navigate("/");
  };

  // --- Chart Config ---
  const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  // Map API graphData to Chart
  const chartData = {
    labels,
    datasets: [
      {
        label: "CO2e Emissions",
        // Ensure data array has 12 elements, default to 0 if API returns less/null
        data: stats.graphData?.length > 0 ? stats.graphData : Array(12).fill(0),
        backgroundColor: "rgba(16, 185, 129, 0.7)",
        borderRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { ticks: { color: "#6b7280" }, grid: { borderDash: [2, 4] } },
      x: { ticks: { color: "#6b7280" }, grid: { display: false } },
    },
  };

  if (loading) return <div className="flex h-screen items-center justify-center text-gray-500">Loading Dashboard...</div>;

  return (
    <div className="flex min-h-screen bg-gray-50">
      
      {/* 1. Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50">
        <Sidebar />
      </div>

      {/* 2. Main Content Area */}
      {/* Added ml-64 (or typical sidebar width margin) if Sidebar is fixed, assuming Sidebar handles its own width or is 64/250px */}
      <main className="flex-1 p-8 ml-0 md:ml-[300px]"> 
        
        {/* Top Header (Preserved Functionality + New Style) */}
        <header className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
          
          <div className="flex items-center gap-4">
            
            {/* Notification Button */}
            <div className="relative">
              <button 
                className="p-2 rounded-full hover:bg-gray-200 transition relative" 
                onClick={() => {
                    if(!isNotifOpen) handleNotifications(); // Fetch data when opening
                    setIsNotifOpen(!isNotifOpen);
                }}
              >
                <span className="material-symbols-outlined text-gray-600">notifications</span>
                {/* Optional red dot for new notifs */}
                {/* <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span> */}
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-100 p-2 z-50 max-h-64 overflow-y-auto animate-in fade-in slide-in-from-top-2">
                  <h4 className="text-xs font-bold text-gray-400 uppercase px-2 py-1 mb-1">Notifications</h4>
                  {notifications.length > 0 ? (
                    <div className="space-y-1">
                      {notifications.map((n, i) => (
                        <div key={i} className="p-3 text-sm text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                          {n.message}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">No new notifications</p>
                  )}
                </div>
              )}
            </div>
            
            {/* Profile Button */}
            <div className="relative">
              <button className="p-2 rounded-full hover:bg-gray-200 transition" onClick={() => setIsProfileOpen(!isProfileOpen)}>
                <span className="material-symbols-outlined text-gray-600 text-3xl">account_circle</span>
              </button>
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-2 z-50">
                  <div className="px-4 py-2 border-b">
                    <p className="text-sm font-bold text-gray-800">User Profile</p>
                  </div>
                  <button 
                    onClick={handleLogout} 
                    className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-lg">logout</span> Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Grid */}
        <div className="space-y-6">
          
          {/* ---- TOP CARDS ---- */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1: Emissions */}
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <h2 className="text-lg font-semibold text-gray-700">Total CO2e emissions</h2>
              <p className="text-4xl font-bold mt-3 text-gray-900">{stats.totalEmissions} kg CO₂e</p>

              <div className="mt-4 flex gap-2">
                {['Today', 'Month', 'Year'].map(p => (
                  <button 
                    key={p}
                    onClick={() => setEmissionPeriod(p)}
                    className={`px-3 py-1 text-sm rounded-lg transition ${
                      emissionPeriod === p 
                      ? 'bg-emerald-100 text-emerald-600 font-medium' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Card 2: Shipments */}
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <h2 className="text-lg font-semibold text-gray-700">Total Shipments</h2>
              <p className="text-4xl font-bold mt-3 text-gray-900">{stats.shipments}</p>

              <div className="mt-4 flex gap-2">
                {['Today', 'Month', 'Year'].map(p => (
                  <button 
                    key={p}
                    onClick={() => setShipmentPeriod(p)}
                    className={`px-3 py-1 text-sm rounded-lg transition ${
                      shipmentPeriod === p 
                      ? 'bg-emerald-100 text-emerald-600 font-medium' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Card 3: Emissions Credit System */}
            <div className="bg-white p-6 rounded-xl shadow-sm border relative overflow-hidden">
              <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-700">
                <span className="material-symbols-outlined text-emerald-500">credit_score</span>
                Emissions Credit System
              </h2>

              <div className="mt-4 space-y-2">
                <div className="flex justify-between items-center">
                  <p className="text-gray-500 text-sm">Market Price</p>
                  <p className="text-xl font-semibold">Rs {stats.creditMarketPrice}</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-gray-500 text-sm">Credits Left</p>
                  <p className="text-xl font-semibold text-emerald-600">{stats.companyCredits.toFixed(2)}</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-gray-500 text-sm">Forecast (for this month)</p>
                  <p className="text-xl font-semibold">{stats.forecastedEmissions} t</p>
                </div>
              </div>

              <div className="mt-5 flex gap-3">
                <button 
                  onClick={() => setTradeSection(tradeSection === 'buy' ? null : 'buy')}
                  className={`flex-1 px-4 py-2 rounded-lg transition ${tradeSection === 'buy' ? 'bg-emerald-600' : 'bg-emerald-500'} text-white hover:bg-emerald-600`}
                >
                  Buy
                </button>
                <button 
                  onClick={() => setTradeSection(tradeSection === 'sell' ? null : 'sell')}
                  className={`flex-1 px-4 py-2 rounded-lg border border-emerald-500 text-emerald-500 hover:bg-emerald-50 transition ${tradeSection === 'sell' ? 'bg-emerald-50' : ''}`}
                >
                  Sell
                </button>
              </div>

              {/* Interaction Drawers */}
              {tradeSection && (
                <div className="mt-4 pt-4 border-t animate-in fade-in slide-in-from-top-2">
                  
                  {/* BUY TABLE */}
                  {tradeSection === 'buy' && (
                    <div>
                      <h4 className="text-sm font-bold text-gray-700 mb-2">Available Listings</h4>
                      <div className="max-h-40 overflow-y-auto pr-1">
                        <table className="w-full text-sm text-left">
                          <thead className="text-xs text-gray-500 bg-gray-50 uppercase">
                            <tr>
                              <th className="px-2 py-1">Company</th>
                              <th className="px-2 py-1">Units</th>
                              <th className="px-2 py-1">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {listings.length > 0 ? listings.map((l, i) => (
                              <tr key={i} className="border-b hover:bg-gray-50">
                                <td className="px-2 py-2 truncate max-w-[80px]">{l.sellerCompanyName}</td>
                                <td className="px-2 py-2">{l.creditsListed}</td>
                                <td className="px-2 py-2">
                                  <button 
                                    onClick={() => handleBuy(l.saleUnitId, l.creditsListed)}
                                    className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded hover:bg-emerald-200"
                                  >
                                    Buy
                                  </button>
                                </td>
                              </tr>
                            )) : (
                              <tr><td colSpan="3" className="text-center py-2 text-gray-400">No listings</td></tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* SELL FORM */}
                  {tradeSection === 'sell' && (
                    <div>
                      <h4 className="text-sm font-bold text-gray-700 mb-2">Sell Credits</h4>
                      <div className="flex gap-2">
                        <input 
                          type="number" 
                          placeholder="Amount" 
                          value={sellAmount} 
                          onChange={e => setSellAmount(e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        <button 
                          onClick={handleSell}
                          className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-700"
                        >
                          Confirm
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ---- MAIN CHART + SIDE CARDS ---- */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* BAR CHART */}
            <div className="bg-white p-6 rounded-xl shadow-sm border lg:col-span-2">
              <h2 className="text-lg font-semibold mb-4 text-gray-700">CO2e Month Wise Emissions</h2>
              <div className="h-80 w-full">
                <Bar data={chartData} options={chartOptions} />
              </div>
            </div>

            {/* RIGHT SIDE CARDS */}
            <div className="space-y-6">
              
              {/* Budget Card */}
              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-700">
                  <span className="material-symbols-outlined text-emerald-500">analytics</span>
                  Carbon Budget Forecast
                </h2>

                <p className="text-gray-500 text-sm mt-2">
                  Expected annual emission based on current trend.
                </p>

                <p className="text-3xl font-bold mt-3 text-gray-900">{stats.totalForecastedEmissions} t</p>

                {/* Progress Bar Logic: Assuming 1200 is cap */}
                <div className="w-full h-2 bg-gray-200 rounded-full mt-3 overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min((stats.totalForecastedEmissions / 1200) * 100, 100)}%` }}
                  ></div>
                </div>

                <p className="text-xs text-gray-500 mt-1">/ 1,200 t (Annual Cap)</p>
              </div>

              {/* Emissions Saved */}
              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-700">
                  <span className="material-symbols-outlined text-emerald-500">eco</span>
                  Carbon Emissions Saved
                </h2>

                <p className="text-gray-500 text-sm mt-2">
                  Emissions saved by choosing sustainable routes.
                </p>

                <p className="text-3xl font-bold mt-3 text-emerald-600">{stats.emissionsSaved.toFixed(2)} kg CO₂e</p>

                <div className="mt-4 flex gap-2">
                  {['Today', 'Month', 'Year'].map(p => (
                    <button 
                      key={p}
                      onClick={() => setSavingsPeriod(p)}
                      className={`px-2 py-1 text-xs rounded-lg transition ${
                        savingsPeriod === p 
                        ? 'bg-emerald-100 text-emerald-600 font-medium' 
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
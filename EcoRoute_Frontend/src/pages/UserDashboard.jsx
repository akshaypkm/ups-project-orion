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
  const [confirmAction, setConfirmAction] = useState(null);
  const [unreadCountState, setUnreadCountState] = useState(0);
// shape: { type: "buy" | "sell", payload: any }




  

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
    companyEmissionBudget : 0,
    remainingCredits:0
  });
  const [listings, setListings] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const creditsColor =
  stats.companyCredits < 0 ? "text-red-600" : "text-emerald-600";

  const emissionsSavedColor = 
  stats.emissionsSaved < 0 ? "text-red-600" : "text-emerald-600"; 

  const usagePercent = Math.min(
  (stats.totalForecastedEmissions / stats.companyEmissionBudget) * 100,
  100
);

let barColor = "bg-emerald-500"; // 0–50%

if (usagePercent > 50 && usagePercent <= 75) {
  barColor = "bg-yellow-400";
} else if (usagePercent > 75) {
  barColor = "bg-red-500";
}

  // --- API Logic ---
  const fetchStats = async () => {
    try {
      const res = await api.get("/client-dashboard/stats", {
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
        const res = await api.get("/client-dashboard/notifications");
        setNotifications(res.data);
    }
    catch(err){
        console.error("notifications loading failed");
    }
  };

  const fetchListings = async () => {
    try {
      const res = await api.get("/client-dashboard/emissionscreditsystem/listings");
      setListings(res.data);
    } catch (err) { console.error(err); }
  };

  // Re-fetch when filters change
  useEffect(() => { fetchStats(); }, [emissionPeriod, shipmentPeriod, savingsPeriod]);

  // Initial load & Polling
  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const res = await api.get("/client-dashboard/emissionscreditsystem");
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
      await api.post("/client-dashboard/emissionscreditsystem/sale", parseFloat(sellAmount), {
        headers: { "Content-Type": "application/json" }
      });
      setSellAmount("");
      fetchStats(); 
      fetchListings();
    } catch (err) { alert("Sale failed"); }
  };

  const handleBuy = async (id, amount) => {
    try {
      await api.put("/client-dashboard/emissionscreditsystem/buy", {
        saleUnitId: id,
        unitsBought: amount
      });
      await fetchListings();
      await fetchStats(); 
    } catch (err) {
      Console.Log(err);
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
  useEffect(() => {
  handleNotifications(); // fetch on page load
}, []);
useEffect(() => {
  if (isNotifOpen && unreadCountState > 0) {
    api.post("/client-dashboard/notifications/mark-seen").then(() => {
      setUnreadCountState(0);
      handleNotifications(); // refresh list
    });
  }
}, [isNotifOpen]);

useEffect(() => {
  const fetchUnreadCount = async () => {
    try {
      const res = await api.get(
        "/client-dashboard/notifications/unread-count"
      );
      setUnreadCountState(res.data);
    } catch (e) {
      console.error("Failed to fetch unread count");
    }
  };

  fetchUnreadCount(); // initial
  const interval = setInterval(fetchUnreadCount, 5000); // every 5s

  return () => clearInterval(interval);
}, []);

  if (loading) return <div className="flex h-screen items-center justify-center text-gray-500">Loading Dashboard...</div>;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-lime-100 via-green-100 to-emerald-100 overflow-hidden">
      
      {/* 1. Sidebar */}
      <Sidebar />

      {/* 2. Main Content Area */}
      {/* Added ml-64 (or typical sidebar width margin) if Sidebar is fixed, assuming Sidebar handles its own width or is 64/250px */}
      <main className="flex-1 ml-0 md:ml-[250px] px-6 py-6 overflow-y-auto"> 
        <div className="space-y-6 max-w-7xl mx-auto max-w-7xl mx-auto max-w-7xl mx-auto">
        
        {/* Top Header (Preserved Functionality + New Style) */}
        <header className="flex justify-between items-center mb-8">
          <h2 className="text-4xl font-extrabold bg-gradient-to-r from-lime-600 via-green-600 to-emerald-700 bg-clip-text text-transparent">Dashboard</h2>
          
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
                {/* 🔴 RED DOT / COUNT */}
                {unreadCountState > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-5 min-w-[20px] flex items-center justify-center px-1">
                    {unreadCountState}
                  </span>
                )}
                {/* Optional red dot for new notifs */}
                {/* <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span> */}
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 p-2 z-50 max-h-64 overflow-y-auto animate-in fade-in slide-in-from-top-2">
                  <h4 className="text-xs font-bold text-gray-400 uppercase px-2 py-1 mb-1">Notifications</h4>
                  {notifications.length > 0 ? (
                    <div className="space-y-1">
                      {notifications.map((n, i) => (
                        <div key={i} className="p-3 text-sm text-green-700 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
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
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border py-2 z-50">
                  <div className="px-4 py-2 border-b">
                    <p className="text-sm font-bold text-green-800">User Profile</p>
                  </div>
                  <button 
                    onClick={() =>
                      setConfirmAction({
                        type: "logout"
                      })
                    }
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
        <div className="space-y-6 max-w-7xl mx-auto max-w-7xl mx-auto">
          
          {/* ---- TOP CARDS ---- */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1: Emissions */}
            <div className="bg-white/70 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/30 p-6">
              <h2 className="text-lg font-semibold flex items-center gap-2 text-green-700">
                <span className="material-symbols-outlined bg-gradient-to-r from-lime-500 to-emerald-600 bg-clip-text text-transparent">
                  eco
                  </span>Total CO2e emissions</h2>
              <p className="text-4xl font-bold mt-3 text-gray-900">{stats.totalEmissions.toFixed(2)} kg CO₂e</p>

              <div className="mt-4 flex gap-2">
                {['Today', 'Month', 'Year'].map(p => (
                  <button 
                    key={p}
                    onClick={() => setEmissionPeriod(p)}
                    className={`px-3 py-1 text-sm rounded-xl transition ${
                      emissionPeriod === p 
                      ? 'bg-green-100 text-green-700 font-semibold font-medium' 
                      : 'bg-white/70 text-green-700 border border-green-200 hover:bg-green-50 hover:bg-gray-200'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Card 2: Shipments */}
            <div className="bg-white/70 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/30 p-6">
              <h2 className="text-lg font-semibold flex items-center gap-2 text-green-700">
                <span className="material-symbols-outlined bg-gradient-to-r from-lime-500 to-emerald-600 bg-clip-text text-transparent">
                  local_shipping
                  </span>Total Shipments</h2>
              <p className="text-4xl font-bold mt-3 text-gray-900">{stats.shipments}</p>

              <div className="mt-4 flex gap-2">
                {['Today', 'Month', 'Year'].map(p => (
                  <button 
                    key={p}
                    onClick={() => setShipmentPeriod(p)}
                    className={`px-3 py-1 text-sm rounded-xl transition ${
                      shipmentPeriod === p 
                      ? 'bg-green-100 text-green-700 font-semibold font-medium' 
                      : 'bg-white/70 text-green-700 border border-green-200 hover:bg-green-50 hover:bg-green-200/60 backdrop-blur-sm'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Card 3: Emissions Credit System */}
            <div className="bg-white/70 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/30 p-6">
              <h2 className="text-lg font-semibold flex items-center gap-2 text-green-700">
                <span className="material-symbols-outlined bg-gradient-to-r from-lime-500 to-emerald-600 bg-clip-text text-transparent">credit_score</span>
                Emissions Credit System
              </h2>

              <div className="mt-4 space-y-2">
                <div className="flex justify-between items-center">
                  <p className="text-gray-500 text-sm">Market Price</p>
                  <p className="text-xl font-semibold">Rs {stats.creditMarketPrice}</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className={`text-gray-500 text-sm`}>Credits Left (for this month)</p>
                  <p className={`text-xl font-semibold`}>
                    {(stats.remainingCredits).toFixed(2)}  |  {((stats.remainingCredits) * 1000).toFixed(2) } kg CO₂e
                  </p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-gray-500 text-sm">Forecast (for this month)</p>
                  <p className="text-xl font-semibold">{stats.forecastedEmissions.toFixed(2)} kg CO₂e</p>
                </div>
              </div>

              <div className="mt-5 flex gap-3">
                <button 
                  onClick={() => setTradeSection(tradeSection === 'buy' ? null : 'buy')}
                  className={"flex-1 px-4 py-2 rounded-xl bg-gradient-to-r from-lime-500 via-green-500 to-emerald-600 text-white font-semibold hover:scale-[1.03] transition-transform"}>
                  Buy
                </button>
                <button 
                  onClick={() => setTradeSection(tradeSection === 'sell' ? null : 'sell')}
                  className={`flex-1 px-4 py-2 rounded-xl border border-green-600 text-green-700 hover:bg-emerald-50 hover:scale-[1.03] transition-transform${tradeSection === 'sell' ? 'bg-emerald-50' : ''}`}
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
                      <h4 className="text-sm font-bold text-gray-900 mb-2">Available Listings</h4>
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
                                    onClick={() =>
                                      setConfirmAction({
                                        type: "buy",
                                        payload: l
                                      })
                                    }
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
                      <h4 className="text-sm font-bold text-gray-900 mb-2">Sell Credits</h4>
                      <div className="flex gap-2">
                        <input 
                          type="number" 
                          placeholder="Amount" 
                          value={sellAmount} 
                          onChange={e => setSellAmount(e.target.value)}
                          className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        <button 
                          onClick={() =>
                            setConfirmAction({
                              type: "sell",
                              payload: { amount: sellAmount }
                            })
                          }
                          className="bg-gradient-to-r from-lime-500 via-green-500 to-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-semibold 
                          hover:scale-105 transition-transform"
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
            <div className="bg-white/60 backdrop-blur-2xl relative overflow-hidden border border-white/30 p-6 lg:col-span-2 rounded-3xl shadow-2xl">
              <h2 className="text-lg font-semibold flex items-center gap-2 text-green-700">
                <span className="material-symbols-outlined bg-gradient-to-r from-lime-500 to-emerald-600 bg-clip-text text-transparent">bar_chart</span>
                CO2e Month Wise Emissions
              </h2>
              <div className="h-80 w-full">
                <Bar data={chartData} options={chartOptions} />
              </div>
            </div>

            {/* RIGHT SIDE CARDS */}
            <div className="space-y-6 max-w-7xl mx-auto max-w-7xl mx-auto">
              
              {/* Budget Card */}
              <div className="bg-white/60 backdrop-blur-2xl relative overflow-hidden border border-white/30 p-6 rounded-3xl shadow-2xl">
                <h2 className="text-lg font-semibold flex items-center gap-2 text-green-700">
                  <span className="material-symbols-outlined bg-gradient-to-r from-lime-500 to-emerald-600 bg-clip-text text-transparent">analytics</span>
                  Carbon Budget Forecast
                </h2>

                <p className="text-gray-500 text-sm mt-2">
                  Expected annual emission based on current trend.
                </p>

                <p className="text-3xl font-bold mt-3 text-gray-900">{stats.totalForecastedEmissions.toFixed(2)} kg CO₂e</p>

                {/* Progress Bar Logic: Assuming 1200 is cap */}
                <div className="w-full h-2 bg-gray-200 rounded-full mt-3 overflow-hidden">
                  <div
                    className={`h-full ${barColor} rounded-full transition-all duration-500`}
                    style={{ width: `${usagePercent}%` }}
                  />
                </div>

                <p className="text-xs text-gray-500 mt-1">
                  {stats.totalForecastedEmissions.toFixed(2)} / {stats.companyEmissionBudget}
                </p>
              </div>

              {/* Emissions Saved */}
              <div className="bg-white/60 backdrop-blur-2xl relative overflow-hidden border border-white/30 p-6 rounded-3xl shadow-2xl">
                <h2 className="text-lg font-semibold flex items-center gap-2 text-green-700">
                  <span className="material-symbols-outlined bg-gradient-to-r from-lime-500 to-emerald-600 bg-clip-text text-transparent">eco</span>
                  Carbon Emissions Saved
                </h2>

                <p className="text-gray-500 text-sm mt-2">
                  Emissions saved by choosing sustainable routes.
                </p>

                <p className="text-3xl font-bold mt-3 text-gray-900">{stats.emissionsSaved.toFixed(2)} kg CO₂e</p>

                <div className="mt-4 flex gap-2">
                  {['Today', 'Month', 'Year'].map(p => (
                    <button 
                      key={p}
                      onClick={() => setSavingsPeriod(p)}
                      className={`px-2 py-1 text-xs rounded-xl transition ${
                        savingsPeriod === p 
                        ? 'bg-green-100 text-green-700 font-semibold font-medium' 
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
      </div>
        {confirmAction && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in-95">
              {/* HEADER */}
              <h3 className="text-lg font-bold bg-gradient-to-r from-lime-600 via-green-600 to-emerald-700 bg-clip-text text-transparent mb-3">
                {confirmAction.type === "logout"
                ? "Confirm Logout"
                : confirmAction.type === "buy"
                ? "Confirm Purchase"
                : confirmAction.type === "sell"
                ? "Confirm Sale"
                : "Confirm Action"}
              </h3>
              {/* BODY */}
              <p className="text-sm text-gray-600 mb-4">
                {confirmAction.type === "buy" && (
                  <>You are about to <b>buy {confirmAction.payload.creditsListed}</b> creditsfrom <b>{confirmAction.payload.sellerCompanyName}</b>.</>
                  )}
                  {confirmAction.type === "sell" && (
                    <>You are about to <b>sell {confirmAction.payload.amount}</b> credits.</>
                    )}
                    {confirmAction.type === "logout" && (
                      <>You are about to <b>log out</b> of your account.<br />
                      <span className="text-xs text-gray-500">You will need to log in again to access the dashboard.</span></>)}
                      </p>
              {/* ACTIONS */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                onClick={() => setConfirmAction(null)}
                className="px-4 py-2 text-sm rounded-xl border border-green-600 text-green-700 hover:bg-emerald-50 hover:scale-[1.03] transition-transform">
                  Cancel
                  </button>
                  <button
                  onClick={async () => {
                    if (confirmAction.type === "buy") {
                      const l = confirmAction.payload;
                      await handleBuy(l.saleUnitId, l.creditsListed);
                    }
                    if (confirmAction.type === "sell") {
                      await handleSell();
                    }
                    if (confirmAction.type === "logout") {
                      handleLogout();
                    }
                    setConfirmAction(null);
                  }}
                  className={`px-4 py-2 text-sm rounded-xl text-white transition-transform hover:scale-105 ${
                    confirmAction.type === "logout"
                    ? "bg-red-500 hover:bg-red-600"
                    : "px-4 py-2 text-sm rounded-xl text-white bg-red-500 hover:bg-red-600 transition-transform hover:scale-105 active:scale-95"
                  }`}>Confirm</button>
                  </div>
                </div>
              </div>
          )}
          </main>
      </div>
  );
}
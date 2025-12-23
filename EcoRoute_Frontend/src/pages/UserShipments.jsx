import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/api"; // Ensure axios instance is imported
import Sidebar from "../Components/UserSideBar"; // Assuming you want the sidebar here too

export default function UserShipments() {
  const [loading, setLoading] = useState(true);
  const [shipments, setShipments] = useState([]);
  //notification and logout 
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [confirmAction, setConfirmAction] = useState(null);
  const navigate = useNavigate();


  const handleNotifications = async () => {
    try{
        const res = await api.get("/client-dashboard/notifications");
        setNotifications(res.data);
    }
    catch(err){
        console.error("notifications loading failed");
    }
  };
   const handleLogout = () => {
    localStorage.removeItem("ecoroute_token");
    navigate("/");
  };
  
  // Backend Parameter State
  const [orderPeriod, setOrderPeriod] = useState("month"); // 'month' or 'year'

  // Frontend Filter State
  const [filters, setFilters] = useState({
    status: "All Status",
    search: "",
  });

  // --- 1. Fetch Data from Backend ---
  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        // Calls: public async Task<IActionResult> GetShipmentHistory([FromQuery] string OrderPeriod = "month", string Filter = "bySavings")
        const res = await api.get("/client-shipment-history", {
          params: {
            OrderPeriod: orderPeriod,
             // Keeping default filter as per controller
          }
        });
        setShipments(res.data);
      } catch (err) {
        console.error("Failed to fetch history", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [orderPeriod]); // Refetch when period changes

  // --- 2. Handle Frontend Filtering ---
  const handleFilterChange = (e) => {
    setFilters((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Filter logic applied to the data fetched from API
  const filteredShipments = shipments.filter((s) => {
    // 1. Status Filter
    const status = s.orderStatus || "Unknown"; 
    const matchStatus =
      filters.status === "All Status" || 
      status.toLowerCase() === filters.status.toLowerCase();
      
    // 2. Search Filter (ID, Origin, Destination)
    const searchTerm = filters.search.toLowerCase();
    const matchSearch =
      filters.search.trim() === "" ||
      (s.orderId && s.orderId.toString().toLowerCase().includes(searchTerm)) ||
      (s.orderDestination && s.orderDestination.toLowerCase().includes(searchTerm)) ||
      (s.orderOrigin && s.orderOrigin.toLowerCase().includes(searchTerm));

    return matchStatus && matchSearch;
  });

  // Helper for Status Colors
  const getStatusColor = (status) => {
    const s = status?.toLowerCase() || "";
    if (s === "placed" ) return "bg-emerald-100 text-emerald-600";
    if (s === "processing" ) return "bg-orange-100 text-orange-600";
    if (s === "planned" ) return "bg-yellow-100 text-yellow-600";

    return "bg-gray-100 text-gray-600";
  };

  // Helper for Mode Colors
  const getSavingsColor = (value) => {
  if (value <= 0) return "bg-red-100 text-red-600";
  if (value > 1) return "bg-green-100 text-green-600";
  return "bg-emerald-100 text-emerald-600";
};
  // Helper for Footprint Colors
  const getFootprintColor = (value) => {
    if (value < 2) return "text-emerald-600";
    if (value < 5) return "text-orange-500";
    return "text-red-600";
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-lime-100 via-green-100 to-emerald-100 overflow-hidden">
      <Sidebar />

      {/* Main Content with margin for sidebar */}
      <main className="flex-1 ml-0 md:ml-[250px] px-6 py-6 overflow-y-auto">
        <div className="space-y-6 max-w-7xl mx-auto">
          <header className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-lime-600 via-green-600 to-emerald-700 bg-clip-text text-transparent">Shipment History</h1>
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

          {/* SUB-HEADER */}
          <h2 className="text-2xl font-semibold text-center text-gray-700">
            Detailed Report of Shipment History
          </h2>

          {/* MAIN CARD */}
          <div className="bg-white/70 backdrop-blur-2xl border border-white/30 rounded-3xl shadow-2xl p-8 space-y-10 w-full">

            {/* --- Search & Filter Row --- */}
            <div className="flex flex-wrap items-center gap-4">

              {/* Search box */}
              <div className="flex-1 min-w-[200px]">
                <input
                  type="text"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Search by ID, Origin, Destination..."
                  className="w-full px-4 py-3 rounded-xl cursor-pointer bg-white/80 backdrop-blur-xl border border-emerald-200
                text-gray-700 font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>

              {/* Backend Time Period Filter */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-500">Period:</span>
                <select 
                  value={orderPeriod}
                  onChange={(e) => setOrderPeriod(e.target.value)}
                  className="px-4 pr-10 py-2.5 min-w-[180px] rounded-xl cursor-pointer bg-white/80 backdrop-blur-xl border border-emerald-200
                text-gray-700 font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                >
                  <option value="day">This Day</option>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                </select>
              </div>

              {/* Frontend Status Filter */}
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="px-4 pr-10 py-2.5 min-w-[180px] rounded-xl cursor-pointer bg-white/80 backdrop-blur-xl border border-emerald-200
                text-gray-700 font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
              >
                <option>All Status</option>
                <option>Placed</option>
                <option>Processing</option>
                <option>Planned</option>

              </select>

            </div>

            {/* --- TABLE --- */}
            <div className="mt-6 overflow-x-auto rounded-2xl border border-emerald-100">
              <table className="min-w-full text-left text-sm text-gray-700">
                <thead>
                  <tr className="bg-gradient-to-r from-lime-100 via-green-100 to-emerald-100 text-gray-700 text-xs uppercase">
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Origin</th>
                    <th className="px-4 py-3">Destination</th>
                    <th className="px-4 py-3">Quantity</th>
                    <th className="px-4 py-3">Net Weight</th>
                    <th className="px-4 py-3">Emissions Saved</th>
                    <th className="px-4 py-3">Carbon Footprint</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>

                <tbody className="bg-white/80 divide-y divide-emerald-100 text-sm">
                  {loading ? (
                    <tr><td colSpan="9" className="py-8 text-center text-gray-500">Loading records...</td></tr>
                  ) : filteredShipments.length === 0 ? (
                    <tr><td colSpan="9" className="py-8 text-center text-gray-500">No shipments found.</td></tr>
                  ) : (
                    filteredShipments.map((row, index) => (
                      <tr key={index} className="hover:bg-emerald-50/60 transition">
                        <td className="px-4 py-3 font-semibold text-emerald-600">{row.shipmentCode || "N/A"}</td>
                        <td className="text-gray-600">
                          {row.orderDate ? new Date(row.orderDate).toLocaleDateString() : "N/A"}
                        </td>
                        <td className="font-medium text-gray-800">{row.orderOrigin.toUpperCase()}</td>
                        <td className="font-medium text-gray-800">{row.orderDestination.toUpperCase()}</td>
                        <td className="text-gray-600">{row.orderTotalItems || row.unitCount || 0} units</td>
                        <td className="text-gray-600">{row.orderWeightKg || 0} kg</td>

                        {/* Mode pill */}
                        <td>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSavingsColor(row.orderEmissionsSaved)}`}>
                            {(row.orderEmissionsSaved.toFixed(2))} Kg CO₂e
                          </span>
                        </td>

                        {/* Footprint */}
                        <td className={`font-semibold ${getFootprintColor(row.orderCO2Emission)}`}>
                          {row.orderCO2Emission ? row.orderCO2Emission.toFixed(2) : "0.00"} Kg CO₂e
                        </td>

                        {/* Status */}
                        <td>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(row.orderStatus)}`}>
                            {row.orderStatus.toUpperCase() || "Pending"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* --- FOOTER TEXT --- */}
            <p className="text-sm text-gray-500 mt-4">
              Showing {filteredShipments.length} results
            </p>

            {/* --- Pagination (Visual Only for now) --- */}
            {/* <div className="flex items-center justify-center gap-2 mt-4">
              <button className="px-3 py-1 border rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100">{"<"}</button>
              <button className="px-3 py-1 border rounded-lg bg-emerald-500 text-white">1</button>
              <button className="px-3 py-1 border rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100">2</button>
              <button className="px-3 py-1 border rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100">3</button>
              <span className="px-3 py-1 border rounded-lg bg-gray-50 text-gray-400">...</span>
              <button className="px-3 py-1 border rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100">{">"}</button>
            </div> */}

          </div>
          
          </div>
          {/* 🔽 ADD CONFIRM MODAL HERE */}
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
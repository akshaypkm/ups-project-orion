import React, { useState, useEffect } from "react";
import api from "../api/api";
import AdminSidebar from "../Components/AdminSidebar"; // Import your new sidebar
import { Bar } from "react-chartjs-2";
import { useNavigate } from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

// Register ChartJS
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);

  // Filters (matching controller params)
  const [emissionsPeriod, setEmissionsPeriod] = useState("month");
  const [shipmentsPeriod, setShipmentsPeriod] = useState("month");
  const [emissionSavedPeriod, setEmissionSavedPeriod] = useState("year");
  //notification and log out 
  const navigate = useNavigate();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [confirmAction, setConfirmAction] = useState(null);
  const handleNotifications = async () => {
  try {
    const res = await api.get("/api/admin-dashboard/notifications");
    setNotifications(res.data);
  } catch (err) {
    console.error("Admin notifications failed");
  }
};
  const handleLogout = () => {
  localStorage.removeItem("ecoroute_token");
  navigate("/");
};



  // The controller asks for EmissionsSavedPeriod, but HTML shows "API Calls/Clients".
  // We'll keep this state in case we need to filter the 3rd/4th cards.
  const [generalPeriod, setGeneralPeriod] = useState("month"); 

  // Data State
  const [stats, setStats] = useState({
    totalCO2Emissions: 0,
    totalShipments: 0,
    totalEmissionsSaved: 0,    
    activeClients: 0,
    graphData: [], 
    soFarReviewedCount: 0
  });

  // --- API Call ---
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // GET /api/admin-dashboard/stats?EmissionsPeriod=...
        const res = await api.get("/admin-dashboard/stats", {
          params: {
            EmissionsPeriod: emissionsPeriod,
            ShipmentsPeriod: shipmentsPeriod,
            EmissionsSavedPeriod: emissionSavedPeriod, // passing to backend as requested
          },
        });
        setStats(res.data);
      } catch (err) {
        console.error("Admin Stats Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [emissionsPeriod, shipmentsPeriod, emissionSavedPeriod]);

  // --- Chart Config ---
  const chartData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], // Static or dynamic based on data
    datasets: [
      {
        label: "CO2e (kg CO₂e)",
        data: stats.graphData?.length > 0 ? stats.graphData : [0, 0, 0, 0, 0, 0, 0,0,0,0,0,0],
        backgroundColor: "rgba(74, 144, 226, 0.6)", // Primary Blue #4A90E2 with opacity
        borderColor: "#4A90E2",
        borderWidth: 1,
        borderRadius: 4,
        hoverBackgroundColor: "#4A90E2",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { 
      legend: { display: false },
      tooltip: {
        backgroundColor: "#1a1a1a",
        padding: 12,
        titleFont: { size: 13 },
        bodyFont: { size: 13, weight: 'bold' },
        callbacks: {
          label: (context) => `${context.raw} kg CO₂e`
        }
      }
    },
    scales: {
      y: { 
        ticks: { color: "#9ca3af", font: { size: 11 } }, 
        grid: { borderDash: [4, 4], color: "#e5e7eb" },
        border: { display: false }
      },
      x: { 
        ticks: { color: "#9ca3af", font: { size: 12 } }, 
        grid: { display: false },
        border: { display: false }
      },
    },
  };

  if (loading) return <div className="flex h-screen items-center justify-center text-gray-500">Loading Admin Dashboard...</div>;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-emerald-100 via-teal-100 to-blue-200 overflow-hidden">
      
      {/* 1. Admin Sidebar */}
      <AdminSidebar />

      {/* 2. Main Content */}
      <main className="flex-1 ml-0 md:ml-[250px] px-6 py-6 overflow-y-auto">
        
        <div className="space-y-6">
          
          {/* Page Heading */}
          <header className="flex justify-between items-center mb-8">
            <h2 className="text-4xl font-extrabold bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-600 bg-clip-text text-transparent">
              Admin Dashboard</h2>
              <div className="flex items-center gap-4">
                 {/* Notifications */}
                 <div className="relative">
                  <button
                  className="p-2 rounded-full hover:bg-blue-100 transition"
                  onClick={() => {
                    if (!isNotifOpen) handleNotifications();
                    setIsNotifOpen(!isNotifOpen);}}>
                      <span className="material-symbols-outlined text-gray-600">notifications</span>
                  </button>
                {isNotifOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 p-2 z-50 max-h-64 overflow-y-auto">
                    <h4 className="text-xs font-bold text-gray-400 uppercase px-2 py-1 mb-1">Notifications</h4>
                    {notifications.length > 0 ? (
                      notifications.map((n, i) => (
                      <div key={i} className="p-3 text-sm text-blue-700 bg-gray-50 rounded-xl hover:bg-gray-100">
                        {n.message}
                      </div>)) ) : (
                        <p className="text-sm text-gray-500 text-center py-4">No new notifications</p>
                        )}
                        </div>
                      )}
                      </div>
                {/* Profile */}
                <div className="relative">
                  <button
                  className="p-2 rounded-full hover:bg-blue-100 transition"
                  onClick={() => setIsProfileOpen(!isProfileOpen)}>
                    <span className="material-symbols-outlined text-gray-600 text-3xl">account_circle</span>
                    </button>
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border py-2 z-50">
                      <div className="px-4 py-2 border-b">
                        <p className="text-sm font-bold text-blue-800">Admin Profile</p>
                      </div>
                    <button
                    onClick={() => setConfirmAction({ type: "logout" })}
                    className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg">logout</span>Log Out
                      </button>
                      </div>
                    )}
                    </div>
                  </div>
                </header>
              <p className="text-gray-500 text-base font-normal">Overview of platform metrics and carbon footprint.</p>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            
           {/* Card: Total CO2e Tracked */}
           <div className="bg-white/70 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/30 p-6">
           {/* Header */}
           <h2 className="text-lg font-semibold flex items-center gap-2 text-blue-700">
            <span className="material-symbols-outlined bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-600 bg-clip-text text-transparent">
              co2</span>Total CO2e tracked</h2>
              {/* Value */}
              <p className="text-4xl font-bold mt-3 text-gray-900">
                {stats.totalCO2Emissions.toFixed(2)} kg CO₂e</p>
          {/* Period Filter */}
          <div className="mt-4 flex gap-2">
            {['today', 'month', 'year'].map(p => (
              <button
              key={p}
              onClick={() => setEmissionsPeriod(p)}
              className={`px-3 py-1 text-sm rounded-xl transition font-medium ${
                emissionsPeriod === p
                ? 'bg-blue-100 text-blue-700'
                : 'bg-white/70 text-blue-700 border border-blue-200 hover:bg-blue-50'}`}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>))}
                </div>
            </div>


            {/* Card: Total Shipments */}
           <div className="bg-white/70 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/30 p-6">
           {/* Header */}
           <h2 className="text-lg font-semibold flex items-center gap-2 text-blue-700">
            <span className="material-symbols-outlined bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-600 bg-clip-text text-transparent">
              local_shipping
              </span>
              Total Shipments
              </h2>
            {/* Value */}
            <p className="text-4xl font-bold mt-3 text-gray-900">
              {stats.totalShipments}
              </p>
              {/* Period Filter */}
              <div className="mt-4 flex gap-2">
                {['today', 'month', 'year'].map(p => (
                  <button
                  key={p}
                  onClick={() => setShipmentsPeriod(p)}
                  className={`px-3 py-1 text-sm rounded-xl transition font-medium ${
                    shipmentsPeriod === p
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-white/70 text-blue-700 border border-blue-200 hover:bg-blue-50'}`}>
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                      </button>
                    ))}
                </div>
            </div>

            {/* Card: Total Orders for Review */}
            <div className="bg-white/70 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/30 p-6">
            {/* Header */}
            <h2 className="text-lg font-semibold flex items-center gap-2 text-blue-700">
              <span className="material-symbols-outlined bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-600 bg-clip-text text-transparent">
                api</span>Total Orders for Review</h2>
              {/* Main Value */}
              <p className="text-4xl font-bold mt-3 text-gray-900">
              {stats.totalOrdersForReview ?? 0}</p>
            {/* Subtext */}
            <p className="mt-2 text-sm text-blue-600 font-medium">
              {stats.soFarReviewedCount ?? 0} shipment(s) reviewed so far</p>
            </div>

            {/* Card: Total Emissions Saved */}
            <div className="bg-white/70 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/30 p-6">
            {/* Header */}
            <h2 className="text-lg font-semibold flex items-center gap-2 text-blue-700">
              <span className="material-symbols-outlined bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-600 bg-clip-text text-transparent">eco</span>
              Total Emissions Saved</h2>
              {/* Main Value */}
              <p className="text-4xl font-bold mt-3 text-gray-900">
                {stats.totalEmissionsSaved.toFixed(2)} kg CO₂e
                </p>
            {/* Filter Toggle (same logic, new style) */}
            <div className="mt-4 flex gap-2">
              {['today', 'month', 'year'].map(p => (
                <button
                key={p}
                onClick={() => setEmissionSavedPeriod(p)}
                className={`px-3 py-1 text-sm rounded-xl transition ${
                  emissionSavedPeriod === p
                  ? 'bg-blue-100 text-blue-700 font-semibold': 'bg-white/70 text-blue-700 border border-blue-200 hover:bg-blue-50'}`}>
                    {p}
                    </button>
                  ))}
                  </div>
                </div>
          </div>

          {/* Chart Section */}
          <div className="bg-white/70 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/30 p-6">
          {/* Header */}
          <h2 className="text-lg font-semibold flex items-center gap-2 text-blue-700">
            <span className="material-symbols-outlined bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-600 bg-clip-text text-transparent">
              bar_chart
              </span>CO2e Emissions by Month</h2>
              <p className="text-gray-500 text-sm mt-1">Last 12 months emission trend</p>
              {/* Chart */}
              <div className="mt-4 h-[300px] w-full">
                <Bar data={chartData} options={chartOptions} />
                </div>
          </div>
          

        </div>
        {confirmAction && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in-95">
              <h3 className="text-lg font-bold bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-600 bg-clip-text text-transparent mb-3">Confirm Logout</h3>
              <p className="text-sm text-gray-600 mb-4">You are about to <b>log out</b> of your admin account.<br />
              <span className="text-xs text-gray-500">You will need to log in again to access the admin panel.</span></p>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
              onClick={() => setConfirmAction(null)}
              className="px-4 py-2 text-sm rounded-xl border border-blue-600 text-blue-700 hover:bg-blue-50 transition-transform hover:scale-105 active:scale-95">Cancel
              </button>
              <button
              onClick={() => {
                handleLogout();
                setConfirmAction(null);
              }}
              className="px-4 py-2 text-sm rounded-xl text-white bg-red-500 hover:bg-red-600 transition-transform hover:scale-105 active:scale-95">
                Confirm</button>
                </div>
              </div>
            </div>)}
      </main>
    </div>
  );
}
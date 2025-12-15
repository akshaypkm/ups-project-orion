import React, { useState, useEffect } from "react";
import api from "../api/api";
import AdminSidebar from "../Components/AdminSidebar"; // Import your new sidebar
import { Bar } from "react-chartjs-2";
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
        const res = await api.get("/api/admin-dashboard/stats", {
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
  }, [emissionsPeriod, shipmentsPeriod, generalPeriod]);

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
    <div className="flex min-h-screen bg-[#F8F9FA]">
      
      {/* 1. Admin Sidebar */}
      <AdminSidebar />

      {/* 2. Main Content */}
      <main className="flex-1 p-8 ml-64">
        
        <div className="flex flex-col gap-6">
          
          {/* Page Heading */}
          <div className="flex flex-wrap justify-between gap-4 items-end">
            <div className="flex flex-col gap-1">
              <h1 className="text-3xl font-black leading-tight text-gray-800">Admin Dashboard</h1>
              <p className="text-gray-500 text-base font-normal">Overview of platform metrics and carbon footprint.</p>
            </div>
            
            
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            
            {/* Card 1: Total CO2e */}
            <div className="flex flex-col gap-2 rounded-xl p-7 bg-white border border-gray-200 shadow-sm relative">
              <div className="flex items-center gap-2 ">
                <span className="material-symbols-outlined text-[#4A90E2]">co2</span>
                <p className="text-gray-600 text-sm font-medium">Total CO2e tracked</p>
              </div>
              <p className="text-gray-900 text-3xl font-bold leading-tight">{stats.totalCO2Emissions} kg CO₂e</p>
              {/* <p className="text-[#50E3C2] text-sm font-medium">+5.2% vs last month</p> */}
              
              {/* Filter Toggle */}
              <div className="absolute ml-3 bottom-1 left-4 flex gap-1">
                {['today', 'month', 'year'].map(p => (
                   <button key={p} onClick={() => setEmissionsPeriod(p)} className={`text-[10px] px-2 py-0.5 rounded uppercase ${emissionsPeriod === p ? 'bg-[#4A90E2] text-white' : 'bg-gray-100 text-gray-500'}`}>{p}</button>
                ))}
              </div>
            </div>

            {/* Card 2: Total Shipments */}
              <div className="flex flex-col gap-2 rounded-xl p-7 bg-white border border-gray-200 shadow-sm relative">
              <div className="flex items-center gap-2 ">
                <span className="material-symbols-outlined text-[#4A90E2]">local_shipping</span>
                <p className="text-gray-600 text-sm font-medium">Total Shipments</p>
              </div>
              <p className="text-gray-900 text-3xl font-bold leading-tight">{stats.totalShipments}</p>
              {/* <p className="text-[#50E3C2] text-sm font-medium">+10.1% vs last month</p> */}
              
              {/* Filter Toggle */}
              <div className="absolute ml-3 bottom-1 left-4 flex gap-1">
                 {['today', 'month', 'year'].map(p => (
                   <button key={p} onClick={() => setShipmentsPeriod(p)} className={`text-[10px] px-2 py-0.5 rounded uppercase ${shipmentsPeriod === p ? 'bg-[#4A90E2] text-white' : 'bg-gray-100 text-gray-500'}`}>{p}</button>
                ))}
              </div>
            </div>

            {/* Card 3: Total reviews */}
            <div className="flex flex-col gap-2 rounded-xl p-6 bg-white border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#4A90E2]">api</span>
                <p className="text-gray-600 text-sm font-medium">Total Orders for Review</p>
              </div>
              <p className="text-gray-900 text-3xl font-bold leading-tight">
                {stats.totalOrdersForReview ? (stats.totalOrdersForReview) : '0'}
              </p>
              <p className="text-[#50E3C2] text-sm font-medium">{stats.soFarReviewedCount ? (stats.soFarReviewedCount) : '0'} shipment(s) reviewed so far </p>
            
            </div>

            {/* Card 4: Emissions saved */}
            <div className="flex flex-col gap-2 rounded-xl p-6 bg-white border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#4A90E2]">eco</span>
                <p className="text-gray-600 text-sm font-medium">Total Emissions Saved</p>
              </div>

              <p className="text-gray-900 text-3xl font-bold leading-tight">{stats.totalEmissionsSaved.toFixed(2)} {"kg CO₂e"}</p>
              {/* <p className="text-[#50E3C2] text-sm font-medium">+1.3% vs last month</p>  */}
              <div className="absolute ml-3 bottom-1 left-4 flex gap-1">
                 {['today', 'month', 'year'].map(p => (
                   <button key={p} onClick={() => setEmissionSavedPeriod(p)} className={`text-[10px] px-2 py-0.5 rounded uppercase ${emissionSavedPeriod === p ? 'bg-[#4A90E2] text-white' : 'bg-gray-100 text-gray-500'}`}>{p}</button>
                ))}
              </div>
              </div>
          </div>

          {/* Chart Section */}
          <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col">
              <p className="text-gray-800 text-lg font-bold">CO2e Emissions by Month</p>
              <p className="text-gray-500 text-sm">Last 12 Months Trend</p>
            </div>
            
            <div className="h-[300px] w-full">
              <Bar data={chartData} options={chartOptions} />
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
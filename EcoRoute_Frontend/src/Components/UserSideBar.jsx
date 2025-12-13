import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/UserDashboard.css";
import UserCarbonQuoteCalculator from "../App.jsx"

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem("ecoroute_token");
    navigate("/");
  };

  // Helper for dynamic classes based on active state
  const getNavItemClasses = (path) => {
    const baseClasses = "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition w-full text-left";
    const activeClasses = "bg-emerald-100 text-emerald-600";
    const inactiveClasses = "text-gray-600 hover:bg-gray-50";

    return `${baseClasses} ${isActive(path) ? activeClasses : inactiveClasses}`;
  };

  return (
    <aside className="w-64 h-screen bg-white border-r flex flex-col px-4 py-6 fixed left-0 top-0 z-50">
      {/* Brand Logo */}
      <div className="flex items-center gap-2 mb-10">
        <span className="material-symbols-outlined text-emerald-500" style={{fontSize: '28px'}}>
          eco
        </span>
        <h1 className="text-2xl font-semibold text-emerald-500">EcoRoute</h1>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-2">
        <button 
          className={getNavItemClasses('/client-dashboard')}
          onClick={() => navigate('/client-dashboard')}
        >
          <span className="material-symbols-outlined">home</span>
          Home
        </button>
        
        <button 
          className={getNavItemClasses('/carbon-quote-calculator')}
          onClick={() => navigate('/carbon-quote-calculator')}
        >
          <span className="material-symbols-outlined">calculate</span>
          Carbon Quote Calculator
        </button>
        
        <button 
          className={getNavItemClasses('/client-shipments')}
          onClick={() => navigate('/client-shipments')}
        >
          <span className="material-symbols-outlined">history</span>
          Shipment History
        </button>
      </nav>

      {/* Logout at Bottom */}
      <div className="mt-auto">
        <button 
          className="flex items-center gap-3 text-gray-500 hover:text-red-500 transition w-full text-left px-4 py-3 text-sm font-medium" 
          onClick={handleLogout}
        >
          <span className="material-symbols-outlined" style={{transform: 'rotate(180deg)'}}>
            logout
          </span>
          Log Out
        </button>
      </div>
    </aside>
  );
}
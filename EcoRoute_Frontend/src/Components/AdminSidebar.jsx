import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
// Ensure you have the icons font link in your index.html or import it
// <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet" />

export default function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem("ecoroute_token");
    navigate("/");
  };

  // Styles matching admin_home_page.html
  // Primary Color: #4A90E2 (Blue)
  const getNavItemClasses = (path) => {
    const baseClasses = "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium leading-normal transition-colors w-full text-left";
    // Active: Blue background tint + Blue text
    const activeClasses = "bg-[#4A90E2]/20 text-[#4A90E2]"; 
    // Inactive: Gray text + Hover blue tint
    const inactiveClasses = "text-gray-600 hover:bg-[#4A90E2]/10";

    return `${baseClasses} ${isActive(path) ? activeClasses : inactiveClasses}`;
  };

  return (
    <aside className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col justify-between p-4 fixed left-0 top-0 z-50">
      <div className="flex flex-col gap-8">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3 px-2">
          <div className="bg-[#4A90E2]/20 rounded-lg p-2 flex items-center justify-center">
            <span className="material-symbols-outlined text-[#4A90E2] text-2xl">eco</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-gray-800 text-base font-bold leading-normal">EcoRoute</h1>
            <p className="text-gray-400 text-xs font-normal">Admin</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex flex-col gap-2">
          <button 
            className={getNavItemClasses('/admin-dashboard')}
            onClick={() => navigate('/admin-dashboard')}
          >
            <span className={`material-symbols-outlined ${isActive('/admin-dashboard') ? 'fill' : ''}`}>dashboard</span>
            Dashboard
          </button>

          <button 
            className={getNavItemClasses('/admin/shipments')}
            onClick={() => navigate('/admin/shipments')}
          >
            <span className="material-symbols-outlined">history</span>
            Shipment History
          </button>

          <button 
            className={getNavItemClasses('/admin/monitor')}
            onClick={() => navigate('/admin/monitor')}
          >
            <span className="material-symbols-outlined">monitoring</span>
            Monitor Parameters
          </button>
          
          <button 
            className={getNavItemClasses('/admin/shipments/review')}
            onClick={() => navigate('/admin/shipments/review')}
          >
            <span className="material-symbols-outlined">rate_review</span>
            Review Requests
          </button>
        </nav>
      </div>

      {/* Logout */}
      <div className="flex flex-col gap-1 border-t border-gray-200 pt-4">
        <button 
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors w-full text-left"
          onClick={handleLogout}
        >
          <span className="material-symbols-outlined">logout</span>
          <span className="text-sm font-medium leading-normal">Logout</span>
        </button>
      </div>
    </aside>
  );
}
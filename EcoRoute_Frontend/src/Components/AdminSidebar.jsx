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
  const base =
    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition w-full text-left hover:scale-[1.02]";
  
  const active =
    "bg-gradient-to-r from-emerald-100 via-teal-100 to-blue-100 text-blue-700";

  const inactive =
    "text-gray-600 hover:bg-blue-50 hover:text-blue-600";

  return `${base} ${isActive(path) ? active : inactive}`;
};

  return (
    <aside className="w-64 h-screen bg-white/70 backdrop-blur-2xl border-r border-white/30 shadow-md flex flex-col px-4 py-6 fixed left-0 top-0 z-50 overflow-y-auto">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-2 mb-10">
            <span className="material-symbols-outlined bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-600 bg-clip-text text-transparent" style={{ fontSize: '28px' }}>eco</span>
            <h1 className="text-2xl font-semibold bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-600 bg-clip-text text-transparent">EcoRoute</h1>
            <p className="text-gray-500 text-xs font-normal">Admin</p>
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
            className={getNavItemClasses('/admin-shipments')}
            onClick={() => navigate('/admin-shipments')}
          >
            <span className="material-symbols-outlined">history</span>
            Shipment History
          </button>

          
          
          <button 
            className={getNavItemClasses('/admin-shipments-review')}
            onClick={() => navigate('/admin-shipments-review')}
          >
            <span className="material-symbols-outlined">rate_review</span>
            Review Requests
          </button>
        </nav>
    </aside>
  );
}
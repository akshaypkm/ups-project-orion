import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/UserDashboard.css";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem("ecoroute_token");
    navigate("/");
  };

  return (
    <aside className="sidebar">
      {/* Brand Logo */}
      <div className="brand">
        <div className="brand-logo-container">
          <span className="material-symbols-outlined text-accent" style={{fontSize: '28px'}}>eco</span>
        </div>
        <span className="brand-text">EcoRoute</span>
      </div>

      {/* Navigation */}
      <nav className="nav-menu">
        <button 
          className={`nav-item ${isActive('/client-dashboard') ? 'active' : ''}`}
          onClick={() => navigate('/client-dashboard')}
        >
          <span className="material-symbols-outlined">home</span>
          Home
        </button>
        
        <button 
          className={`nav-item ${isActive('/calculator') ? 'active' : ''}`}
          onClick={() => navigate('/calculator')}
        >
          <span className="material-symbols-outlined">calculate</span>
          Carbon Quote Calculator
        </button>
        
        <button 
          className={`nav-item ${isActive('/history') ? 'active' : ''}`}
          onClick={() => navigate('/history')}
        >
          <span className="material-symbols-outlined">history</span>
          Shipment History
        </button>
      </nav>

      {/* Logout at Bottom */}
      <div className="logout-section">
        <button className="logout-btn" onClick={handleLogout}>
          <span className="material-symbols-outlined" style={{transform: 'rotate(180deg)'}}>logout</span>
          Log Out
        </button>
      </div>
    </aside>
  );
}
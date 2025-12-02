import React from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("ecoroute_token");
    navigate("/");
  };

  return (
    <div className="dashboard-root">
      
      {/* LEFT SIDEBAR */}
      <aside className="sidebar">
        <div className="logo-block">
          <img src="/ups-logo.png" alt="UPS" className="sidebar-logo" />
          <h2 className="brand">EcoRoute</h2>
          <h4 className="sub-brand">Logistics</h4>
        </div>

        <nav className="menu">
          <button className="menu-item active">Dashboard</button>
          <button className="menu-item">Create Shipment</button>
          <button className="menu-item">View History</button>
          <button className="menu-item">CO₂ Reports</button>
          <button className="menu-item">Route Optimization</button>
        </nav>

        <button className="logout-btn" onClick={logout}>Logout</button>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="main-content">
        <h1 className="page-title">Welcome to EcoRoute Dashboard</h1>

        <p className="page-subtitle">
          Manage shipments, calculate CO₂ emissions, and optimize logistics routes.
        </p>

        <div className="cards-row">
          <div className="card">
            <h3>Total Shipments</h3>
            <p className="card-value">120</p>
          </div>

          <div className="card">
            <h3>Carbon Emissions Saved</h3>
            <p className="card-value green">356 kg</p>
          </div>

          <div className="card">
            <h3>Optimized Routes</h3>
            <p className="card-value">31</p>
          </div>
        </div>
      </main>

    </div>
  );
}

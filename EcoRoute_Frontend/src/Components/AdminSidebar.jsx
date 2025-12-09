// src/components/admin/AdminSidebar.jsx
import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

export default function AdminSidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <aside className="sidebar">
      <div className="logo-block">
        <img
          src="https://via.placeholder.com/80x80?text=ADM"
          alt="Admin Logo"
          className="sidebar-logo"
        />
        <h2 className="brand">EcoShip</h2>
        <p className="sub-brand">Admin Panel</p>
      </div>

      <nav className="menu">
        <NavLink
          to="/admin/home"
          className={({ isActive }) =>
            "menu-item" + (isActive ? " active" : "")
          }
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/admin/shipments"
          className={({ isActive }) =>
            "menu-item" + (isActive ? " active" : "")
          }
        >
          Shipments
        </NavLink>

        <NavLink
          to="/admin/shipments/review"
          className={({ isActive }) =>
            "menu-item" + (isActive ? " active" : "")
          }
        >
          Review Requests
        </NavLink>

        <NavLink
          to="/admin/monitor"
          className={({ isActive }) =>
            "menu-item" + (isActive ? " active" : "")
          }
        >
          Monitor Parameters
        </NavLink>
      </nav>

      <button className="logout-btn" onClick={handleLogout}>
        Logout
      </button>
    </aside>
  );
}

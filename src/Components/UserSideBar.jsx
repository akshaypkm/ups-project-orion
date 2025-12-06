// src/components/user/UserSidebar.jsx
import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

export default function UserSidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // later: clear auth, etc.
    navigate("/");
  };

  return (
    <aside className="sidebar">
      <div className="logo-block">
        <img
          src="https://via.placeholder.com/80x80?text=LOGO"
          alt="Logo"
          className="sidebar-logo"
        />
        <h2 className="brand">EcoShip</h2>
        <p className="sub-brand">User Panel</p>
      </div>

      <nav className="menu">
        <NavLink
          to="/user/home"
          className={({ isActive }) =>
            "menu-item" + (isActive ? " active" : "")
          }
        >
          Home
        </NavLink>

        <NavLink
          to="/user/shipments"
          className={({ isActive }) =>
            "menu-item" + (isActive ? " active" : "")
          }
        >
          My Shipments
        </NavLink>

        <NavLink
          to="/user/calculator"
          className={({ isActive }) =>
            "menu-item" + (isActive ? " active" : "")
          }
        >
          Emission Calculator
        </NavLink>

        <NavLink
          to="/user/results"
          className={({ isActive }) =>
            "menu-item" + (isActive ? " active" : "")
          }
        >
          Results
        </NavLink>
      </nav>

      <button className="logout-btn" onClick={handleLogout}>
        Logout
      </button>
    </aside>
  );
}
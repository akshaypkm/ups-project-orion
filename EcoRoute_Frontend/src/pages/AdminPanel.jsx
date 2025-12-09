import React from "react";
import { useNavigate } from "react-router-dom";

export default function AdminPanel() {
  const navigate = useNavigate();
  const logout = () => {
    localStorage.removeItem("ecoroute_token");
    navigate("/");
  };

  return (
    <div className="page-container">
      <header className="page-header">
        <img src="/ups-logo.png" alt="UPS" className="mini-logo" />
        <h2>EcoRoute — Admin Panel</h2>
        <button className="btn-ghost" onClick={logout}>Logout</button>
      </header>

      <main>
        <p>Admin features: update emission factors, view calculations, manage users.</p>
        {/* Add admin controls */}
      </main>
    </div>
  );
}

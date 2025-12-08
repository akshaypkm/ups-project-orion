// src/pages/admin/AdminShipments.jsx
import React, { useState } from "react";
import AdminSidebar from "../Components/AdminSidebar";


export default function AdminShipments() {
  const [filters, setFilters] = useState({
    user: "All Users",
    status: "All Status",
    emissionLevel: "All Levels",
  });

  const shipments = [
    {
      id: "#ADM-2001",
      user: "Logistics A",
      route: "Chennai → Delhi",
      mode: "Road",
      co2: 72.6,
      level: "High",
      status: "In review",
    },
    {
      id: "#ADM-2002",
      user: "Logistics B",
      route: "Chennai → Bangalore",
      mode: "Road",
      co2: 12.8,
      level: "Low",
      status: "Approved",
    },
    {
      id: "#ADM-2003",
      user: "Logistics C",
      route: "Chennai → Mumbai",
      mode: "Road",
      co2: 38.4,
      level: "Moderate",
      status: "Planned",
    },
  ];

  const handleFilterChange = (e) => {
    setFilters((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const filteredShipments = shipments.filter((s) => {
    const matchUser =
      filters.user === "All Users" || s.user === filters.user;
    const matchStatus =
      filters.status === "All Status" || s.status === filters.status;
    const matchLevel =
      filters.emissionLevel === "All Levels" ||
      s.level === filters.emissionLevel;

    return matchUser && matchStatus && matchLevel;
  });

  const levelPillClass = (level) => {
    if (level === "Low") return "pill-low";
    if (level === "Moderate") return "pill-moderate";
    return "pill-high";
  };

  return (
    <div className="dashboard-root">
      <AdminSidebar />
      <main className="main-content">
        <header className="content-header">
          <div>
            <h1 className="page-title">All Road Shipments</h1>
            <p className="page-subtitle">
              View shipments from all users and their emission levels.
            </p>
          </div>
        </header>

        <section className="panel">
          <div className="panel-header">
            <h2>Filters</h2>
          </div>
          <div className="filter-row">
            <select
              className="filter-input"
              name="user"
              value={filters.user}
              onChange={handleFilterChange}
            >
              <option>All Users</option>
              <option>Logistics A</option>
              <option>Logistics B</option>
              <option>Logistics C</option>
            </select>

            <select
              className="filter-input"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
            >
              <option>All Status</option>
              <option>Planned</option>
              <option>In review</option>
              <option>Approved</option>
            </select>

            <select
              className="filter-input"
              name="emissionLevel"
              value={filters.emissionLevel}
              onChange={handleFilterChange}
            >
              <option>All Levels</option>
              <option>Low</option>
              <option>Moderate</option>
              <option>High</option>
            </select>
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <h2>Shipment registry</h2>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Shipment ID</th>
                <th>User</th>
                <th>Route</th>
                <th>Mode</th>
                <th>CO₂ (kg)</th>
                <th>Level</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredShipments.length === 0 && (
                <tr>
                  <td colSpan="7">No shipments found.</td>
                </tr>
              )}

              {filteredShipments.map((s) => (
                <tr key={s.id}>
                  <td>{s.id}</td>
                  <td>{s.user}</td>
                  <td>{s.route}</td>
                  <td>{s.mode}</td>
                  <td>{s.co2}</td>
                  <td>
                    <span className={`pill ${levelPillClass(s.level)}`}>
                      {s.level}
                    </span>
                  </td>
                  <td>
                    <span className="pill pill-soft">{s.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}

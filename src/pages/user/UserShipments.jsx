// src/pages/user/UserShipments.jsx
import React, { useState } from "react";
import UserSidebar from "../../components/user/UserSidebar";

export default function UserShipments() {
  const [filters, setFilters] = useState({
    status: "All Status",
    search: "",
  });

  const shipments = [
    {
      id: "#SHP-1001",
      date: "02-12-2025",
      origin: "Chennai",
      destination: "Bangalore",
      mode: "Road",
      co2: 13.4,
      status: "Delivered",
    },
    {
      id: "#SHP-1002",
      date: "30-11-2025",
      origin: "Chennai",
      destination: "Mumbai",
      mode: "Road",
      co2: 20.1,
      status: "In Transit",
    },
    {
      id: "#SHP-1003",
      date: "29-11-2025",
      origin: "Chennai",
      destination: "Hyderabad",
      mode: "Road",
      co2: 10.7,
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
    const matchStatus =
      filters.status === "All Status" || s.status === filters.status;
    const matchSearch =
      filters.search.trim() === "" ||
      s.id.toLowerCase().includes(filters.search.toLowerCase()) ||
      s.destination.toLowerCase().includes(filters.search.toLowerCase()) ||
      s.origin.toLowerCase().includes(filters.search.toLowerCase());

    return matchStatus && matchSearch;
  });

  return (
    <div className="dashboard-root">
      <UserSidebar />
      <main className="main-content">
        <header className="content-header">
          <div>
            <h1 className="page-title">My Shipments</h1>
            <p className="page-subtitle">
              Track your road shipments and their emissions.
            </p>
          </div>
        </header>

        <section className="panel">
          <div className="panel-header">
            <h2>Filter</h2>
          </div>
          <div className="filter-row">
            <select
              className="filter-input"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
            >
              <option>All Status</option>
              <option>Planned</option>
              <option>In Transit</option>
              <option>Delivered</option>
            </select>

            <input
              className="filter-input"
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search by ID, origin or destination"
            />
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <h2>Shipment List</h2>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Shipment ID</th>
                <th>Date</th>
                <th>Origin</th>
                <th>Destination</th>
                <th>Mode</th>
                <th>CO₂ (kg)</th>
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
                  <td>{s.date}</td>
                  <td>{s.origin}</td>
                  <td>{s.destination}</td>
                  <td>{s.mode}</td>
                  <td>{s.co2}</td>
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

import React, { useEffect, useState } from "react";
import AdminSidebar from "../Components/AdminSidebar";
import api from "../api/api";

export default function AdminShipments() {

  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    user: "All Users",
    status: "All Status",
    period: "All Time",
  });

  // 🔹 SINGLE BACKEND CALL
  useEffect(() => {
    api.get("api/admin/shipments")
      .then((res) => {
        setShipments(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching shipments:", err);
        setLoading(false);
      });
  }, []);

  const handleFilterChange = (e) => {
    setFilters((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // 🔹 FILTER LOGIC (Company + Status + Time Period)
  const filteredShipments = shipments.filter((s) => {
    const matchUser =
      filters.user === "All Users" || s.companyName === filters.user;

    const matchStatus =
      filters.status === "All Status" || s.shipmentStatus === filters.status;

    const shipmentDate = new Date(s.shipmentDate);
    const now = new Date();

    let matchPeriod = true;

    if (filters.period === "Today") {
      matchPeriod =
        shipmentDate.toDateString() === now.toDateString();
    }

    if (filters.period === "This Month") {
      matchPeriod =
        shipmentDate.getMonth() === now.getMonth() &&
        shipmentDate.getFullYear() === now.getFullYear();
    }

    if (filters.period === "This Year") {
      matchPeriod =
        shipmentDate.getFullYear() === now.getFullYear();
    }

    return matchUser && matchStatus && matchPeriod;
  });

  // 🔹 LOADING STATE
  if (loading) {
    return <p className="p-8">Loading shipments...</p>;
  }

  return (
    <div className="dashboard-root">
      <AdminSidebar />

      <main className="flex-1 p-8 ml-0 md:ml-[300px]">

        <header className="content-header">
          <div>
            <h1 className="page-title">All Shipments</h1>
            <p className="page-subtitle">
              View and monitor all shipment emissions
            </p>
          </div>
        </header>

        {/* FILTERS */}
        <section className="panel">
          <div className="panel-header">
            <h2>Filters</h2>
          </div>

          <div className="filter-row">

            {/* COMPANY FILTER */}
            <select
              className="filter-input"
              name="user"
              value={filters.user}
              onChange={handleFilterChange}
            >
              <option>All Users</option>
              {[...new Set(shipments.map(s => s.companyName))].map(name => (
                <option key={name}>{name}</option>
              ))}
            </select>

            {/* STATUS FILTER */}
            <select
              className="filter-input"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
            >
              <option>All Status</option>
              <option>Placed</option>
              <option>Transit</option>
            </select>

            {/* TIME PERIOD FILTER */}
            <select
              className="filter-input"
              name="period"
              value={filters.period}
              onChange={handleFilterChange}
            >
              <option>All Time</option>
              <option>Today</option>
              <option>This Month</option>
              <option>This Year</option>
            </select>

          </div>
        </section>

        {/* TABLE */}
        <section className="panel">
          <div className="panel-header">
            <h2>Shipment Registry</h2>
          </div>

          <table className="table">
            <thead>
              <tr>
                <th>Shipment ID</th>
                <th>Shipment Date</th>
                <th>Company Name</th>
                <th>Origin</th>
                <th>Destination</th>
                <th>Total Units</th>
                <th>CO₂ (kg)</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredShipments.length === 0 && (
                <tr>
                  <td colSpan="8">No shipments found.</td>
                </tr>
              )}

              {filteredShipments.map((s) => (
                <tr key={s.shipmentId}>
                  <td>{s.shipmentCode}</td>
                  <td>{s.shipmentDate}</td>
                  <td>{s.companyName}</td>
                  <td>{s.shipmentOrigin}</td>
                  <td>{s.shipmentDestination}</td>
                  <td>{s.shipmentTotalItems}</td>
                  <td>{s.shipmentCO2Emission}</td>
                  <td>{s.shipmentStatus}</td>
                </tr>
              ))}
            </tbody>
          </table>

        </section>
      </main>
    </div>
  );
}

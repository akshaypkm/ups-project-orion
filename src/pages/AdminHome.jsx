// src/pages/admin/AdminHome.jsx
import React from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";

export default function AdminHome() {
  return (
    <div className="dashboard-root">
      <AdminSidebar />

      <main className="main-content">
        <header className="content-header">
          <div>
            <h1 className="page-title">Admin Dashboard</h1>
            <p className="page-subtitle">
              Monitor overall road shipment activity and emissions.
            </p>
          </div>
          <div className="content-header-right">
            <span className="pill pill-soft">Admin</span>
          </div>
        </header>

        <section className="cards-row">
          <article className="card">
            <h3>Total Shipments (Road)</h3>
            <p className="card-value">245</p>
            <p className="card-meta">Last 12 months</p>
          </article>

          <article className="card">
            <h3>Average CO₂ per shipment</h3>
            <p className="card-value">32.5 kg</p>
            <p className="card-meta">Approximate estimate</p>
          </article>

          <article className="card">
            <h3>High-emission routes</h3>
            <p className="card-value">7</p>
            <p className="card-meta">Need optimization</p>
          </article>
        </section>

        <section className="panel">
          <div className="panel-header">
            <h2>Road emissions overview (sample)</h2>
          </div>
          <div className="grid-two">
            <div className="panel-block">
              <h3>Shipment count by region</h3>
              <ul className="list-simple">
                <li>South zone: 120</li>
                <li>West zone: 60</li>
                <li>North zone: 40</li>
                <li>East zone: 25</li>
              </ul>
            </div>
            <div className="panel-block">
              <h3>Emission range distribution</h3>
              <ul className="list-simple">
                <li>0 – 20 kg: 90 shipments</li>
                <li>20 – 60 kg: 120 shipments</li>
                <li>60+ kg: 35 shipments</li>
              </ul>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

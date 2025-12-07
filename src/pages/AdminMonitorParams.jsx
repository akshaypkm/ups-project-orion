// src/pages/admin/AdminMonitorParams.jsx
import React from "react";
import AdminSidebar from "../Components/AdminSidebar";


export default function AdminMonitorParams() {
  return (
    <div className="dashboard-root">
      <AdminSidebar />
      <main className="main-content">
        <header className="content-header">
          <div>
            <h1 className="page-title">Monitor parameters</h1>
            <p className="page-subtitle">
              Configure thresholds and emission factors for road transport.
            </p>
          </div>
        </header>

        <section className="panel">
          <div className="panel-header">
            <h2>Road emission factor (sample)</h2>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Mode</th>
                <th>Factor (kg CO₂ per ton-km)</th>
                <th>Low threshold</th>
                <th>High threshold</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Road</td>
                <td>0.15</td>
                <td>0 – 20 kg</td>
                <td>60+ kg</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section className="panel">
          <div className="panel-header">
            <h2>Update thresholds</h2>
          </div>
          <form className="form-grid">
            <label className="label">
              Mode
              <input
                type="text"
                value="Road"
                disabled
                className="disabled-input"
              />
            </label>

            <label className="label">
              Low threshold (kg)
              <input type="number" min="0" placeholder="e.g., 20" />
            </label>

            <label className="label">
              High threshold (kg)
              <input type="number" min="0" placeholder="e.g., 60" />
            </label>

            <div className="form-actions">
              <button type="button" className="btn">
                Save parameters
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}

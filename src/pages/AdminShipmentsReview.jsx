// src/pages/admin/AdminShipmentsReview.jsx
import React from "react";
import AdminSidebar from "../Components/AdminSidebar";


export default function AdminShipmentsReview() {
  return (
    <div className="dashboard-root">
      <AdminSidebar />
      <main className="main-content">
        <header className="content-header">
          <div>
            <h1 className="page-title">Shipment Review</h1>
            <p className="page-subtitle">
              Review high-emission road shipments and suggest optimizations.
            </p>
          </div>
        </header>

        <section className="panel">
          <div className="panel-header">
            <h2>Pending reviews</h2>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Shipment ID</th>
                <th>User</th>
                <th>Route</th>
                <th>CO₂ (kg)</th>
                <th>Current comment</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>#REV-3001</td>
                <td>Logistics A</td>
                <td>Chennai → Delhi</td>
                <td>80.4</td>
                <td>Road route via high traffic corridor</td>
              </tr>
              <tr>
                <td>#REV-3002</td>
                <td>Logistics B</td>
                <td>Chennai → Mumbai</td>
                <td>65.2</td>
                <td>Multiple partial loads on same truck</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section className="panel">
          <div className="panel-header">
            <h2>Review actions</h2>
          </div>
          <form className="form-grid">
            <label className="label">
              Shipment ID
              <input type="text" placeholder="e.g., REV-3001" />
            </label>

            <label className="label">
              Suggested action
              <select>
                <option>Optimize route</option>
                <option>Consolidate loads</option>
                <option>Reschedule to off-peak hours</option>
                <option>Use higher capacity vehicle</option>
              </select>
            </label>

            <label className="label full-width">
              Comments
              <textarea
                rows="3"
                className="textarea"
                placeholder="Explain why you suggest this change..."
              />
            </label>

            <div className="form-actions">
              <button type="button" className="btn">
                Save review
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}

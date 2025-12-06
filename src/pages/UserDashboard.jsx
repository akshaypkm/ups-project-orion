// src/pages/user/UserHome.jsx
import React from "react";
import UserSidebar from "../Components/UserSideBar";
import { useNavigate } from "react-router-dom";

export default function UserHome() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("ecoroute_token");
    navigate("/");
  };
  
  return (
    <div className="dashboard-root">
      <UserSidebar />

      <main className="main-content">
        <header className="content-header">
          <div>
            <h1 className="page-title">Welcome back</h1>
            <p className="page-subtitle">
              View your recent shipments and overall emissions summary.
            </p>
          </div>
          <div className="content-header-right">
            <span className="pill pill-soft">User</span>
          </div>
        </header>

        <section className="cards-row">
          <article className="card">
            <h3>Total Shipments</h3>
            <p className="card-value">48</p>
            <p className="card-meta">Last 12 months</p>
          </article>

          <article className="card">
            <h3>Estimated Emissions</h3>
            <p className="card-value">124.5 kg CO₂</p>
            <p className="card-meta">All shipments combined</p>
          </article>

          <article className="card">
            <h3>Emission Saved</h3>
            <p className="card-value green">18.2 kg CO₂</p>
            <p className="card-meta">Using optimized road routes</p>
          </article>
        </section>

        <section className="panel">
          <div className="panel-header">
            <h2>Recent Shipments</h2>
            <span className="panel-badge">Sample data</span>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Shipment ID</th>
                <th>Origin</th>
                <th>Destination</th>
                <th>Mode</th>
                <th>CO₂ (kg)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>#SHP-1021</td>
                <td>Chennai</td>
                <td>Bangalore</td>
                <td>Road</td>
                <td>12.3</td>
                <td>
                  <span className="pill pill-success">Delivered</span>
                </td>
              </tr>
              <tr>
                <td>#SHP-1022</td>
                <td>Chennai</td>
                <td>Hyderabad</td>
                <td>Road</td>
                <td>18.1</td>
                <td>
                  <span className="pill pill-warning">In Transit</span>
                </td>
              </tr>
              <tr>
                <td>#SHP-1023</td>
                <td>Chennai</td>
                <td>Mumbai</td>
                <td>Road</td>
                <td>25.4</td>
                <td>
                  <span className="pill pill-info">Planned</span>
                </td>
              </tr>
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}

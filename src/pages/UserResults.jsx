// src/pages/user/UserResults.jsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import UserSidebar from "../Components/UserSideBar";


export default function UserResults() {
  const location = useLocation();
  const navigate = useNavigate();

  const data = location.state;

  const emissions = data?.emissions || "0.00";
  const inputs = data?.inputs || {
    origin: "-",
    destination: "-",
    distance: "-",
    weight: "-",
    mode: "Road",
  };

  const numericEmissions = parseFloat(emissions);
  const rating =
    numericEmissions <= 20
      ? "Low"
      : numericEmissions <= 60
      ? "Moderate"
      : "High";

  const pillClass =
    rating === "Low"
      ? "pill-low"
      : rating === "Moderate"
      ? "pill-moderate"
      : "pill-high";

  return (
    <div className="dashboard-root">
      <UserSidebar />
      <main className="main-content">
        <header className="content-header">
          <div>
            <h1 className="page-title">Emission Results</h1>
            <p className="page-subtitle">
              Summary of estimated emissions for your road shipment.
            </p>
          </div>
        </header>

        <section className="cards-row">
          <article className="card wide-card">
            <h3>Estimated CO₂ emissions</h3>
            <p className="result-number">{emissions} kg CO₂</p>
            <p className="card-meta">
              Based on distance and weight for road transport.
            </p>
            <p className="result-rating">
              Rating:{" "}
              <span className={`pill ${pillClass}`}>{rating}</span>
            </p>
          </article>
        </section>

        <section className="panel">
          <div className="panel-header">
            <h2>Input summary</h2>
          </div>
          <div className="result-grid">
            <div className="result-item">
              <span className="result-label">Origin</span>
              <span className="result-value">{inputs.origin}</span>
            </div>
            <div className="result-item">
              <span className="result-label">Destination</span>
              <span className="result-value">{inputs.destination}</span>
            </div>
            <div className="result-item">
              <span className="result-label">Distance</span>
              <span className="result-value">{inputs.distance} km</span>
            </div>
            <div className="result-item">
              <span className="result-label">Weight</span>
              <span className="result-value">{inputs.weight} tons</span>
            </div>
            <div className="result-item">
              <span className="result-label">Mode</span>
              <span className="result-value">{inputs.mode}</span>
            </div>
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <h2>Recommendations</h2>
          </div>
          <ul className="recommendations">
            <li>
              Combine smaller shipments into a single truck to avoid multiple trips.
            </li>
            <li>
              Optimize routes to reduce empty return trips and idle time in traffic.
            </li>
            <li>
              Use well-maintained vehicles and proper tyre pressure to improve fuel
              efficiency.
            </li>
          </ul>

          <button
            className="btn-secondary"
            onClick={() => navigate("/user/calculator")}
          >
            Recalculate
          </button>
        </section>
      </main>
    </div>
  );
}

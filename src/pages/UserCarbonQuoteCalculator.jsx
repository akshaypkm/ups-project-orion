// src/pages/user/UserCalculator.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import UserSidebar from "../Components/UserSideBar";


export default function UserCalculator() {
  const [form, setForm] = useState({
    origin: "",
    destination: "",
    distance: "",
    weight: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const distance = parseFloat(form.distance || 0);
    const weight = parseFloat(form.weight || 0);

    // Road-only emission factor
    const emissionFactor = 0.15; // example kg CO2 per ton-km

    const emissions = distance * weight * emissionFactor;

    navigate("/user/results", {
      state: {
        inputs: { ...form, mode: "Road" },
        emissions: emissions.toFixed(2),
      },
    });
  };

  return (
    <div className="dashboard-root">
      <UserSidebar />
      <main className="main-content">
        <header className="content-header">
          <div>
            <h1 className="page-title">Emission Calculator</h1>
            <p className="page-subtitle">
              Estimate CO₂ emissions for a road shipment.
            </p>
          </div>
        </header>

        <section className="panel">
          <div className="panel-header">
            <h2>Enter shipment details</h2>
          </div>

          <form className="form-grid" onSubmit={handleSubmit}>
            <label className="label">
              Origin
              <input
                type="text"
                name="origin"
                value={form.origin}
                onChange={handleChange}
                placeholder="e.g., Chennai"
                required
              />
            </label>

            <label className="label">
              Destination
              <input
                type="text"
                name="destination"
                value={form.destination}
                onChange={handleChange}
                placeholder="e.g., Bangalore"
                required
              />
            </label>

            <label className="label">
              Distance (km)
              <input
                type="number"
                name="distance"
                value={form.distance}
                onChange={handleChange}
                min="0"
                step="0.1"
                placeholder="e.g., 350"
                required
              />
            </label>

            <label className="label">
              Shipment weight (tons)
              <input
                type="number"
                name="weight"
                value={form.weight}
                onChange={handleChange}
                min="0"
                step="0.1"
                placeholder="e.g., 2.5"
                required
              />
            </label>

            <label className="label">
              Mode of Transport
              <input
                type="text"
                value="Road"
                disabled
                className="disabled-input"
              />
            </label>

            <div className="form-actions">
              <button type="submit" className="btn">
                Calculate Emissions
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}

// src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
// If you want to use Auth later, keep this
// import AuthPage from "./pages/AuthPage";

// User pages
import UserHome from "./pages/user/UserHome";
import UserShipments from "./pages/user/UserShipments";
import UserCalculator from "./pages/user/UserCalculator";
import UserResults from "./pages/user/UserResults";

// Admin pages
import AdminHome from "./pages/admin/AdminHome";
import AdminShipments from "./pages/admin/AdminShipments";
import AdminShipmentsReview from "./pages/admin/AdminShipmentsReview";
import AdminMonitorParams from "./pages/admin/AdminMonitorParams";

export default function App() {
  return (
    <Routes>
      {/* Default route – open user dashboard directly */}
      <Route path="/" element={<UserHome />} />

      {/* User routes */}
      <Route path="/user/home" element={<UserHome />} />
      <Route path="/user/shipments" element={<UserShipments />} />
      <Route path="/user/calculator" element={<UserCalculator />} />
      <Route path="/user/results" element={<UserResults />} />

      {/* Admin routes */}
      <Route path="/admin/home" element={<AdminHome />} />
      <Route path="/admin/shipments" element={<AdminShipments />} />
      <Route
        path="/admin/shipments/review"
        element={<AdminShipmentsReview />}
      />
      <Route path="/admin/monitor" element={<AdminMonitorParams />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

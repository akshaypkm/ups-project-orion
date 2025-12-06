import React from "react";
import { Routes, Route } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import ClientDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminPanel";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AuthPage />} />
      <Route path="/client-dashboard" element={<ClientDashboard />} />
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
    </Routes>
  );
}

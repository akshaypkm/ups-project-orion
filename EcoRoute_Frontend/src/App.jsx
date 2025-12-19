import React from "react";
import { Routes, Route } from "react-router-dom";

// AUTH
import AuthPage from "./pages/AuthPage";

// USER PAGES
import UserDashboard from "./pages/UserDashboard";
import UserShipments from "./pages/UserShipments";
import UserCarbonQuoteCalculator from "./pages/UserCarbonQuoteCalculator";
import UserResults from "./pages/UserResults";

// ADMIN PAGES
import AdminPanel from "./pages/AdminPanel";
import AdminDashboard from "./pages/AdminDashboard";
import AdminShipments from "./pages/AdminShipments";
import AdminShipmentsReview from "./pages/AdminShipmentsReview";
// import AdminMonitorParams from "./pages/AdminMonitorParams";

import ProtectedRoute from "./ProtectedRoute";

import Unauthorized from "./Unauthorized";
import ClientDashboard from "./pages/UserDashboard";

export default function App() {
  return (
    <Routes>

      {/* LOGIN PAGE */}
      <Route path="/" element={<AuthPage />} />

      {/* USER ROUTES */}
      <Route
        path="/client-dashboard/*"
        element={
          <ProtectedRoute allowedRoles={["client"]}>
            <UserDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="" element={<UserDashboard />} />
      <Route path="shipments" element={<UserShipments />} />
      <Route path="carbon-quote" element={<UserCarbonQuoteCalculator />} />
      <Route path="results" element={<UserResults />} />


      {/* ADMIN ROUTES */}
      <Route
        path="/admin-dashboard/*"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="" element={<AdminDashboard />} />
      <Route path="shipments" element={<AdminShipments />} />
      <Route path="shipments-review" element={<AdminShipmentsReview />} />
      {/* <Route path="/admin/monitor" element={<AdminMonitorParams />} /> */}


      <Route path="/unauthorized" element={<Unauthorized />} />
    </Routes>
  );
}



// import React from "react";
// import { Routes, Route } from "react-router-dom";
// import AuthPage from "./pages/AuthPage";
// import Dashboard from "./pages/UserDashboard";
// import AdminPanel from "./pages/AdminPanel";

// export default function App() {
//   return (
//     <Routes>
//       <Route path="/" element={<AuthPage />} />
//       <Route path="/UserDashboard" element={<Dashboard />} />
//       <Route path="/admin" element={<AdminPanel />} />
//     </Routes>
//   );
// }
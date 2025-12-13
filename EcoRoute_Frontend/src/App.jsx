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
import AdminHome from "./pages/AdminHome";
import AdminShipments from "./pages/AdminShipments";
import AdminShipmentsReview from "./pages/AdminShipmentsReview";
import AdminMonitorParams from "./pages/AdminMonitorParams";

export default function App() {
  return (
    <Routes>

      {/* LOGIN PAGE */}
      <Route path="/" element={<AuthPage />} />

      {/* USER ROUTES */}
{/* <Route path="/user/home" element={<clientDashboard />} /> */}
<Route path="/client-dashboard" element={<UserDashboard />} />
<Route path="/client-shipments" element={<UserShipments />} />
<Route path="/carbon-quote-calculator" element={<UserCarbonQuoteCalculator />} />
<Route path="/quote-results" element={<UserResults />} />


      {/* ADMIN ROUTES */}
      <Route path="/admin" element={<AdminPanel />} />
      <Route path="/admin/home" element={<AdminHome />} />
      <Route path="/admin/shipments" element={<AdminShipments />} />
      <Route path="/admin/shipments/review" element={<AdminShipmentsReview />} />
      <Route path="/admin/monitor" element={<AdminMonitorParams />} />

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
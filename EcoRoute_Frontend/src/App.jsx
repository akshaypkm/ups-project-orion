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
import AdminMonitorParams from "./pages/AdminMonitorParams";
import AdminShipmentsReview from "./pages/AdminShipmentsReview";

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
      <Route path="/admin-dashboard" element={<AdminPanel />}>
        <Route index element={<AdminDashboard />} />
      </Route>

      <Route path="/admin-shipments" element={<AdminPanel />}>
        <Route index element={<AdminShipments />} />
      </Route>

      <Route path="/admin-monitor" element={<AdminPanel />}>
        <Route index element={<AdminMonitorParams />} />
      </Route>

      <Route path="/admin-review" element={<AdminPanel />}>
        <Route index element={<AdminShipmentsReview />} />
      </Route>

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
// );
// }
import { Routes, Route, Navigate } from "react-router-dom";

import UserSideBar from "./Components/UserSideBar";
import UserDashboard from "./pages/UserDashboard";
import UserCarbonQuoteCalculator from "./pages/UserCarbonQuoteCalculator";
import UserShipments from "./pages/UserShipments";
import UserResults from "./pages/UserResults";

export default function App() {
  return (
    <div className="min-h-screen bg-[#f5f7fb] flex">

      {/* FIXED SIDEBAR */}
      <UserSideBar />

      {/* MAIN CONTENT - always shifted right by 256px (w-64) */}
      <div className="ml-64 p-10 flex-1">
        <div className="max-w-6xl mx-auto w-full">
          <Routes>
            <Route path="/" element={<Navigate to="/user/home" />} />

            {/* USER ROUTES */}
            <Route path="/user/home" element={<UserDashboard />} />
            <Route path="/user/calculator" element={<UserCarbonQuoteCalculator />} />
            <Route path="/user/shipments" element={<UserShipments />} />
            <Route path="/user/results" element={<UserResults />} />
          </Routes>
        </div>
      </div>

    </div>
  );
}
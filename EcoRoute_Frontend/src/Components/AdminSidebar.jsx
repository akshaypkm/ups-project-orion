import { useLocation, useNavigate } from "react-router-dom";
import {
  FiHome,
  FiTruck,
  FiSettings,
  FiCheckCircle,
  FiLogOut,
} from "react-icons/fi";

export default function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  // Function to apply active styles
  const getNavItemClasses = (path) => {
    const isActive = location.pathname === path;

    return `
      flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium
      transition-all cursor-pointer
      ${
        isActive
          ? "bg-blue-100 text-blue-700"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      }
    `;
  };

  return (
    <div className="w-64 min-h-screen bg-white border-r flex flex-col justify-between">
      {/* TOP SECTION */}
      <div>
        {/* LOGO */}
        <div className="flex items-center gap-3 px-4 py-6">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <span className="text-blue-600 font-bold text-lg">⛯</span>
          </div>
          <div>
            <p className="font-semibold text-gray-900">EcoRoute</p>
            <p className="text-xs text-gray-500">Admin</p>
          </div>
        </div>

        {/* NAVIGATION */}
        <nav className="px-3 space-y-1">
          <div
            className={getNavItemClasses("/admin-dashboard")}
            onClick={() => navigate("/admin-dashboard")}
          >
            <FiHome className="text-lg" />
            Dashboard
          </div>

          <div
            className={getNavItemClasses("/admin-shipments")}
            onClick={() => navigate("/admin-shipments")}
          >
            <FiTruck className="text-lg" />
            Shipment History
          </div>

          <div
            className={getNavItemClasses("/admin-monitor")}
            onClick={() => navigate("/admin-monitor")}
          >
            <FiSettings className="text-lg" />
            Monitor Parameters
          </div>

          <div
            className={getNavItemClasses("/admin-review")}
            onClick={() => navigate("/admin-review")}
          >
            <FiCheckCircle className="text-lg" />
            Review Requests
          </div>
        </nav>
      </div>

      {/* BOTTOM SECTION */}
      <div className="px-4 py-4 border-t">
        <button
          className="flex items-center gap-3 text-sm text-gray-500 hover:text-red-600 transition"
          onClick={() => {
            // add logout logic if needed
            navigate("/");
          }}
        >
          <FiLogOut />
          Logout
        </button>
      </div>
    </div>
  );
}

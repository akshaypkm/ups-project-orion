import React, { useEffect, useState } from "react";
import AdminSidebar from "../Components/AdminSidebar";
import api from "../api/api";
import { useNavigate } from "react-router-dom";

export default function AdminShipments() {

  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [confirmAction, setConfirmAction] = useState(null);
  const handleNotifications = async () => {
  try {
    const res = await api.get("/admin-dashboard/notifications");
    setNotifications(res.data);
  } catch (err) {
    console.error("Admin notifications failed");
  }
};
  const handleLogout = () => {
  localStorage.removeItem("ecoroute_token");
  navigate("/");
};

  const [filters, setFilters] = useState({
    user: "All Users",
    status: "All Status",
    period: "All Time",
  });

  // 🔹 SINGLE BACKEND CALL
  useEffect(() => {
    api.get("/admin/shipments")
      .then((res) => {
        setShipments(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching shipments:", err);
        setLoading(false);
      });
  }, []);

  const handleFilterChange = (e) => {
    setFilters((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

    const uniqueUsers = [
      ...new Set(
        shipments
          .map(s => s.companyName)
          .filter(Boolean)
      )
    ];

  // 🔹 FILTER LOGIC (Company + Status + Time Period)
  const filteredShipments = shipments.filter((s) => {
    const matchUser =
  filters.user === "All Users" ||
  (Array.isArray(s.companyName)
    ? s.companyName.includes(filters.user)
    : s.companyName === filters.user);

    const matchStatus =
      filters.status === "All Status" || s.shipmentStatus === filters.status;

    const shipmentDate = new Date(s.shipmentDate);
    const now = new Date();

    let matchPeriod = true;

    if (filters.period === "Today") {
      matchPeriod =
        shipmentDate.toDateString() === now.toDateString();
    }

    if (filters.period === "This Month") {
      matchPeriod =
        shipmentDate.getMonth() === now.getMonth() &&
        shipmentDate.getFullYear() === now.getFullYear();
    }

    if (filters.period === "This Year") {
      matchPeriod =
        shipmentDate.getFullYear() === now.getFullYear();
    }

    return matchUser && matchStatus && matchPeriod;
  });

  // 🔹 LOADING STATE
  if (loading) {
    return <p className="p-8">Loading shipments...</p>;
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-emerald-100 via-teal-100 to-blue-200 overflow-hidden">
      <AdminSidebar />

      <main className="flex-1 ml-0 md:ml-[250px] px-6 py-6 overflow-y-auto">
        <div className="space-y-6">

        <header className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-600 bg-clip-text text-transparent">All Shipments</h1>
            <div className="flex items-center gap-4">
                 {/* Notifications */}
                 <div className="relative">
                  <button
                  className="p-2 rounded-full hover:bg-blue-100 transition"
                  onClick={() => {
                    if (!isNotifOpen) handleNotifications();
                    setIsNotifOpen(!isNotifOpen);}}>
                      <span className="material-symbols-outlined text-gray-600">notifications</span>
                  </button>
                {isNotifOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 p-2 z-50 max-h-64 overflow-y-auto">
                    <h4 className="text-xs font-bold text-gray-400 uppercase px-2 py-1 mb-1">Notifications</h4>
                    {notifications.length > 0 ? (
                      notifications.map((n, i) => (
                      <div key={i} className="p-3 text-sm text-blue-700 bg-gray-50 rounded-xl hover:bg-gray-100">
                        {n.message}
                      </div>)) ) : (
                        <p className="text-sm text-gray-500 text-center py-4">No new notifications</p>
                        )}
                        </div>
                      )}
                      </div>
                {/* Profile */}
                <div className="relative">
                  <button
                  className="p-2 rounded-full hover:bg-blue-100 transition"
                  onClick={() => setIsProfileOpen(!isProfileOpen)}>
                    <span className="material-symbols-outlined text-gray-600 text-3xl">account_circle</span>
                    </button>
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border py-2 z-50">
                      <div className="px-4 py-2 border-b">
                        <p className="text-sm font-bold text-blue-800">Admin Profile</p>
                      </div>
                    <button
                    onClick={() => setConfirmAction({ type: "logout" })}
                    className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg">logout</span>Log Out
                      </button>
                      </div>
                    )}
                    </div>
                  </div>
        </header>
        <p className="page-subtitle">View and monitor all shipment emissions</p>

        {/* FILTERS */}
        <section className="bg-white/70 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/30 p-6">
        {/* Header */}
        <h2 className="text-lg font-semibold flex items-center gap-2 text-blue-700 mb-4">
          <span className="material-symbols-outlined bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-600 bg-clip-text text-transparent">
            filter_list</span>Filters</h2>
            {/* Filters Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* COMPANY FILTER */}
              <select
                className="px-4 py-2 rounded-xl border border-blue-200 bg-white/80 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                name="user"
                value={filters.user}
                onChange={handleFilterChange}
              >
                <option value="All Users">All Users</option>
                {uniqueUsers.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            {/* STATUS FILTER */}
            <select
            className="px-4 py-2 rounded-xl border border-blue-200 bg-white/80 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            name="status"
            value={filters.status}
            onChange={handleFilterChange}>
              <option>All Status</option>
              <option>Placed</option>
              <option>Processing</option>
              <option>Planed</option>
              </select>
            {/* TIME PERIOD FILTER */}
            <select
            className="px-4 py-2 rounded-xl border border-blue-200 bg-white/80 text-sm text-gray-700focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            name="period"
            value={filters.period}
            onChange={handleFilterChange}>
              <option>All Time</option>
              <option>Today</option>
              <option>This Month</option>
              <option>This Year</option>
              </select>
            </div>
          </section>


       {/* TABLE */}
<section className="bg-white/70 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/30 p-6">

  {/* Header */}
  <h2 className="text-lg font-semibold flex items-center gap-2 text-blue-700 mb-4">
    <span className="material-symbols-outlined bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-600 bg-clip-text text-transparent">
      table_chart
    </span>
    Shipment Registry
  </h2>

  {/* Table Wrapper for Scroll */}
  <div className="overflow-x-auto rounded-2xl border border-blue-100">

    <table className="min-w-full text-sm text-left text-gray-700">

      {/* Table Head */}
      <thead className="bg-gradient-to-r from-emerald-100 via-teal-100 to-blue-100 text-gray-700 text-xs uppercase">
        <tr>
          <th className="px-4 py-3">Shipment ID</th>
          <th className="px-4 py-3">Shipment Date</th>
          <th className="px-4 py-3">Company Name</th>
          <th className="px-4 py-3">Origin</th>
          <th className="px-4 py-3">Destination</th>
          <th className="px-4 py-3">Order Mode</th>
          <th className="px-4 py-3">Total Units</th>
          <th className="px-4 py-3">CO₂ (kg)</th>
          <th className="px-4 py-3">Status</th>
        </tr>
      </thead>

      {/* Table Body */}
      <tbody className="bg-white/80 divide-y divide-blue-100">

        {filteredShipments.length === 0 && (
          <tr>
            <td colSpan="8" className="text-center py-6 text-gray-500">
              No shipments found.
            </td>
          </tr>
        )}

        {filteredShipments.map((s) => (
          <tr
            key={s.shipmentId}
            className="hover:bg-blue-50/60 transition"
          >
            <td className="px-4 py-3 font-medium">{s.shipmentCode}</td>
            <td className="px-4 py-3">
              {new Date(s.shipmentDate).toLocaleDateString()}
            </td>
            <td className="px-4 py-3">
              {Array.isArray(s.companyName)
  ? s.companyName.join(", ").toUpperCase()
  : s.companyName?.toUpperCase()}
            </td>
            <td className="px-4 py-3">{s.shipmentOrigin.toUpperCase()}</td>
            <td className="px-4 py-3">{s.shipmentDestination.toUpperCase()}</td>
            <td className="px-4 py-3">{s.shipmentMode.toUpperCase()}</td>
            <td className="px-4 py-3">{s.shipmentTotalItems}</td>
            <td className="px-4 py-3">
              {s.shipmentCO2Emission.toFixed(2)}
            </td>

            {/* Status Badge */}
            <td className="px-4 py-3">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold
                ${
                  s.shipmentStatus === "Placed"
                    ? "bg-blue-100 text-blue-700"
                    : s.shipmentStatus === "Processing"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-emerald-100 text-emerald-700"
                }
              `}>
                {s.shipmentStatus.toUpperCase()}
              </span>
            </td>
          </tr>
        ))}

      </tbody>
    </table>
  </div>
</section>

        </div>
        {confirmAction && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in-95">
              <h3 className="text-lg font-bold bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-600 bg-clip-text text-transparent mb-3">Confirm Logout</h3>
              <p className="text-sm text-gray-600 mb-4">You are about to <b>log out</b> of your admin account.<br />
              <span className="text-xs text-gray-500">You will need to log in again to access the admin panel.</span></p>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
              onClick={() => setConfirmAction(null)}
              className="px-4 py-2 text-sm rounded-xl border border-blue-600 text-blue-700 hover:bg-blue-50 transition-transform hover:scale-105 active:scale-95">Cancel
              </button>
              <button
              onClick={() => {
                handleLogout();
                setConfirmAction(null);
              }}
              className="px-4 py-2 text-sm rounded-xl text-white bg-red-500 hover:bg-red-600 transition-transform hover:scale-105 active:scale-95">
                Confirm</button>
                </div>
              </div>
            </div>)}
          </main>
    </div>
  );
}
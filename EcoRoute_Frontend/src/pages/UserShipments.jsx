import React, { useState, useEffect } from "react";
import api from "../api/api"; // Ensure axios instance is imported
import Sidebar from "../Components/UserSideBar"; // Assuming you want the sidebar here too

export default function UserShipments() {
  const [loading, setLoading] = useState(true);
  const [shipments, setShipments] = useState([]);
  
  // Backend Parameter State
  const [orderPeriod, setOrderPeriod] = useState("month"); // 'month' or 'year'

  // Frontend Filter State
  const [filters, setFilters] = useState({
    status: "All Status",
    search: "",
  });

  // --- 1. Fetch Data from Backend ---
  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        // Calls: public async Task<IActionResult> GetShipmentHistory([FromQuery] string OrderPeriod = "month", string Filter = "bySavings")
        const res = await api.get("/client-shipment-history", {
          params: {
            OrderPeriod: orderPeriod,
            Filter: "bySavings" // Keeping default filter as per controller
          }
        });
        setShipments(res.data);
      } catch (err) {
        console.error("Failed to fetch history", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [orderPeriod]); // Refetch when period changes

  // --- 2. Handle Frontend Filtering ---
  const handleFilterChange = (e) => {
    setFilters((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Filter logic applied to the data fetched from API
  const filteredShipments = shipments.filter((s) => {
    // 1. Status Filter
    const status = s.orderStatus || "Unknown"; 
    const matchStatus =
      filters.status === "All Status" || 
      status.toLowerCase() === filters.status.toLowerCase();
      
    // 2. Search Filter (ID, Origin, Destination)
    const searchTerm = filters.search.toLowerCase();
    const matchSearch =
      filters.search.trim() === "" ||
      (s.orderId && s.orderId.toString().toLowerCase().includes(searchTerm)) ||
      (s.orderDestination && s.orderDestination.toLowerCase().includes(searchTerm)) ||
      (s.orderOrigin && s.orderOrigin.toLowerCase().includes(searchTerm));

    return matchStatus && matchSearch;
  });

  // Helper for Status Colors
  const getStatusColor = (status) => {
    const s = status?.toLowerCase() || "";
    if (s === "placed" ) return "bg-darkgreen-100 text-darkgreen-600";
    if (s === "processing" ) return "bg-orange-100 text-orange-600";
    if (s === "planned" ) return "bg-yellow-100 text-yellow-600";

    return "bg-gray-100 text-gray-600";
  };

  // Helper for Mode Colors
  const getModeColor = (m) => {
    if (m <= 0) return "bg-red-100 text-red-600";
    if (m > 1) return "bg-green-100 text-green-600";
    return "bg-emerald-100 text-emerald-600"; // Ground/Truck
  };

  // Helper for Footprint Colors
  const getFootprintColor = (value) => {
    if (value < 2) return "text-emerald-600";
    if (value < 5) return "text-orange-500";
    return "text-red-600";
  };

  return (
    <div className="flex">
      {/* Sidebar added to match layout structure */}
      <div className="fixed inset-y-0 left-0 z-50">
        <Sidebar />
      </div>

      {/* Main Content with margin for sidebar */}
      <main className="flex-1 p-8 ml-64 bg-gray-50 min-h-screen">
        <div className="space-y-6">
          {/* HEADER */}
          <h1 className="text-3xl font-bold text-gray-800">Shipment History</h1>

          {/* SUB-HEADER */}
          <h2 className="text-2xl font-semibold text-center text-gray-700">
            Detailed Report of Shipment History
          </h2>

          {/* MAIN CARD */}
          <div className="bg-white border shadow-sm p-6 rounded-xl w-full">

            {/* --- Search & Filter Row --- */}
            <div className="flex flex-wrap items-center gap-4">

              {/* Search box */}
              <div className="flex-1 min-w-[200px]">
                <input
                  type="text"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Search by ID, Origin, Destination..."
                  className="w-full px-4 py-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              {/* Backend Time Period Filter */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-500">Period:</span>
                <select 
                  value={orderPeriod}
                  onChange={(e) => setOrderPeriod(e.target.value)}
                  className="px-4 py-3 border rounded-lg bg-gray-50 cursor-pointer focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="day">This Day</option>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                </select>
              </div>

              {/* Frontend Status Filter */}
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="px-4 py-3 border rounded-lg bg-gray-50 cursor-pointer focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option>All Status</option>
                <option>Placed</option>
                <option>Processing</option>
                <option>Planned</option>

              </select>

            </div>

            {/* --- TABLE --- */}
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b text-gray-500 text-sm">
                    <th className="pb-3">ID</th>
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Origin</th>
                    <th className="pb-3">Destination</th>
                    <th className="pb-3">Quantity</th>
                    <th className="pb-3">Net Weight</th>
                    <th className="pb-3">Emissions Saved</th>
                    <th className="pb-3">Carbon Footprint</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>

                <tbody className="text-sm">
                  {loading ? (
                    <tr><td colSpan="9" className="py-8 text-center text-gray-500">Loading records...</td></tr>
                  ) : filteredShipments.length === 0 ? (
                    <tr><td colSpan="9" className="py-8 text-center text-gray-500">No shipments found.</td></tr>
                  ) : (
                    filteredShipments.map((row, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="py-3 font-semibold text-emerald-600">{row.shipmentCode || "N/A"}</td>
                        <td className="text-gray-600">
                          {row.orderDate ? new Date(row.orderDate).toLocaleDateString() : "N/A"}
                        </td>
                        <td className="font-medium text-gray-800">{row.orderOrigin.toUpperCase()}</td>
                        <td className="font-medium text-gray-800">{row.orderDestination.toUpperCase()}</td>
                        <td className="text-gray-600">{row.orderTotalItems || row.unitCount || 0} units</td>
                        <td className="text-gray-600">{row.orderWeightKg || 0} kg</td>

                        {/* Mode pill */}
                        <td>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getModeColor(row.orderEmissionsSaved)}`}>
                            {(row.orderEmissionsSaved.toFixed(2))} Kg CO₂e
                          </span>
                        </td>

                        {/* Footprint */}
                        <td className={`font-semibold ${getFootprintColor(row.orderCO2Emission)}`}>
                          {row.orderCO2Emission ? row.orderCO2Emission.toFixed(2) : "0.00"} Kg CO₂e
                        </td>

                        {/* Status */}
                        <td>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(row.orderStatus)}`}>
                            {row.orderStatus.toUpperCase() || "Pending"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* --- FOOTER TEXT --- */}
            <p className="text-sm text-gray-500 mt-4">
              Showing {filteredShipments.length} results
            </p>

            {/* --- Pagination (Visual Only for now) --- */}
            {/* <div className="flex items-center justify-center gap-2 mt-4">
              <button className="px-3 py-1 border rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100">{"<"}</button>
              <button className="px-3 py-1 border rounded-lg bg-emerald-500 text-white">1</button>
              <button className="px-3 py-1 border rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100">2</button>
              <button className="px-3 py-1 border rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100">3</button>
              <span className="px-3 py-1 border rounded-lg bg-gray-50 text-gray-400">...</span>
              <button className="px-3 py-1 border rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100">{">"}</button>
            </div> */}

          </div>
        </div>
      </main>
    </div>
  );
}
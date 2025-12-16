import { useState } from "react";
import AdminSidebar from "../Components/AdminSidebar";
import RouteMap from "../Components/RouteMap";
import { Search } from "lucide-react";

const mockShipments = [
  {
    orderId: "ORD-10384",
    date: "2023-11-14",
    origin: "Mumbai, IN",
    destination: "Delhi, IN",
    status: "Pending Review",
    weight: 4200,
    distance: 1420,
    emissions: 368,
    reduction: -12.4,
    region: "IN",
    polyline: "ENCODED_POLYLINE_STRING"
  },
  {
    orderId: "ORD-10385",
    date: "2023-11-15",
    origin: "Chennai, IN",
    destination: "Bangalore, IN",
    status: "Pending",
    weight: 3900,
    distance: 350,
    emissions: 210,
    reduction: -8.1,
    region: "IN",
    polyline: "ENCODED_POLYLINE_STRING"
  }
];

export default function AdminShipmentsReview() {
  const [openCard, setOpenCard] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Pending");
  const [regionFilter, setRegionFilter] = useState("All");

  const filteredShipments = mockShipments.filter((ship) => {
    const matchSearch = ship.orderId
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchStatus =
      statusFilter === "All" || ship.status === statusFilter;

    const matchRegion =
      regionFilter === "All" || ship.region === regionFilter;

    return matchSearch && matchStatus && matchRegion;
  });

  return (
    <div className="flex min-h-screen bg-[#f5f7fb]">
      {/* SIDEBAR */}
      <AdminSidebar />

      {/* MAIN CONTENT */}
      <div className="flex-1 ml-64 px-10 py-8">
        {/* HEADER */}
        <h1 className="text-3xl font-bold text-gray-800">
          Shipment Review
        </h1>
        <p className="text-gray-500 mb-6">
          Review and approve pending shipments for carbon compliance.
        </p>

        {/* FILTER BAR */}
        <div className="flex items-center gap-4 mb-8">
          {/* SEARCH */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by Order ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* STATUS FILTER */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg bg-white"
          >
            <option value="All">Status: All</option>
            <option value="Pending">Pending</option>
            <option value="Pending Review">Pending Review</option>
          </select>

          {/* REGION FILTER */}
          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg bg-white"
          >
            <option value="All">Filter by Region</option>
            <option value="IN">India</option>
          </select>
        </div>

        {/* SHIPMENT CARDS */}
        <div className="space-y-5">
          {filteredShipments.map((ship) => {
            const isOpen = openCard === ship.orderId;

            return (
              <div
                key={ship.orderId}
                className={`bg-white rounded-xl border transition ${
                  isOpen
                    ? "ring-2 ring-blue-400"
                    : "hover:shadow-md"
                }`}
              >
                {/* CARD HEADER */}
                <div
                  onClick={() =>
                    setOpenCard(isOpen ? null : ship.orderId)
                  }
                  className="px-6 py-5 flex justify-between items-center cursor-pointer"
                >
                  <div>
                    <p className="text-blue-600 font-semibold">
                      {ship.orderId}
                    </p>
                    <p className="text-sm text-gray-500">
                      {ship.origin} → {ship.destination}
                    </p>
                  </div>

                  <span
                    className={`px-3 py-1 text-sm rounded-full ${
                      ship.status === "Pending Review"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {ship.status}
                  </span>
                </div>

                {/* EXPANDED VIEW */}
                {isOpen && (
                  <div className="border-t px-6 py-5 space-y-6">
                    {/* MAP */}
                    <div className="h-[360px] rounded-lg overflow-hidden border">
                      <RouteMap encodedPolyline={ship.polyline} />
                    </div>

                    {/* DETAILS */}
                    <div className="grid grid-cols-4 gap-6 text-sm">
                      <div>
                        <p className="text-gray-400">Date</p>
                        <p className="font-medium">{ship.date}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Weight</p>
                        <p className="font-medium">{ship.weight} kg</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Distance</p>
                        <p className="font-medium">{ship.distance} km</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Emissions</p>
                        <p className="font-medium text-green-600">
                          {ship.emissions} kg CO₂e
                        </p>
                      </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => setOpenCard(null)}
                        className="px-4 py-2 rounded-lg border"
                      >
                        Close
                      </button>
                      <button className="px-4 py-2 rounded-lg bg-blue-500 text-white">
                        Approve
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {filteredShipments.length === 0 && (
            <p className="text-center text-gray-500">
              No shipments found
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

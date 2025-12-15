import { FiSearch, FiChevronRight } from "react-icons/fi";
import RouteMap from "../Components/RouteMap";

export default function AdminShipmentsReview() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Shipment Review</h1>
      <p className="text-gray-500">
        Review and approve pending shipments for carbon compliance.
      </p>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="flex items-center gap-2 px-3 py-2 border rounded-lg bg-white w-64">
          <FiSearch className="text-gray-400" />
          <input
            placeholder="Search by Order ID..."
            className="outline-none text-sm w-full"
          />
        </div>

        <select className="px-3 py-2 border rounded-lg bg-white text-sm">
          <option>Status: Pending</option>
        </select>

        <select className="px-3 py-2 border rounded-lg bg-white text-sm">
          <option>Filter by Region</option>
        </select>
      </div>

      {/* Selected Order */}
      <div className="bg-white border rounded-xl shadow-sm p-4">
        <div className="flex justify-between items-center mb-3">
          <div className="font-semibold text-blue-600">
            ORD-10384
          </div>
          <span className="px-3 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">
            Pending Review
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* MAP */}
          <div className="md:col-span-2 rounded-lg overflow-hidden h-[360px]">
            <RouteMap encodedPolyline="" />
          </div>

          {/* DETAILS */}
          <div className="border rounded-lg p-4 space-y-3">
            <h3 className="font-semibold">Shipment Details</h3>

            <Detail label="Shippers" value="StyleShoe Ltd, TechParts Co." />
            <Detail label="Date" value="14 Nov 2023" />
            <Detail label="Weight" value="4,200 kg" />
            <Detail label="Route Distance" value="1,420 km (Road)" />

            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">Total Emissions</p>
              <p className="text-2xl font-bold text-green-600">
                368 kg
              </p>
              <p className="text-xs text-green-600">▼ 12.4%</p>
            </div>

            <div className="flex gap-2 pt-2">
              <button className="px-4 py-2 bg-gray-200 rounded-lg">
                Close
              </button>
              <button className="px-4 py-2 bg-red-500 text-white rounded-lg">
                Cancel
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                Approve
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div className="text-sm">
      <p className="text-gray-500">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}

import { useState } from "react";

export default function UserShipments() {
  // Dummy shipment data (replace with API data later)
  const shipments = [
    {
      id: "SHP-10542",
      date: "2023-10-26",
      origin: "Mumbai, IN",
      destination: "Delhi, IN",
      quantity: "5 units",
      weight: "1200 kg",
      mode: "Truck",
      footprint: 2.1,
    },
    {
      id: "SHP-10541",
      date: "2023-10-24",
      origin: "Bangalore, IN",
      destination: "Chennai, IN",
      quantity: "2 units",
      weight: "500 kg",
      mode: "Air",
      footprint: 3.5,
    },
    {
      id: "SHP-10540",
      date: "2023-10-22",
      origin: "Kolkata, IN",
      destination: "Hyderabad, IN",
      quantity: "1 unit",
      weight: "8000 kg",
      mode: "Truck",
      footprint: 0.8,
    },
    {
      id: "SHP-10539",
      date: "2023-10-21",
      origin: "Pune, IN",
      destination: "Ahmedabad, IN",
      quantity: "10 units",
      weight: "2500 kg",
      mode: "Truck",
      footprint: 4.2,
    },
    {
      id: "SHP-10538",
      date: "2023-10-20",
      origin: "Jaipur, IN",
      destination: "Surat, IN",
      quantity: "1 unit",
      weight: "150 kg",
      mode: "Air",
      footprint: 1.9,
    },
  ];

  const modeColors = {
    Truck: "bg-emerald-100 text-emerald-600",
    Air: "bg-purple-100 text-purple-600",
    Ship: "bg-blue-100 text-blue-600",
  };

  const footprintColor = (value) => {
    if (value < 2) return "text-emerald-600";
    if (value < 3.5) return "text-orange-500";
    return "text-red-600";
  };

  return (
    <div className="p-6">
      {/* HEADER */}
      <h1 className="text-3xl font-bold">Shipment History</h1>

      {/* SUB-HEADER */}
      <h2 className="mt-6 text-2xl font-semibold text-center">
        Detailed Report of Shipment History
      </h2>

      {/* MAIN CARD */}
      <div className="bg-white border shadow-sm p-6 rounded-xl mt-6 max-w-6xl mx-auto">

        {/* --- Search Row --- */}
        <div className="flex items-center gap-4">

          {/* Search box */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="🔍  Search by ID, Origin, Destination..."
              className="w-full px-4 py-3 border rounded-lg bg-gray-50"
            />
          </div>

          {/* Filters */}
          <button className="px-4 py-3 border rounded-lg bg-gray-50 flex items-center gap-2">
            Date Range ▼
          </button>

          <button className="px-4 py-3 border rounded-lg bg-gray-50 flex items-center gap-2">
            Mode: All ▼
          </button>

          <button className="px-4 py-3 border rounded-lg bg-gray-50 flex items-center gap-2">
            More Filters ▼
          </button>
        </div>

        {/* --- TABLE --- */}
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b text-gray-500 text-sm">
                <th className="pb-3">ID</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Origin</th>
                <th className="pb-3">Destination</th>
                <th className="pb-3">Quantity</th>
                <th className="pb-3">Net Weight</th>
                <th className="pb-3">Mode</th>
                <th className="pb-3">Carbon Footprint</th>
              </tr>
            </thead>

            <tbody className="text-sm">
              {shipments.map((row, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="py-3 font-semibold text-emerald-600">{row.id}</td>
                  <td>{row.date}</td>
                  <td>{row.origin}</td>
                  <td>{row.destination}</td>
                  <td>{row.quantity}</td>
                  <td>{row.weight}</td>

                  {/* Mode pill */}
                  <td>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${modeColors[row.mode]}`}>
                      {row.mode}
                    </span>
                  </td>

                  {/* Footprint */}
                  <td className={`font-semibold ${footprintColor(row.footprint)}`}>
                    {row.footprint} tCO₂e
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* --- FOOTER TEXT --- */}
        <p className="text-sm text-gray-500 mt-4">
          Showing 1 to 5 of 2,345 results
        </p>

        {/* --- Pagination --- */}
        <div className="flex items-center justify-center gap-2 mt-4">
          <button className="px-3 py-1 border rounded-lg bg-gray-50">{"<"}</button>
          <button className="px-3 py-1 border rounded-lg bg-emerald-500 text-white">1</button>
          <button className="px-3 py-1 border rounded-lg bg-gray-50">2</button>
          <button className="px-3 py-1 border rounded-lg bg-gray-50">3</button>
          <span className="px-3 py-1 border rounded-lg bg-gray-50">...</span>
          <button className="px-3 py-1 border rounded-lg bg-gray-50">{"469"}</button>
          <button className="px-3 py-1 border rounded-lg bg-gray-50">{">"}</button>
        </div>

      </div>
    </div>
  );
}

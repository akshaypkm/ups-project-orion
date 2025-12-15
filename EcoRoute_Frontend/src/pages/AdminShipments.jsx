const shipments = [
  {
    id: "SHP-001",
    company: "Eco Transports",
    origin: "New York, USA",
    destination: "London, UK",
    units: 1500,
    mode: "Shared",
    co2: "12.5 tCO₂e",
  },
];

export default function AdminShipments() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Shipment History</h1>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              {[
                "ID",
                "Company",
                "Origin",
                "Destination",
                "Units",
                "Mode",
                "Carbon Footprint",
              ].map((h) => (
                <th key={h} className="px-4 py-3 text-left">
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {shipments.map((s) => (
              <tr key={s.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3">{s.id}</td>
                <td className="px-4 py-3 font-medium">{s.company}</td>
                <td className="px-4 py-3">{s.origin}</td>
                <td className="px-4 py-3">{s.destination}</td>
                <td className="px-4 py-3">{s.units}</td>
                <td className="px-4 py-3">
                  <span className="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-600">
                    {s.mode}
                  </span>
                </td>
                <td className="px-4 py-3 font-semibold text-green-600">
                  {s.co2}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

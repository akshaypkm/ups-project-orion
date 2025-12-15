import { FiEdit } from "react-icons/fi";

export default function AdminMonitorParams() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Monitor Parameters</h1>

      <div className="bg-white rounded-xl border shadow-sm p-6 space-y-4">
        <Row label="Fuel Type" value="Diesel" />
        <Row label="Fuel emission factor" value="2.68 kg CO₂/L" />
        <Row label="Fuel efficiency" value="30 L / 100 km" />
        <Row label="Refrigerant potential factor" value="1430" />

        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg">
          <FiEdit />
          Edit Parameters
        </button>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between text-sm">
      <p className="text-gray-500">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}

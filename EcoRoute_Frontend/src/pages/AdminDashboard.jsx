import {
  FiTruck,
  FiActivity,
  FiUsers,
  FiBarChart2,
} from "react-icons/fi";

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500">
            Overview of platform metrics and carbon footprint.
          </p>
        </div>

        <button className="px-4 py-2 border rounded-lg text-sm bg-white shadow-sm">
          Last 30 Days
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          icon={<FiBarChart2 />}
          title="Total CO₂e tracked"
          value="1,250 tons"
          change="+5.2% vs last month"
        />
        <StatCard
          icon={<FiTruck />}
          title="Total Shipments"
          value="8,450"
          change="+10.1% vs last month"
        />
        <StatCard
          icon={<FiActivity />}
          title="Total API calls"
          value="1.2M"
          change="+2.5% vs last month"
        />
        <StatCard
          icon={<FiUsers />}
          title="Active Clients"
          value="78"
          change="+1.3% vs last month"
        />
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl border shadow-sm p-6">
        <h2 className="font-semibold mb-1">CO₂e Emissions by Month</h2>
        <p className="text-sm text-gray-500 mb-4">
          Last 6 Months
        </p>

        <div className="h-72 flex items-end gap-6">
          {["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map((m, i) => (
            <div key={m} className="flex-1 text-center">
              <div
                className={`mx-auto rounded-lg ${
                  i === 5 ? "bg-emerald-300" : "bg-blue-100"
                }`}
                style={{ height: `${40 + i * 25}px` }}
              />
              <p className="text-xs mt-2 text-gray-500">{m}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, change }) {
  return (
    <div className="bg-white rounded-xl border shadow-sm p-5">
      <div className="flex items-center gap-3 mb-2 text-blue-600">
        <span className="text-xl">{icon}</span>
        <p className="text-sm text-gray-500">{title}</p>
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-emerald-600 mt-1">{change}</p>
    </div>
  );
}

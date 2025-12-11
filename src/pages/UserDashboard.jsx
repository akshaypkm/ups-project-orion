import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function UserDashboard() {
  const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const data = {
    labels,
    datasets: [
      {
        label: "CO2e Emissions",
        data: [60, 90, 80, 110, 130, 100, 105, 140, 120, 90, 150, 50],
        backgroundColor: "rgba(16, 185, 129, 0.7)",
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      y: { ticks: { color: "#6b7280" } },
      x: { ticks: { color: "#6b7280" } },
    },
  };

  return (
    <div className="space-y-6">
      {/* ---- TOP CARDS ---- */}
      <div className="grid grid-cols-3 gap-6">
        {/* Card 1 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h2 className="text-lg font-semibold">Total CO2e emissions</h2>
          <p className="text-4xl font-bold mt-3">850 t</p>

          <div className="mt-4 flex gap-3">
            <button className="px-4 py-1 rounded-lg bg-gray-100 text-gray-600">CO2e</button>
            <button className="px-4 py-1 rounded-lg bg-gray-100 text-gray-600">kWh</button>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h2 className="text-lg font-semibold">Total Shipments</h2>
          <p className="text-4xl font-bold mt-3">56</p>

          <div className="mt-4 flex gap-3">
            <button className="px-4 py-1 rounded-lg bg-gray-100 text-gray-600">Today</button>
            <button className="px-4 py-1 rounded-lg bg-emerald-100 text-emerald-600">Month</button>
            <button className="px-4 py-1 rounded-lg bg-gray-100 text-gray-600">Year</button>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <span className="material-icons text-emerald-500">credit_score</span>
            Emissions Credit System
          </h2>

          <div className="mt-4">
            <p className="text-gray-500 text-sm">Market Price of EC</p>
            <p className="text-xl font-semibold">Rs 1400</p>
          </div>

          <div className="mt-4">
            <p className="text-gray-500 text-sm">Total Credits left</p>
            <p className="text-xl font-semibold">500</p>
          </div>

          <div className="mt-4">
            <p className="text-gray-500 text-sm">Forecasted Emissions (2mo)</p>
            <p className="text-xl font-semibold">400 t</p>
          </div>

          <div className="mt-5 flex gap-3">
            <button className="bg-emerald-500 text-white px-4 py-2 rounded-lg">Buy</button>
            <button className="border border-emerald-500 text-emerald-500 px-4 py-2 rounded-lg">
              Sell
            </button>
          </div>
        </div>
      </div>

      {/* ---- MAIN CHART + SIDE CARDS ---- */}
      <div className="grid grid-cols-3 gap-6">
        {/* BAR CHART */}
        <div className="bg-white p-6 rounded-xl shadow-sm border col-span-2">
          <h2 className="text-lg font-semibold mb-4">CO2e Month Wise Emissions</h2>
          <div className="h-80">
            <Bar data={data} options={options} />
          </div>
        </div>

        {/* RIGHT SIDE CARDS */}
        <div className="space-y-6">
          {/* Budget Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <span className="material-icons text-emerald-500">analytics</span>
              Carbon Budget Forecast
            </h2>

            <p className="text-gray-500 text-sm mt-2">
              By the year end you are expected to emit 850 tonnes of CO2e
            </p>

            <p className="text-3xl font-bold mt-3">850 t</p>

            <div className="w-full h-2 bg-gray-200 rounded-full mt-3">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: "70%" }}></div>
            </div>

            <p className="text-xs text-gray-500 mt-1">/ 1,200 t</p>
          </div>

          {/* Emissions Saved */}
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <span className="material-icons text-emerald-500">eco</span>
              Carbon Emissions Saved
            </h2>

            <p className="text-gray-500 text-sm mt-2">
              You have saved 120t of carbon emissions by choosing sustainable routes.
            </p>

            <p className="text-3xl font-bold mt-3 text-emerald-600">120 t</p>

            <span className="text-xs bg-emerald-100 text-emerald-600 px-2 py-1 rounded-lg">
              Saved this year
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
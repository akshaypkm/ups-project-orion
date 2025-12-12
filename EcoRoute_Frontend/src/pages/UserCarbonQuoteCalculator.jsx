import { useState } from "react";

export default function UserCarbonQuoteCalculator() {
  const [nature, setNature] = useState("Upstream");
  const [mode, setMode] = useState("Ground");
  const [units, setUnits] = useState("");
  const [mass, setMass] = useState("");

  const [shared, setShared] = useState("Dedicated");
  const [equalMass, setEqualMass] = useState("Yes");
  const [refrigerated, setRefrigerated] = useState("No");

  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <h1 className="text-3xl font-bold">Carbon Quote Calculator</h1>
      <p className="text-gray-500 mt-1">
        Enter shipment details to estimate your carbon footprint.
      </p>

      {/* MAIN CARD */}
      <div className="bg-white rounded-xl shadow-sm border p-8 space-y-10 w-full">

        {/* Section 1 */}
        <div>
          <h2 className="text-lg font-semibold">Shipment Details</h2>
          <p className="text-gray-500 text-sm">Provide information about the overall shipment.</p>

          <div className="grid grid-cols-3 gap-6 mt-6">

            {/* Nature of transport */}
            <div>
              <label className="text-sm text-gray-600">Nature of transport:</label>
              <select
                value={nature}
                onChange={(e) => setNature(e.target.value)}
                className="w-full mt-1 px-4 py-2 border rounded-lg"
              >
                <option>Upstream</option>
                <option>Downstream</option>
              </select>
            </div>

            {/* Mode of transport */}
            <div>
              <label className="text-sm text-gray-600">Mode of transport:</label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="w-full mt-1 px-4 py-2 border rounded-lg"
              >
                <option>Ground</option>
              </select>
            </div>

            {/* Total number of units */}
            <div>
              <label className="text-sm text-gray-600">Total number of units:</label>
              <input
                type="number"
                value={units}
                onChange={(e) => setUnits(e.target.value)}
                className="w-full mt-1 px-4 py-2 border rounded-lg"
                placeholder="e.g., 50"
              />
            </div>

            {/* Total mass */}
            <div>
              <label className="text-sm text-gray-600">Total mass (kg):</label>
              <input
                type="number"
                value={mass}
                onChange={(e) => setMass(e.target.value)}
                className="w-full mt-1 px-4 py-2 border rounded-lg"
                placeholder="e.g., 1200"
              />
            </div>

            {/* Shared/Dedicated */}
            <div>
              <label className="text-sm text-gray-600">Shared / Dedicated:</label>

              <div className="flex gap-3 mt-2">
                <button
                  onClick={() => setShared("Shared")}
                  className={`px-4 py-2 rounded-lg border ${
                    shared === "Shared"
                      ? "bg-emerald-500 text-white border-emerald-500"
                      : "bg-white text-gray-600"
                  }`}
                >
                  Shared
                </button>

                <button
                  onClick={() => setShared("Dedicated")}
                  className={`px-4 py-2 rounded-lg border ${
                    shared === "Dedicated"
                      ? "bg-emerald-500 text-white border-emerald-500"
                      : "bg-white text-gray-600"
                  }`}
                >
                  Dedicated
                </button>
              </div>
            </div>
          </div>
        </div>

        <hr />

        {/* Section 2 */}
        <div>
          <h2 className="text-lg font-semibold">Product and route information</h2>
          <p className="text-gray-500 text-sm">
            Specify details about the product and its journey.
          </p>

          <div className="grid grid-cols-3 gap-6 mt-6">

            {/* Equal mass */}
            <div>
              <label className="text-sm text-gray-600">Equal mass:</label>

              <div className="flex gap-3 mt-2">
                <button
                  onClick={() => setEqualMass("Yes")}
                  className={`px-4 py-2 rounded-lg border ${
                    equalMass === "Yes"
                      ? "bg-emerald-500 text-white border-emerald-500"
                      : "bg-white text-gray-600"
                  }`}
                >
                  Yes
                </button>

                <button
                  onClick={() => setEqualMass("No")}
                  className={`px-4 py-2 rounded-lg border ${
                    equalMass === "No"
                      ? "bg-emerald-500 text-white border-emerald-500"
                      : "bg-white text-gray-600"
                  }`}
                >
                  No
                </button>
              </div>
            </div>

            {/* Refrigerated */}
            <div>
              <label className="text-sm text-gray-600">If product refrigerated:</label>

              <div className="flex gap-3 mt-2">
                <button
                  onClick={() => setRefrigerated("Yes")}
                  className={`px-4 py-2 rounded-lg border ${
                    refrigerated === "Yes"
                      ? "bg-emerald-500 text-white border-emerald-500"
                      : "bg-white text-gray-600"
                  }`}
                >
                  Yes
                </button>

                <button
                  onClick={() => setRefrigerated("No")}
                  className={`px-4 py-2 rounded-lg border ${
                    refrigerated === "No"
                      ? "bg-emerald-500 text-white border-emerald-500"
                      : "bg-white text-gray-600"
                  }`}
                >
                  No
                </button>
              </div>
            </div>
          </div>

          {/* Route Inputs */}
          <div className="grid grid-cols-3 gap-6 mt-6">
            {/* Origin */}
            <div>
              <label className="text-sm text-gray-600">Origin:</label>
              <input
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full mt-1 px-4 py-2 border rounded-lg"
                placeholder="e.g., New York, NY"
              />
            </div>

            {/* Destination */}
            <div>
              <label className="text-sm text-gray-600">Destination:</label>
              <input
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full mt-1 px-4 py-2 border rounded-lg"
                placeholder="e.g., Los Angeles, CA"
              />
            </div>

            {/* Date */}
            <div>
              <label className="text-sm text-gray-600">Date of shipment:</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full mt-1 px-4 py-2 border rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button onClick={() => navigate("/user/results")} className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2">
            Calculate Footprint →
          </button>
        </div>
      </div>
    </div>
  );
}
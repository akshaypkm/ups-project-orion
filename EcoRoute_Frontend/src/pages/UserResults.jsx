export default function UserResults() {
  return (
    <div className="space-y-10">

      {/* PAGE TITLE */}
      <h1 className="text-2xl font-semibold">Calculation Results</h1>

      <h2 className="text-3xl font-bold">Carbon Footprint Results</h2>
      <p className="text-gray-500">
        A summary of the calculated emissions based on your shipment details.
      </p>

      {/* QUOTE CARDS */}
      <div className="grid grid-cols-3 gap-6">

        {/* CARD 1 – Most Sustainable */}
        <div className="border rounded-xl p-6 shadow-sm hover:shadow-md transition">
          <p className="text-sm font-semibold text-emerald-600 flex items-center gap-2">
            <span className="material-icons text-emerald-600">eco</span>
            MOST SUSTAINABLE
          </p>

          <h3 className="text-3xl font-bold mt-3">125.2 kg CO₂e</h3>
          <p className="text-gray-500 text-sm mt-1">6,120 km</p>
          <p className="text-gray-500 text-sm">CHE → MUM</p>

          <button className="w-full mt-6 py-3 text-white bg-emerald-500 rounded-lg font-semibold hover:bg-emerald-600 transition">
            Select Quote
          </button>
        </div>

        {/* CARD 2 */}
        <div className="border rounded-xl p-6 shadow-sm hover:shadow-md transition">
          <h3 className="text-3xl font-bold">150.7 kg CO₂e</h3>
          <p className="text-gray-500 text-sm mt-1">5,570 km</p>
          <p className="text-gray-500 text-sm">CHE → MUM</p>

          <button className="w-full mt-6 py-3 bg-emerald-100 text-emerald-600 rounded-lg font-semibold">
            Select Quote
          </button>
        </div>

        {/* CARD 3 – Fast */}
        <div className="border rounded-xl p-6 shadow-sm hover:shadow-md transition">
          <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <span className="material-icons text-gray-600">bolt</span>
            QUICK DELIVERY
          </p>

          <h3 className="text-3xl font-bold">182.4 kg CO₂e</h3>
          <p className="text-gray-500 text-sm mt-1">5,150 km</p>
          <p className="text-gray-500 text-sm">CHE → MUM</p>

          <button className="w-full mt-6 py-3 bg-emerald-100 text-emerald-600 rounded-lg font-semibold">
            Select Quote
          </button>
        </div>
      </div>

      {/* SHIPMENT SUMMARY */}
      <div>
        <h2 className="text-xl font-semibold mb-3">Shipment Details Summary</h2>

        <div className="border rounded-xl p-6 shadow-sm bg-white">
          <div className="grid grid-cols-2 gap-4 text-sm">

            <div>
              <p className="text-gray-600">Origin</p>
              <p className="font-semibold">Chennai, India</p>
            </div>

            <div>
              <p className="text-gray-600">Destination</p>
              <p className="font-semibold">Mumbai, India</p>
            </div>

            <div>
              <p className="text-gray-600">Distance</p>
              <p className="font-semibold">5,570 km</p>
            </div>

            <div>
              <p className="text-gray-600">Weight</p>
              <p className="font-semibold">1,200 kg</p>
            </div>

            <div>
              <p className="text-gray-600">Shipment Type</p>
              <p className="font-semibold">Shared</p>
            </div>

            <div>
              <p className="text-gray-600">Freight Type</p>
              <p className="font-semibold">General Cargo</p>
            </div>

            <div>
              <p className="text-gray-600">Transport Mode</p>
              <p className="font-semibold">Air Freight</p>
            </div>

            <div>
              <p className="text-gray-600">Vehicle Type</p>
              <p className="font-semibold">Boeing 747</p>
            </div>
          </div>
        </div>
      </div>

      {/* BUTTONS */}
      <div className="flex gap-4 mt-4">
        <button className="px-6 py-3 border rounded-lg font-semibold hover:bg-gray-100 transition">
          Start a New Quote
        </button>

        <button className="px-6 py-3 bg-emerald-500 text-white rounded-lg font-semibold hover:bg-emerald-600 transition">
          Place Shipment Order
        </button>
      </div>
    </div>
  );
}
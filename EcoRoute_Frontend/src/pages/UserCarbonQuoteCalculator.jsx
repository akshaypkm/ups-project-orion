import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Components/UserSideBar"; // Importing your new common Sidebar
import "../styles/UserDashboard.css";
import api from "../api/api";

export default function UserCarbonQuoteCalculator() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  // Toggle state for the methodology section
  const [showMethodology, setShowMethodology] = useState(false);

  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  
  const [nature, setNature] = useState("Upstream");
  const [mode, setMode] = useState("Ground");
  const [units, setUnits] = useState("");
  const [mass, setMass] = useState("");

  const [orderMode, setOrderMode] = useState("Dedicated");
  const [equalMass, setEqualMass] = useState("Yes");
  const [refrigerated, setRefrigerated] = useState("No");

  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");

  // Placeholder UI state
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleCalculate = async () => {
    // Basic validation
    if (!mass || !origin || !destination) {
      alert("Please fill in all required fields (Mass, Origin, Destination).");
      return;
    }

    setLoading(true);
    
    const payload = {
      orderNature: nature,
      transportMode: mode, // Maps to backend enum/string
      orderTotalItems: parseInt(units) || 1,
      orderWeightKg: parseFloat(mass),
      
      // Dimensions required by controller validation
      orderLength: parseFloat(length) || 0, 
      orderWidth: parseFloat(width) || 0,
      orderHeight: parseFloat(height) || 0,

      orderMode : orderMode,
      isRefrigerated: refrigerated === "Yes",
      orderOrigin: origin,
      orderDestination: destination,
      orderDate : date
      
    };

    try {
      const res = await api.post("/api/calculate-carbon-quote/calc", payload);
      
      if (res.status === 200 && res.data) {
        // Redirect to results page and pass the data
        navigate("/quote-results", { 
          state: { 
            quotes: res.data,   // The list of OrderDto returned by backend
            request: payload    // The input data to display summary
          } 
        });
      }
    } catch (err) {
      console.error("Calculation error:", err);
      const errorMsg = err.response?.data?.message || err.response?.data || "Calculation failed. Please check your inputs.";
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="dashboard-container">
      {/* 1. Sidebar */}
      <Sidebar />

      {/* 2. Main Content Area */}
      {/* Added ml-64 (or typical sidebar width margin) if Sidebar is fixed, assuming Sidebar handles its own width or is 64/250px */}
      <main className="flex-1 p-8 ml-0 md:ml-[250px]"> 
        
        
        {/* Top Header */}
        <header className="top-bar">
          <h2 className="page-title">Carbon Quote Calculator</h2>
          
          <div className="header-actions">
            <div style={{ position: 'relative' }}>
              <button className="icon-btn" onClick={() => setIsNotifOpen(!isNotifOpen)}>
                <span className="material-symbols-outlined">notifications</span>
              </button>
            </div>
            
            <div style={{ position: 'relative' }}>
              <button className="icon-btn" onClick={() => setIsProfileOpen(!isProfileOpen)}>
                <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>account_circle</span>
              </button>
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="content-scroll-area">
          <div className="space-y-6 max-w-5xl mx-auto">
            {/* METHODOLOGY & STANDARDS SECTION */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden w-full">
              <button
                onClick={() => setShowMethodology(!showMethodology)}
                className="w-full px-8 py-5 flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-emerald-600 bg-emerald-100 p-2 rounded-lg">verified</span>
                  <div>
                    <h3 className="font-bold text-gray-800">Methodology & Environmental Standards</h3>
                    <p className="text-xs text-gray-500 mt-0.5">How EcoRoute validates and calculates carbon footprints</p>
                  </div>
                </div>
                <span className={`material-symbols-outlined text-gray-400 transition-transform duration-300 ${showMethodology ? "rotate-180" : ""}`}>
                  expand_more
                </span>
              </button>

              {showMethodology && (
                <div className="p-8 border-t border-gray-200 space-y-8 animate-in slide-in-from-top-2 text-sm">
                  
                  {/* Section 1 */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="md:col-span-1">
                      <h4 className="font-bold text-gray-800 mb-1">Data Acquisition</h4>
                      <p className="text-gray-500 text-xs">The Foundation</p>
                    </div>
                    <div className="md:col-span-3 space-y-3 text-gray-600">
                      <p>
                        <strong className="text-gray-800">Route Geometry:</strong> We utilize the <span className="text-emerald-600 font-medium">Google Maps Directions API</span> to obtain precise, turn-by-turn polyline data for every shipment.
                      </p>
                      <p>
                        <strong className="text-gray-800">Elevation Mapping:</strong> Routes are cross-referenced with the <span className="text-emerald-600 font-medium">Google Elevation API</span> to determine grade (slope) profiles, ensuring that uphill climbs which consume significantly more fuel are accounted.
                      </p>
                      <p>
                        <strong className="text-gray-800">Geospatial Processing:</strong> Raw GPS points are densified to 50-meter segments using <strong>Haversine</strong> and <strong>Intermediate Greater Circle</strong> algorithms to ensure granular accuracy.
                      </p>
                    </div>
                  </div>

                  <hr className="border-gray-100" />

                  {/* Section 2 */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="md:col-span-1">
                      <h4 className="font-bold text-gray-800 mb-1">Physics Engine</h4>
                      <p className="text-gray-500 text-xs">Vehicle Dynamics</p>
                    </div>
                    <div className="md:col-span-3 space-y-4 text-gray-600">
                      <p>
                        Our engine doesn't just use "average Km/L." It models the primary forces resisting motion:
                      </p>
                      <ul className="list-disc pl-5 space-y-2">
                        <li>
                            <strong>Grade Resistance:</strong>{" "}
                            <code className="bg-gray-100 px-1 rounded">
                              E<sub>grade</sub> = m · g · Δh
                            </code>{" "}
                            (
                            <a
                              href="http://revolutionarywheels.blogspot.com/p/vehicle-dynamics.html"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-600 underline hover:text-emerald-700"
                              title="View Grade Resistance Source"
                            >
                              Energy required to lift the truck uphill
                            </a>
                            ).                        </li>
                        <li>
                          <strong>Rolling Resistance:</strong>{" "}
                            <code className="bg-gray-100 px-1 rounded">
                              E<sub>roll</sub> = m · g · d ·{" "}
                              <a 
                                href="https://drive.google.com/file/d/14OjkbjGxgGBrrgRy0-4Pq259QX-28a94/view?usp=drive_link"
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-emerald-600 underline hover:text-emerald-700"
                                title="View Crr Source"
                              >
                                C<sub>rr</sub>
                              </a>
                            </code>{" "}
                            (
                            <a
                              href="https://www.engineeringtoolbox.com/rolling-friction-resistance-d_1303.html#:~:text=The%20rolling%20resistance%20can%20be,of%20wheel%20(mm%2C%20in)"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-600 underline hover:text-emerald-700"
                            >
                              Friction between tires and road
                            </a>
                            ).
                        </li>
                      </ul>
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 text-blue-800 text-xs mt-2">
                        <strong>Dynamic Mass Calculation:</strong> We calculate the Effective Mass by combining the Kerb Weight (empty truck) with your specific Payload Weight.
                      </div>
                    </div>
                  </div>

                  <hr className="border-gray-100" />

                  {/* Section 3 */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="md:col-span-1">
                      <h4 className="font-bold text-gray-800 mb-1">Carbon Standards</h4>
                      <p className="text-gray-500 text-xs">Conversion Factors</p>
                    </div>
                    <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                        <p className="text-gray-500 text-xs uppercase font-bold mb-1">Engine Efficiency</p>
                        <p className="text-emerald-600 underline hover:text-emerald-700">
                          <a 
                            href="https://drive.google.com/file/d/1Oez5oBtuUSRFIKc0eKPLpzs0xN3Bb7q6/view?usp=drive_link" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:text-emerald-600 underline transition-colors"
                            title="View Source Document"
                          >
                            35.63% (Brake Thermal Efficiency)
                          </a>
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Click the above link to refer about BTE</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                        <p className="text-gray-500 text-xs uppercase font-bold mb-1">Emission Factor (Diesel)</p>
                        <p className="text-emerald-600 underline hover:text-emerald-700">
                          <a 
                            href="https://drive.google.com/file/d/162KdlgOIc3c3ojGbRy4LF2d9WVuJRUTJ/view?usp=drive_link" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:text-emerald-600 underline transition-colors"
                            title="View Emission Factor Source"
                          >
                            2.70 kg CO₂e / Liter
                          </a>
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Well-to-Wheel (Lifecycle) standard including upstream refining.</p>
                      </div>
                    </div>
                  </div>

                  <hr className="border-gray-100" />

                  {/* Section 4 */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="md:col-span-1">
                      <h4 className="font-bold text-gray-800 mb-1">Selection Algorithm</h4>
                      <p className="text-gray-500 text-xs">Optimization Logic</p>
                    </div>
                    <div className="md:col-span-3 text-gray-600 space-y-2">
                      <p>
                        Our algorithm automatically selects the <strong>smallest efficient vehicle</strong> that fits your cargo's weight and volume dimensions.
                      </p>
                      <p>
                        We apply a <strong>90% Packing Efficiency Factor</strong> to ensure goods physically fit inside the cargo bay, preventing capacity errors.
                      </p>
                    </div>
                  </div>


                </div>
              )}
            </div>
            
            <div>
              <h1 className="text-3xl font-bold text-gray-800">New Quote</h1>
              <p className="text-gray-500 mt-1">Enter shipment details to estimate your carbon footprint.</p>
            </div>

            {/* MAIN FORM CARD */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-10 w-full">

              {/* Section 1: Shipment Details */}
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Shipment Details</h2>
                <p className="text-gray-500 text-sm">Provide information about the overall shipment.</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  {/* Nature */}
                  <div>
                    <label className="text-sm font-medium text-gray-700">Nature of transport:</label>
                    <select
                      value={nature}
                      onChange={(e) => setNature(e.target.value)}
                      className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                    >
                      <option>Upstream</option>
                      <option>Downstream</option>
                    </select>
                  </div>

                  {/* Mode */}
                  <div>
                    <label className="text-sm font-medium text-gray-700">Mode of transport:</label>
                    <select
                      value={mode}
                      onChange={(e) => setMode(e.target.value)}
                      className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                    >
                      <option>Ground</option>
                      
                    </select>
                  </div>

                  {/* Units */}
                  <div>
                    <label className="text-sm font-medium text-gray-700">Total units:</label>
                    <input
                      type="number"
                      value={units}
                      onChange={(e) => setUnits(e.target.value)}
                      className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                      placeholder="e.g., 50"
                    />
                  </div>

                  {/* Mass */}
                  <div>
                    <label className="text-sm font-medium text-gray-700">Total mass (kg):</label>
                    <input
                      type="number"
                      value={mass}
                      onChange={(e) => setMass(e.target.value)}
                      className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                      placeholder="e.g., 1200"
                    />
                  </div>

                  {/* Shared/Dedicated */}
                  <div>
                    <label className="text-sm font-medium text-gray-700">Shared / Dedicated:</label>
                    <div className="flex gap-2 mt-1">
                      <button
                        onClick={() => setOrderMode("Shared")}
                        className={`flex-1 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                          orderMode === "Shared"
                            ? "bg-emerald-500 text-white border-emerald-500"
                            : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        Shared
                      </button>
                      <button
                        onClick={() => setOrderMode("Dedicated")}
                        className={`flex-1 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                          orderMode === "Dedicated"
                            ? "bg-emerald-500 text-white border-emerald-500"
                            : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        Dedicated
                      </button>
                    </div>
                  </div>
                </div>

                {/* NEW: Dimensions Section (Required by Backend) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                   <div>
                    <label className="text-sm font-medium text-gray-700">Length (m):</label>
                    <input type="number" value={length} onChange={e => setLength(e.target.value)} className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Max 18.75" />
                   </div>
                   <div>
                    <label className="text-sm font-medium text-gray-700">Width (m):</label>
                    <input type="number" value={width} onChange={e => setWidth(e.target.value)} className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Max 5.0" />
                   </div>
                   <div>
                    <label className="text-sm font-medium text-gray-700">Height (m):</label>
                    <input type="number" value={height} onChange={e => setHeight(e.target.value)} className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Max 4.0" />
                   </div>
                </div>
              </div>

              <hr className="border-gray-200" />

              {/* Section 2: Product & Route */}
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Product and route information</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  {/* Equal mass */}
                  <div>
                    <label className="text-sm font-medium text-gray-700">Equal mass:</label>
                    <div className="flex gap-2 mt-1">
                      <button
                        onClick={() => setEqualMass("Yes")}
                        className={`flex-1 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${equalMass === "Yes" ? "bg-emerald-500 text-white border-emerald-500" : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"}`}
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setEqualMass("No")}
                        className={`flex-1 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${equalMass === "No" ? "bg-emerald-500 text-white border-emerald-500" : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"}`}
                      >
                        No
                      </button>
                    </div>
                  </div>

                  {/* Refrigerated */}
                  <div>
                    <label className="text-sm font-medium text-gray-700">If product refrigerated:</label>
                    <div className="flex gap-2 mt-1">
                      <button
                        onClick={() => setRefrigerated("Yes")}
                        className={`flex-1 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${refrigerated === "Yes" ? "bg-emerald-500 text-white border-emerald-500" : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"}`}
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setRefrigerated("No")}
                        className={`flex-1 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${refrigerated === "No" ? "bg-emerald-500 text-white border-emerald-500" : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"}`}
                      >
                        No
                      </button>
                    </div>
                  </div>
                </div>

                {/* Route Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Origin:</label>
                    <div className="relative mt-1">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">trip_origin</span>
                      <input value={origin} onChange={(e) => setOrigin(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="e.g., Chennai, TN" />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Destination:</label>
                    <div className="relative mt-1">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">location_on</span>
                      <input value={destination} onChange={(e) => setDestination(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="e.g., Trichy, TN" />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Date of shipment:</label>
                    <div className="relative mt-1">
                      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-4">
                <button 
                  onClick={handleCalculate}
                  disabled={loading}
                  className={`bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors shadow-sm ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
                >
                  {loading ? "Calculating..." : "Calculate Footprint"}
                  {!loading && <span className="material-symbols-outlined text-sm">arrow_forward</span>}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
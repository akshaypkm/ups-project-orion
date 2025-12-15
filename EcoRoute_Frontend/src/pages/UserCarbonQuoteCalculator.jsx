import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Components/UserSideBar"; // Importing your new common Sidebar
import "../styles/UserDashboard.css";
import api from "../api/api";

export default function UserCarbonQuoteCalculator() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

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
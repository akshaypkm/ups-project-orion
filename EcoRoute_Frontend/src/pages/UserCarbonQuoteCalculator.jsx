import { useState, useEffect } from "react";
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
  const [notifications, setNotifications] = useState([]);
  const [confirmAction, setConfirmAction] = useState(null);
  const [unreadCountState, setUnreadCountState] = useState(0);

  

  const handleNotifications = async () => {
  try {
    const res = await api.get("/api/client-dashboard/notifications");
    setNotifications(res.data);
  } 
  catch (err) {
    console.error("notifications loading failed");
  }
};


   const handleLogout = () => {
    localStorage.removeItem("ecoroute_token");
    navigate("/");
  };

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
useEffect(() => {
  handleNotifications(); // fetch on page load
}, []);
useEffect(() => {
  if (isNotifOpen && unreadCountState > 0) {
    api.post("/api/client-dashboard/notifications/mark-seen").then(() => {
      setUnreadCountState(0);
      handleNotifications(); // refresh list
    });
  }
}, [isNotifOpen]);

useEffect(() => {
  const fetchUnreadCount = async () => {
    try {
      const res = await api.get(
        "/api/client-dashboard/notifications/unread-count"
      );
      setUnreadCountState(res.data);
    } catch (e) {
      console.error("Failed to fetch unread count");
    }
  };

  fetchUnreadCount(); // initial
  const interval = setInterval(fetchUnreadCount, 5000); // every 5s

  return () => clearInterval(interval);
}, []);





  return (
    <div className="flex min-h-screen bg-gradient-to-br from-lime-100 via-green-100 to-emerald-100 overflow-hidden">
      {/* 1. Sidebar */}
      <Sidebar />

      {/* 2. Main Content Area */}
      {/* Added ml-64 (or typical sidebar width margin) if Sidebar is fixed, assuming Sidebar handles its own width or is 64/250px */}
      <main className="flex-1 ml-0 md:ml-[250px] px-6 py-6 overflow-y-auto"> 

        {/* Scrollable Content Area */}
        <div>
          <div className="space-y-6 max-w-7xl mx-auto">
            {/* Top Header */}
        <header className="flex justify-between items-center mb-8">
          <h2 className="text-4xl font-extrabold bg-gradient-to-r from-lime-600 via-green-600 to-emerald-700 bg-clip-text text-transparent">Carbon Quote Calculator</h2>
          
          <div className="flex items-center gap-4">
            
            {/* Notification Button */}
            <div className="relative">
              <button 
                className="p-2 rounded-full hover:bg-gray-200 transition relative" 
                onClick={() => {
                    if(!isNotifOpen) handleNotifications(); // Fetch data when opening
                    setIsNotifOpen(!isNotifOpen);
                }}
              >
                <span className="material-symbols-outlined text-gray-600">notifications</span>
                {/* 🔴 RED DOT / COUNT */}
                {unreadCountState > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-5 min-w-[20px] flex items-center justify-center px-1">
                    {unreadCountState}
                  </span>
                )}
                {/* Optional red dot for new notifs */}
                {/* <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span> */}
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 p-2 z-50 max-h-64 overflow-y-auto animate-in fade-in slide-in-from-top-2">
                  <h4 className="text-xs font-bold text-gray-400 uppercase px-2 py-1 mb-1">Notifications</h4>
                  {notifications.length > 0 ? (
                    <div className="space-y-1">
                      {notifications.map((n, i) => (
                        <div key={i} className="p-3 text-sm text-green-700 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                          {n.message}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">No new notifications</p>
                  )}
                </div>
              )}
            </div>
            
            {/* Profile Button */}
            <div className="relative">
              <button className="p-2 rounded-full hover:bg-gray-200 transition" onClick={() => setIsProfileOpen(!isProfileOpen)}>
                <span className="material-symbols-outlined text-gray-600 text-3xl">account_circle</span>
              </button>
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border py-2 z-50">
                  <div className="px-4 py-2 border-b">
                    <p className="text-sm font-bold text-green-800">User Profile</p>
                  </div>
                  <button 
                    onClick={() =>
                      setConfirmAction({
                        type: "logout"
                      })
                    }
                    className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-lg">logout</span> Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
            {/* METHODOLOGY & STANDARDS SECTION */}
            <div className="bg-white/70 backdrop-blur-2xl border border-white/30 rounded-3xl shadow-2xl overflow-hidden w-full">
              <button
                onClick={() => setShowMethodology(!showMethodology)}
                className="w-full px-8 py-5 flex justify-between items-center bg-white/70 hover:bg-white/70 transition-transform hover:scale-[1.02] text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined bg-gradient-to-r from-lime-500 to-emerald-600  bg-clip-text text-transparent">verified</span>
                  <div>
                    <h3 className="font-semibold text-green-700 flex items-center gap-2">Methodology & Environmental Standards</h3>
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
                      <div className="bg-emerald-100 p-3 rounded-xl border border-emerald-100 text-emerald-800 text-xs mt-2">
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
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <p className="text-gray-500 text-xs uppercase font-bold mb-1">Engine Efficiency</p>
                        <p className="text-emerald-600 underline hover:text-emerald-700">
                          <a 
                            href="https://drive.google.com/file/d/1Oez5oBtuUSRFIKc0eKPLpzs0xN3Bb7q6/view?usp=drive_link" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:text-emerald-600 underline transition-transform hover:scale-[1.03]"
                            title="View Source Document"
                          >
                            35.63% (Brake Thermal Efficiency)
                          </a>
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Click the above link to refer about BTE</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <p className="text-gray-500 text-xs uppercase font-bold mb-1">Emission Factor (Diesel)</p>
                        <p className="text-emerald-600 underline hover:text-emerald-700">
                          <a 
                            href="https://drive.google.com/file/d/162KdlgOIc3c3ojGbRy4LF2d9WVuJRUTJ/view?usp=drive_link" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:text-emerald-600 underline transition-transform hover:scale-[1.03]"
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
            <div className="bg-white/70 backdrop-blur-2xl border border-white/30 rounded-3xl shadow-2xl p-8 space-y-10 w-full">

              {/* Section 1: Shipment Details */}
              <div>
                <h2 className="text-lg font-semibold text-green-700 flex items-center gap-2"><span className="material-symbols-outlined bg-gradient-to-r from-lime-500 to-emerald-600  bg-clip-text text-transparent">analytics</span>
                Shipment Details</h2>
                
                <p className="text-gray-500 text-sm">Provide information about the overall shipment.</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  {/* Nature */}
                  <div>
                    <label className="text-sm font-medium text-gray-700">Nature of transport:</label>
                    <select
                      value={nature}
                      onChange={(e) => setNature(e.target.value)}
                      className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
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
                      className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
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
                      className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
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
                      className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                      placeholder="e.g., 1200"
                    />
                  </div>

                  {/* Shared/Dedicated */}
                  <div>
                    <label className="text-sm font-medium text-gray-700">Shared / Dedicated:</label>
                    <div className="flex gap-2 mt-1">
                      <button
                        onClick={() => setOrderMode("Shared")}
                        className={`flex-1 px-4 py-2 rounded-xl border text-sm font-medium transition-transform hover:scale-[1.03] ${
                          orderMode === "Shared"
                            ? "bg-gradient-to-r from-lime-500 to-emerald-600 text-white border-emerald-500"
                            : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        Shared
                      </button>
                      <button
                        onClick={() => setOrderMode("Dedicated")}
                        className={`flex-1 px-4 py-2 rounded-xl border text-sm font-medium transition-transform hover:scale-[1.03] ${
                          orderMode === "Dedicated"
                            ? "bg-gradient-to-r from-lime-500 to-emerald-600 text-white border-emerald-500"
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
                    <input type="number" value={length} onChange={e => setLength(e.target.value)} className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Max 18.75" />
                   </div>
                   <div>
                    <label className="text-sm font-medium text-gray-700">Width (m):</label>
                    <input type="number" value={width} onChange={e => setWidth(e.target.value)} className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Max 5.0" />
                   </div>
                   <div>
                    <label className="text-sm font-medium text-gray-700">Height (m):</label>
                    <input type="number" value={height} onChange={e => setHeight(e.target.value)} className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Max 4.0" />
                   </div>
                </div>
              </div>

              <hr className="border-gray-200" />

              {/* Section 2: Product & Route */}
              <div>
                <h2 className="text-lg font-semibold text-green-700 flex items-center gap-2">
                  <span className="material-symbols-outlined bg-gradient-to-r from-lime-500 to-emerald-600  bg-clip-text text-transparent">route</span>
                  Product and route information</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  {/* Equal mass */}
                  <div>
                    <label className="text-sm font-medium text-gray-700">Equal mass:</label>
                    <div className="flex gap-2 mt-1">
                      <button
                        onClick={() => setEqualMass("Yes")}
                        className={`flex-1 px-4 py-2 rounded-xl border text-sm font-medium transition-transform hover:scale-[1.03] ${equalMass === "Yes" ? "bg-gradient-to-r from-lime-500 to-emerald-600 text-white border-emerald-500" : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50 "}`}
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setEqualMass("No")}
                        className={`flex-1 px-4 py-2 rounded-xl border text-sm font-medium transition-transform hover:scale-[1.03] ${equalMass === "No" ? "bg-gradient-to-r from-lime-500 to-emerald-600 text-white border-emerald-500" : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50 "}`}
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
                        className={`flex-1 px-4 py-2 rounded-xl border text-sm font-medium transition-transform hover:scale-[1.03] ${refrigerated === "Yes" ? "bg-gradient-to-r from-lime-500 to-emerald-600 text-white border-emerald-500" : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50 "}`}
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setRefrigerated("No")}
                        className={`flex-1 px-4 py-2 rounded-xl border text-sm font-medium transition-transform hover:scale-[1.03] ${refrigerated === "No" ? "bg-gradient-to-r from-lime-500 to-emerald-600 text-white border-emerald-500" : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"}`}
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
                      <input value={origin} onChange={(e) => setOrigin(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="e.g., Chennai, TN" />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Destination:</label>
                    <div className="relative mt-1">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">location_on</span>
                      <input value={destination} onChange={(e) => setDestination(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="e.g., Trichy, TN" />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Date of shipment:</label>
                    <div className="relative mt-1">
                      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-4">
                <button 
                  onClick={handleCalculate}
                  disabled={loading}
                  className={`bg-gradient-to-r from-lime-500 via-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-transform hover:scale-[1.03] shadow-sm ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
                >
                  {loading ? "Calculating..." : "Calculate Footprint"}
                  {!loading && <span className="material-symbols-outlined text-sm">arrow_forward</span>}
                </button>
              </div>
            </div>
            
          </div>
          {/* 🔽 ADD CONFIRM MODAL HERE */}
          {confirmAction && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in-95">
              {/* HEADER */}
              <h3 className="text-lg font-bold bg-gradient-to-r from-lime-600 via-green-600 to-emerald-700 bg-clip-text text-transparent mb-3">
                {confirmAction.type === "logout"
                ? "Confirm Logout"
                : confirmAction.type === "buy"
                ? "Confirm Purchase"
                : confirmAction.type === "sell"
                ? "Confirm Sale"
                : "Confirm Action"}
              </h3>
              {/* BODY */}
              <p className="text-sm text-gray-600 mb-4">
                {confirmAction.type === "buy" && (
                  <>You are about to <b>buy {confirmAction.payload.creditsListed}</b> creditsfrom <b>{confirmAction.payload.sellerCompanyName}</b>.</>
                  )}
                  {confirmAction.type === "sell" && (
                    <>You are about to <b>sell {confirmAction.payload.amount}</b> credits.</>
                    )}
                    {confirmAction.type === "logout" && (
                      <>You are about to <b>log out</b> of your account.<br />
                      <span className="text-xs text-gray-500">You will need to log in again to access the dashboard.</span></>)}
                      </p>
              {/* ACTIONS */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                onClick={() => setConfirmAction(null)}
                className="px-4 py-2 text-sm rounded-xl border border-green-600 text-green-700 hover:bg-emerald-50 hover:scale-[1.03] transition-transform">
                  Cancel
                  </button>
                  <button
                  onClick={async () => {
                    if (confirmAction.type === "buy") {
                      const l = confirmAction.payload;
                      await handleBuy(l.saleUnitId, l.creditsListed);
                    }
                    if (confirmAction.type === "sell") {
                      await handleSell();
                    }
                    if (confirmAction.type === "logout") {
                      handleLogout();
                    }
                    setConfirmAction(null);
                  }}
                  className={`px-4 py-2 text-sm rounded-xl text-white transition-transform hover:scale-105 ${
                    confirmAction.type === "logout"
                    ? "bg-red-500 hover:bg-red-600"
                    : "px-4 py-2 text-sm rounded-xl text-white bg-red-500 hover:bg-red-600 transition-transform hover:scale-105 active:scale-95"
                  }`}>Confirm</button>
                  </div>
                </div>
              </div>
          )}
        </div>
      </main>
    </div>
  );
}

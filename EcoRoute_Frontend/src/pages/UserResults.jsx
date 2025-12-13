import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/api";
import Sidebar from "../Components/UserSideBar";
import "../styles/UserDashboard.css";

export default function UserResults() {
  const navigate = useNavigate();
  const location = useLocation();

  // Retrieve data passed from Calculator
  const { quotes, request } = location.state || {};

  // State for the currently selected route
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [loading, setLoading] = useState(false);

  const minCO2 = quotes?.length > 0 ? Math.min(...quotes.map(q => q.totalCO2Emission || q.orderCO2Emission)) : 0;
  const minDuration = quotes?.length > 0 ? Math.min(...quotes.map(q => q.routeDuration)) : 0;

  // Redirect if no data (e.g., user refreshed page)
  useEffect(() => {
    // Console.Log("inside the page");
    if (!quotes || !request) {
      navigate("/carbon-quote-calculator");
    } else if (quotes.length > 0) {
    // Console.Log("data available");

      // Auto-select the first option by default
      setSelectedQuote(quotes[0]);
    }
  }, [quotes, request, navigate]);

  // Handle Placing Order
  const handlePlaceOrder = async () => {
    if (!selectedQuote) return alert("Please select a quote first.");

    setLoading(true);
    const orderPayload = {
      ...selectedQuote, // CO2, Distance, Route Summary, etc.
      selectedPolyline: selectedQuote.selectedPolyline || " ",
      // Map fields from the original request 
      // (Ensure these keys match your C# OrderDto properties exactly)
      orderNature: request.orderNature || request.natureOfTransport,
      transportMode: request.transportMode || request.transportMethod,
      orderTotalItems: request.orderTotalItems || request.unitCount,
      orderWeightKg: request.orderWeightKg || request.orderWeight,
      orderLength: request.orderLength,
      orderWidth: request.orderWidth,
      orderHeight: request.orderHeight,
      // If backend expects string "Shared" or bool, handle accordingly:
      orderMode: request.orderMode || (request.isShared ? "Shared" : "Dedicated"), 
      isRefrigerated: request.isRefrigerated,
      orderOrigin: request.orderOrigin || request.origin,
      orderDestination: request.orderDestination || request.destination,
      shipmentDate: request.shipmentDate || new Date().toISOString()
    };

    console.log("Sending Payload:", JSON.stringify(orderPayload, null, 2)); // Debugging
    try {
      // Call the backend endpoint
      await api.post("/api/calculate-carbon-quote/place-order", orderPayload);
      
      alert("Order placed successfully!");
      navigate("/client-shipments"); // Redirect to history after success
    } catch (err) {
      console.error("Order placement failed:", err);
      alert(err.response?.data || "Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!quotes || !request) return null; // Prevent flicker before redirect


  
  return (
    <div className="dashboard-container">
      <Sidebar />

        {/* 2. Main Content Area */}
        {/* Added ml-64 (or typical sidebar width margin) if Sidebar is fixed, assuming Sidebar handles its own width or is 64/250px */}
        <main className="flex-1 p-8 ml-0 md:ml-[250px]"> 
        
        <header className="top-bar">
          <h2 className="page-title">Calculation Results</h2>
          <div className="header-actions">
            <span className="material-symbols-outlined" style={{fontSize: '28px'}}>account_circle</span>
          </div>
        </header>

        <div className="content-scroll-area">
          <div className="space-y-10 max-w-6xl mx-auto">

            <div>
              <h2 className="text-3xl font-bold text-gray-800">Carbon Footprint Results</h2>
              <p className="text-gray-500 mt-1">
                A summary of the calculated emissions based on your shipment details.
              </p>
            </div>

            {/* DYNAMIC QUOTE CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* 1. SORT: Sustainable (Lowest CO2) First */}
              {[...quotes]
                .sort((a, b) => {
                  const co2A = a.totalCO2Emission || a.orderCO2Emission || 0;
                  const co2B = b.totalCO2Emission || b.orderCO2Emission || 0;
                  return co2A - co2B;
                })
                .map((quote, index) => {
                const isSelected = selectedQuote === quote;
                
                // Determine styling based on index (Mocking "Sustainable" vs "Fast" logic)
                // You can replace this logic if your backend returns a 'tag' or 'type' field
                const currentCO2 = quote.totalCO2Emission || quote.orderCO2Emission;
                const currentDuration = quote.routeDuration;

                const isSustainable = currentCO2 === minCO2;
                const isFast = currentDuration === minDuration;
                
                // If neither, it's a normal route
                const isNormalRoute = !isSustainable && !isFast;

                return (
                  <div 
                    key={index}
                    onClick={() => setSelectedQuote(quote)}
                    className={`border rounded-xl p-6 shadow-sm transition cursor-pointer relative bg-white
                      ${isSelected ? "ring-2 ring-emerald-500 bg-emerald-50" : "hover:shadow-md"}
                    `}
                  >
                    <div className="flex flex-wrap gap-x-4 gap-y-2 mb-3 min-h-[24px]">
                    {/* Badge logic */}
                    {isSustainable && (
                        <p className="text-sm font-bold text-emerald-600 flex items-center gap-2">
                          <span className="material-symbols-outlined text-emerald-600 text-lg">eco</span>
                          MOST SUSTAINABLE
                        </p>
                      )}
                      
                      {isFast && (
                        <p className="text-sm font-bold text-amber-600 flex items-center gap-2">
                          <span className="material-symbols-outlined text-amber-600 text-lg">bolt</span>
                          QUICK DELIVERY
                        </p>
                      )}

                      {/* Spacer for alignment if no badges exist */}
                      {isNormalRoute && (
                        <p className="text-sm font-bold text-transparent flex items-center gap-2 select-none" aria-hidden="true">
                          <span className="material-symbols-outlined text-lg">eco</span>
                          SPACER
                        </p>
                      )}
                    </div>

                    {/* Data from Quote Object */}
                    {/* Ensure these property names match your C# OrderDto exactly */}
                    <h3 className="text-3xl font-bold text-gray-800">
                      {((request.orderWeightKg / 1000) * quote.orderCO2Emission).toFixed(2) || "0"} kg CO₂e
                    </h3>

                    <div className="flex flex-wrap gap-2 mt-3">
  
                      {/* Distance Badge */}
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-100 text-gray-700 text-sm font-medium">
                        <span className="material-symbols-outlined text-emerald-500 text-[18px]">straighten</span>
                        <span>{quote.orderDistance || "N/A"} km</span>
                      </div>

                      {/* Duration Badge */}
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-100 text-gray-700 text-sm font-medium">
                        <span className="material-symbols-outlined text-emerald-500 text-[18px]">schedule</span>
                        <span>{(quote.routeDuration / 60).toFixed(0) || "N/A"} mins</span>
                      </div>

                    </div>

                    <div className = "bottom gap mt-4">
                      </div>

                    {/* Display Route Code if available, or Origin -> Dest */}
                    <div className="flex items-center gap-1.5 mt-3 text-gray-500 text-sm">
                      <span className="material-symbols-outlined text-[18px] text-gray-400">alt_route</span>
                      <span className="font-medium truncate max-w-[250px]" title={quote.selectedRouteSummary}>
                        VIA {quote.selectedRouteSummary?.toUpperCase() || "N/A"}
                      </span>
                    </div>

                    <button 
                      className={`w-full mt-6 py-3 rounded-lg font-semibold transition-colors
                        ${isSelected 
                          ? "bg-emerald-500 text-white hover:bg-emerald-600" 
                          : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"}
                      `}
                    >
                      {isSelected ? "Selected" : "Select Quote"}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* SHIPMENT SUMMARY (From Request Data) */}
            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-800">Shipment Details Summary</h2>

              <div className="border rounded-xl p-6 shadow-sm bg-white border-gray-200">
                <div className="grid grid-cols-2 gap-y-6 gap-x-12 text-sm">

                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-500">From</span>
                    <span className="font-semibold text-gray-800">{request.orderOrigin}</span>
                  </div>

                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-500">To</span>
                    <span className="font-semibold text-gray-800">{request.orderDestination}</span>
                  </div>

                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-500">Total Items in Order</span>
                    <span className="font-semibold text-gray-800">{request.orderTotalItems}</span>
                  </div>

                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-500">Total Weight of the Order</span>
                    <span className="font-semibold text-gray-800">{request.orderWeightKg} kg</span>
                  </div>

                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-500">Shipment Mode</span>
                    <span className="font-semibold text-gray-800">{request.isShared ? "Shared" : "Dedicated"}</span>
                  </div>

                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-500">Transport Vehicle Assigned</span>
                    <span className="font-semibold text-gray-800">{selectedQuote?.transportVehicle}</span>
                  </div>

                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-500">Dimensions (LxWxH)</span>
                    <span className="font-semibold text-gray-800">
                      {request.orderLength}x{request.orderWidth}x{request.orderHeight} m
                    </span>
                  </div>

                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-500">Order Type</span>
                    <span className="font-semibold text-gray-800">{request.orderNature}</span>
                  </div>

                </div>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex flex-wrap gap-4 mt-8 pb-10">
              <button 
                onClick={() => navigate("/carbon-quote-calculator")}
                className="px-6 py-3 border border-emerald-500 text-emerald-600 rounded-lg font-semibold hover:bg-emerald-50 transition"
              >
                Start a New Quote
              </button>

              <button 
                onClick={handlePlaceOrder}
                disabled={loading || !selectedQuote}
                className={`px-6 py-3 bg-emerald-500 text-white rounded-lg font-semibold flex items-center gap-2 transition shadow-sm
                  ${loading ? "opacity-70 cursor-not-allowed" : "hover:bg-emerald-600 hover:shadow"}
                `}
              >
                {loading ? "Processing..." : "Place Shipment Order"}
                {!loading && <span className="material-symbols-outlined text-sm">check</span>}
              </button>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
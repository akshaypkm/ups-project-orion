import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/api";
import Sidebar from "../Components/UserSideBar";
import RouteMap from "../Components/RouteMap"; // Ensure this uses the FIXED version I gave you earlier
import "../styles/UserDashboard.css";

export default function UserResults() {

  const location = useLocation();
  //notification and logout 
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [confirmAction, setConfirmAction] = useState(null);
  const navigate = useNavigate();
  const handleNotifications = async () => {
    try{
        const res = await api.get("/api/client-dashboard/notifications");
        setNotifications(res.data);
    }
    catch(err){
        console.error("notifications loading failed");
    }
  };
   const handleLogout = () => {
    localStorage.removeItem("ecoroute_token");
    navigate("/");
  };
  
  const { quotes, request } = location.state || {};
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [loading, setLoading] = useState(false);
  

  // Calculate Minimums for badges
  const minCO2 = quotes?.length > 0 ? Math.min(...quotes.map(q => q.totalCO2Emission || q.orderCO2Emission)) : 0;
  const minDuration = quotes?.length > 0 ? Math.min(...quotes.map(q => q.routeDuration)) : 0;

  useEffect(() => {
    if (!quotes || !request) {
      navigate("/carbon-quote-calculator");
    } else if (quotes.length > 0) {
      // Auto-select the first (Best) route
      // We sort the data first to ensure index 0 is always the sustainable one
      const sortedQuotes = [...quotes].sort((a, b) => {
        const co2A = a.totalCO2Emission || a.orderCO2Emission || 0;
        const co2B = b.totalCO2Emission || b.orderCO2Emission || 0;
        return co2A - co2B;
      });
      setSelectedQuote(sortedQuotes[0]);
    }
  }, [quotes, request, navigate]);

  const handlePlaceOrder = async () => {
    if (!selectedQuote) return alert("Please select a quote first.");
    setLoading(true);

    // 1. Find the Fastest Route (Baseline for Standard Emissions)
    // We assume the "Fastest" route represents the standard, non-optimized way.
    const fastestQuote = quotes && quotes.length > 0 
      ? quotes.reduce((prev, current) => (prev.routeDuration < current.routeDuration) ? prev : current)
      : selectedQuote;

    // 2. Extract CO2 from that fastest route
    const standardEmissions = fastestQuote.totalCO2Emission || fastestQuote.orderCO2Emission || 0;

    const orderPayload = {
      ...selectedQuote,
      selectedPolyline: selectedQuote.selectedPolyline || "", 
      orderNature: request.orderNature || request.natureOfTransport,
      transportMode: request.transportMode || request.transportMethod,
      orderTotalItems: request.orderTotalItems || request.unitCount,
      orderWeightKg: request.orderWeightKg || request.orderWeight,
      orderLength: request.orderLength,
      orderWidth: request.orderWidth,
      orderHeight: request.orderHeight,
      orderMode: request.orderMode || (request.isShared ? "Shared" : "Dedicated"), 
      isRefrigerated: request.isRefrigerated,
      orderOrigin: request.orderOrigin || request.origin,
      orderDestination: request.orderDestination || request.destination,
      shipmentDate: request.shipmentDate || new Date().toISOString(),
      orderStandardCO2Emissions : standardEmissions
    };

    try {
      await api.post("/api/calculate-carbon-quote/place-order", orderPayload);
      alert("Order placed successfully!");
      navigate("/client-shipments");
    } catch (err) {
      console.error("Order placement failed:", err);
      if (err.response && err.response.data) {
        alert(`Failed: ${typeof err.response.data === 'string' ? err.response.data : JSON.stringify(err.response.data)}`);
      } else {
        alert("Failed to place order. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!quotes || !request) return null;

  // Pre-sort quotes so Sustainable is always top
  const sortedQuotes = [...quotes].sort((a, b) => {
    const co2A = a.totalCO2Emission || a.orderCO2Emission || 0;
    const co2B = b.totalCO2Emission || b.orderCO2Emission || 0;
    return co2A - co2B;
  });

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-lime-100 via-green-100 to-emerald-100 overflow-hidden">
    <Sidebar />
    <main className="flex-1 ml-0 md:ml-[250px] px-6 py-6 overflow-y-auto"> 
      <div className="space-y-6 max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h2 className="text-4xl font-extrabold bg-gradient-to-r from-lime-600 via-green-600 to-emerald-700 bg-clip-text text-transparent">Calculation Results</h2>
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

            <div>
              <h2 className="text-3xl font-bold text-gray-800">Route Options</h2>
              <p className="text-gray-500 mt-1">
                Select a route to view the full map and details.
              </p>
            </div>

            {/* --- VERTICAL EXPANDABLE LIST --- */}
            <div className="space-y-6">
              {sortedQuotes.map((quote, index) => {
                const isSelected = selectedQuote === quote;
                
                const currentCO2 = quote.orderCO2Emission;
                const currentDuration = quote.routeDuration;
                const isSustainable = currentCO2 === minCO2;
                const isFast = currentDuration === minDuration;

                return (
                  <div 
                    key={index}
                    // OLD: onClick={() => setSelectedQuote(quote)}

                    // NEW: Toggle logic
                    onClick={() => {
                    if (selectedQuote === quote) {
                        setSelectedQuote(null); // Deselect if already open
                    } else {
                        setSelectedQuote(quote); // Select if closed
                    }
                    }}
                    className={`border rounded-xl transition-all duration-300 bg-white/70 overflow-hidden
                      ${isSelected ? "ring-2 ring-emerald-500 shadow-md" : "hover:shadow-md border-gray-200 cursor-pointer"}
                    `}
                  >
                    {/* Header Row (Always Visible) */}
                    <div className={`p-6 flex items-center justify-between ${isSelected ? 'bg-white/70' : ''}`}>
                      <div className="flex items-center gap-6">
                        
                        {/* Radio Indicator */}
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
                          ${isSelected ? 'border-emerald-500' : 'border-gray-300'}
                        `}>
                          {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-white/70"></div>}
                        </div>

                        {/* Summary Info */}
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-xl font-bold text-gray-800">
                              {(currentCO2).toFixed(2)} kg CO₂e
                            </h3>
                            {/* Badges Inline */}
                            {isSustainable && (
                              <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">eco</span> Sustainable
                              </span>
                            )}
                            {isFast && (
                              <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">bolt</span> Fast
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1 text-emerald-500">
                              <span className="material-symbols-outlined text-[16px]">straighten</span> 
                              {quote.orderDistance} km
                            </span>
                            <span className="flex items-center gap-1 text-purple-500">
                              <span className="material-symbols-outlined text-[16px]">schedule</span> 
                              {(quote.routeDuration / 60).toFixed(0)} mins
                            </span>
                            <span className="flex items-center gap-1  text-orange-500 text-truncate max-w-[500px]">
                              <span className="material-symbols-outlined text-[16px]">alt_route</span> 
                              Via {quote.selectedRouteSummary}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Expand/Collapse Icon */}
                      <span className="material-symbols-outlined text-gray-400">
                        {isSelected ? "expand_less" : "expand_more"}
                      </span>
                    </div>

                    {/* Expanded Content (Map & Details) */}
                    {isSelected && (
                    <div 
                        className="border-t border-emerald-100 p-6 animate-in fade-in slide-in-from-top-2 duration-300 cursor-default"
                        onClick={(e) => e.stopPropagation()} 
                      >                        
                        {/* THE MAP (Now huge and reliable) */}
                        <div className="w-full h-[400px] rounded-xl overflow-hidden border border-emerald-200 bg-emarald-50 shadow-inner mb-6 relative">
                          {quote.selectedPolyline ? (
                            <RouteMap encodedPolyline={quote.selectedPolyline} />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              No Map Data Available
                            </div>
                          )}
                        </div>

                        {/* Action Bar */}
                        <div className="flex justify-end items-center gap-4">
                          <span className="text-sm text-gray-500">
                            Selecting this route will place an order request.
                          </span>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent toggling the card
                              handlePlaceOrder();
                            }}
                            disabled={loading}
                            className={`px-8 py-3 bg-gradient-to-r from-lime-500 via-green-500 to-emerald-600 text-white rounded-lg font-semibold flex items-center gap-2 shadow-sm transition-transform hover:scale-105 active:scale-95
                              ${loading ? "opacity-70 cursor-not-allowed" : "hover:bg-emerald-600"}
                            `}
                          >
                            {loading ? "Processing..." : "Confirm & Place Order"}
                            {!loading && <span className="material-symbols-outlined text-sm">check</span>}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* SUMMARY SECTION (Unchanged) */}
            <div className="pt-8 pb-10">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Shipment Summary</h2>
              
              <div className="bg-emerald-50 backdrop-blur-2xl rounded-3xl shadow-2xl border border-emerald-300 p-6">
                {/* We use a definition list style grid for better alignment */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                  
                  {/* Column 1 */}
                  <div className="p-6 space-y-4">
                    <div>
                      <span className="block text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">From</span>
                      <span className="text-gray-800 font-medium text-lg block">{request.orderOrigin}</span>
                    </div>
                    <div>
                      <span className="block text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">To</span>
                      <span className="text-gray-800 font-medium text-lg block">{request.orderDestination}</span>
                    </div>
                  </div>

                  {/* Column 2 */}
                  <div className="p-6 space-y-4">
                    <div>
                      <span className="block text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Total Items</span>
                      <span className="text-gray-800 font-medium block">{request.orderTotalItems} units</span>
                    </div>
                    <div>
                      <span className="block text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Total Weight of the Order</span>
                      <span className="text-gray-800 font-medium block">{request.orderWeightKg} kg</span>
                    </div>
                  </div>

                  {/* Column 3 */}
                  <div className="p-6 space-y-4">
                     <div>
                      <span className="block text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Shipment Mode</span>
                      <span className="inline-block px-2 py-1 bg-gray-100 rounded text-gray-700 text-sm font-medium">{request.isShared ? "Shared" : "Dedicated"}</span>
                    </div>
                    <div>
                      <span className="block text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Transport Vehicle</span>
                      <span className="text-gray-800 font-medium block">{selectedQuote?.transportVehicle}</span>
                    </div>
                  </div>

                  {/* Column 4 */}
                  <div className="p-6 space-y-4">
                    <div>
                      <span className="block text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Dimensions</span>
                      <span className="text-gray-800 font-medium block">{request.orderLength}x{request.orderWidth}x{request.orderHeight} m</span>
                    </div>
                    <div>
                      <span className="block text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Order Type</span>
                      <span className="text-gray-800 font-medium block capitalize">{request.orderNature}</span>
                    </div>
                  </div>

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
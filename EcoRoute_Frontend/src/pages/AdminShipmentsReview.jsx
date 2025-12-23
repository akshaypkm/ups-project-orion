import React, { useState, useEffect } from "react";
// Adjusted paths to use ../../ based on folder depth
import AdminSidebar from "../Components/AdminSidebar";
import RouteMap from "../Components/RouteMap"; 
import api from "../api/api"; 
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AdminShipmentsReview() {
  const [loading, setLoading] = useState(true);
  const [shipments, setShipments] = useState([]);
  const [openCard, setOpenCard] = useState(null);
  const [improvisedGroups, setImprovisedGroups] = useState([]);
  const [isImprovisedView, setIsImprovisedView] = useState(false);
  const navigate = useNavigate();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [confirmAction, setConfirmAction] = useState(null);
  const handleNotifications = async () => {
  try {
    const res = await api.get("/api/admin-dashboard/notifications");
    setNotifications(res.data);
  } catch (err) {
    console.error("Admin notifications failed");
  }
};
  const handleLogout = () => {
  localStorage.removeItem("ecoroute_token");
  navigate("/");
};
  const [confirmBox, setConfirmBox] = useState({
  open: false,
  title: "",
  message: "",
  onConfirm: null,
});
  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // --- 1. Fetch Data from Backend ---
  useEffect(() => {
    const fetchShipments = async () => {
      try {
        const res = await api.get("/admin-shipments-review/get-review-shipments");
        setShipments(res.data);
      } catch (err) {
        console.error("Failed to fetch review shipments:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchShipments();
  }, []);

  // --- 2. Action Handlers ---

const handleApprove = (shipment) => {
  setConfirmBox({
    open: true,
    title: "Approve Shipment",
    message: `Are you sure you want to approve shipment #${shipment.orderId}?`,
    onConfirm: async () => {
      try {
        await api.post("/admin-shipments-review/approve", shipment);
        setShipments(prev => prev.filter(s => s.orderId !== shipment.orderId));
        alert(`Shipment #${shipment.orderId} approved`);
      } catch (err) {
        alert("Approval failed");
      } finally {
        setConfirmBox({ open: false });
      }
    },
  });
};


const handleCancel = (shipment) => {
  setConfirmBox({
    open: true,
    title: "Cancel Shipment",
    message: `Cancel shipment #${shipment.orderId}? This action cannot be undone.`,
    onConfirm: async () => {
      try {
        await api.post("/admin-shipments-review/cancel", shipment);
        setShipments(prev => prev.filter(s => s.orderId !== shipment.orderId));
        alert(`Shipment #${shipment.orderId} cancelled`);
      } catch (err) {
        alert("Cancellation failed");
      } finally {
        setConfirmBox({ open: false });
      }
    },
  });
};


  const handleImprovise = async () => {
  try {
    const sharedShipments = shipments.filter(
  s => s.orderMode?.toLowerCase() === "shared"
);
    setLoading(true);

    const res = await api.post(
      "/admin-shipments-review/improvise-shipment",
      sharedShipments // send ALL currently loaded orders
    );

    setImprovisedGroups(res.data);
    setIsImprovisedView(true);
    setOpenCard(null);
  } catch (err) {
    console.error("Failed to improvise shipments:", err);
    alert("Failed to improvise shipments");
  } finally {
    setLoading(false);
  }
};

const approveGroup = async (group) => {
  await api.post(
    "/admin-shipments-review/improvise-shipment-approve",
    group
  );

  setShipments(prev =>
    prev.filter(
      s => !group.orders.some(o => o.orderId === s.orderId)
    )
  );

  // navigate("/admin-dashboard");
};


const handleApproveGroup = (group) => {
  setConfirmBox({
    open: true,
    title: "Approve Grouped Shipment",
    message: `Approve grouped shipment containing ${group.orders.length} orders?`,
    onConfirm: () => {
      setConfirmBox({ open: false });

      approveGroup(group).catch(() => {
        alert("Group approval failed");
      });
    },
  });
};


// const handleCancelGroup = async (group) => {
//   if (!window.confirm("Cancel all orders in this group?")) return;

//   try {
//     await api.post(
//       "/api/admin-shipments-review/cancel-group",
//       group
//     );

//     setShipments(prev =>
//       prev.filter(s => !group.orders.some(o => o.orderId === s.orderId))
//     );

//     alert("Grouped shipment cancelled");
//   } catch (err) {
//     console.error("Group cancellation failed:", err);
//     alert("Failed to cancel grouped shipment");
//   }
// };


  // --- 3. Filter Logic ---
  const filteredShipments = shipments.filter((ship) => {
    // Search by ID, Origin, or Destination
    const searchTerm = search.toLowerCase();
    const matchSearch = 
      (ship.orderId?.toString().toLowerCase().includes(searchTerm)) ||
      (ship.orderOrigin?.toLowerCase().includes(searchTerm)) ||
      (ship.orderDestination?.toLowerCase().includes(searchTerm));

    // Filter by Status (Map backend status to UI options if needed)
    const matchStatus =
      statusFilter === "All" || 
      (ship.orderStatus && ship.orderStatus.toLowerCase() === statusFilter.toLowerCase());

    return matchSearch && matchStatus;
  });

  // --- Helper: Calculate Emission Reduction ---
  const calculateReduction = (actual, standard) => {
    if (!standard || standard === 0) return 0;
    const reduction = ((standard - actual) / standard) * 100;
    return reduction.toFixed(1);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-emerald-100 via-teal-100 to-blue-200 overflow-hidden">
      {/* SIDEBAR */}
      <AdminSidebar />

      {/* MAIN CONTENT */}
      <main className="flex-1 ml-0 md:ml-[250px] px-6 py-6 overflow-y-auto">
        
        {/* HEADER */}
        <div className="space-y-6">
          <header className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-600 bg-clip-text text-transparent">Shipment Review</h1>
          <div className="flex items-center gap-4">
                 {/* Notifications */}
                 <div className="relative">
                  <button
                  className="p-2 rounded-full hover:bg-blue-100 transition"
                  onClick={() => {
                    if (!isNotifOpen) handleNotifications();
                    setIsNotifOpen(!isNotifOpen);}}>
                      <span className="material-symbols-outlined text-gray-600">notifications</span>
                  </button>
                {isNotifOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 p-2 z-50 max-h-64 overflow-y-auto">
                    <h4 className="text-xs font-bold text-gray-400 uppercase px-2 py-1 mb-1">Notifications</h4>
                    {notifications.length > 0 ? (
                      notifications.map((n, i) => (
                      <div key={i} className="p-3 text-sm text-blue-700 bg-gray-50 rounded-xl hover:bg-gray-100">
                        {n.message}
                      </div>)) ) : (
                        <p className="text-sm text-gray-500 text-center py-4">No new notifications</p>
                        )}
                        </div>
                      )}
                      </div>
                {/* Profile */}
                <div className="relative">
                  <button
                  className="p-2 rounded-full hover:bg-blue-100 transition"
                  onClick={() => setIsProfileOpen(!isProfileOpen)}>
                    <span className="material-symbols-outlined text-gray-600 text-3xl">account_circle</span>
                    </button>
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border py-2 z-50">
                      <div className="px-4 py-2 border-b">
                        <p className="text-sm font-bold text-blue-800">Admin Profile</p>
                      </div>
                    <button
                    onClick={() => setConfirmAction({ type: "logout" })}
                    className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg">logout</span>Log Out
                      </button>
                      </div>
                    )}
                    </div>
                  </div>
          </header>
          <p className="text-gray-500 mt-1">Review and approve pending shipments for carbon compliance</p>
        </div>

        {/* FILTER BAR */}
        <div className="flex items-center gap-4 mb-8">
          {/* SEARCH */}
          {!isImprovisedView && <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by Order ID, Origin or Destination..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/80 backdrop-blur-xl border border-blue-200 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"/>
            </div>}
            {!isImprovisedView && <button
              onClick={handleImprovise}
              disabled={isImprovisedView}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-600 text-white font-semibold hover:opacity-90 transition-transform hover:scale-105 active:scale-95 shadow-lg">
              Improvise Shipments
            </button>}
            {isImprovisedView && (
              <div className="mb-6 ">
                <button
                onClick={() => {
                  setIsImprovisedView(false);
                  setImprovisedGroups([]);
                  setOpenCard(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-red-100 text-red-600 border border-red-200 hover:bg-red-200 transition transition-transform hover:scale-105 active:scale-95">
                  Back to Original Shipments
                  </button>
                  </div>
              )}

          {/* STATUS FILTER */}
          {!isImprovisedView &&
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 pr-10 py-2.5 min-w-[180px] rounded-xl cursor-pointer bg-white/80 backdrop-blur-xl border border-blue-200 text-gray-700 font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
            <option value="All">Status: All</option>
            <option value="Processing">Processing</option>
            <option value="Planned">Planned</option>
          </select>}
        </div>

        {/* SHIPMENT CARDS */}
        <div className="space-y-5">
          {loading && (
            <div className="text-center py-12 bg-white/70 backdrop-blur-2xl rounded-3xl border border-white/30 text-blue-600 font-medium shadow-lg">
              Loading shipments...
            </div>
          )}
          {!loading && !isImprovisedView && filteredShipments.length === 0 && (
            <div className="text-center py-12 bg-white/70 backdrop-blur-2xl rounded-3xl border border-white/30 text-blue-600 font-medium shadow-lg bg-white rounded-xl border border-dashed">
              No shipments found matching your criteria.
            </div>
          )}
            
           {/* NORMAL VIEW */}
           {!loading && !isImprovisedView &&
           filteredShipments.map((ship, index) => {
            const uniqueId = ship.orderId || `ship-${index}`;
            const isOpen = openCard === uniqueId;
            // Calculate reduction if standard emissions exist
            const reduction = calculateReduction(ship.orderCO2Emission, ship.orderStandardCO2Emissions);
            const isPositiveReduction = reduction > 0;
            return (
            <div
            key={uniqueId}
            className={`bg-white/70 backdrop-blur-2xl rounded-3xl border border-white/30 transition-all duration-200 ${
              isOpen ? "ring-2 ring-blue-400 shadow-2xl" : "hover:shadow-xl"
            }`}
                >
            {/* CARD HEADER (Click to Expand) */}
                  <div
                    onClick={() => setOpenCard(isOpen ? null : uniqueId)}
                    className="px-6 py-5 flex justify-between items-center cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-6">
                      {/* ID & Route */}
                      <div>
                        <p className="text-blue-600 font-bold text-lg">#{uniqueId}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                          <span className="font-medium text-gray-700">{ship.orderOrigin}</span>
                          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                          <span className="font-medium text-gray-700">{ship.orderDestination}</span>
                        </div>
                      </div>

                      {/* Quick Stats (Visible when collapsed) */}
                      {!isOpen && (
                        <div className="hidden md:flex gap-6 text-sm text-gray-500 border-l pl-6 ml-2">
                          <div>
                            <span className="block text-xs uppercase text-gray-400">Date</span>
                            {ship.orderDate ? new Date(ship.orderDate).toLocaleDateString() : "N/A"}
                          </div>
                          <div>
                            <span className="block text-xs uppercase text-gray-400">Weight</span>
                            {ship.orderWeightKg} kg
                          </div>
                          <div>
                            <span className="block text-xs uppercase text-gray-400">CO2e</span>
                            {ship.orderCO2Emission?.toFixed(2)} kg
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Status Badge */}
                      <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wide rounded-full ${
                        ship.orderStatus === 'Pending' ? "bg-yellow-100 text-yellow-700" :
                        ship.orderStatus === 'Approved' ? "bg-green-100 text-green-700" :
                        "bg-gray-100 text-gray-600"
                      }`}>
                        {ship.orderStatus || "Unknown"}
                      </span>
                      
                      {/* Chevron Icon */}
                      <span className={`material-symbols-outlined text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}>
                        expand_more
                      </span>
                    </div>
                  </div>

                  {/* EXPANDED VIEW */}
                  {isOpen && (
                    <div className="border-t border-gray-100 px-6 py-6 animate-in fade-in slide-in-from-top-2">
                      <div className="flex flex-col lg:flex-row gap-6">
                        
                        {/* LEFT: MAP */}
                        <div className="flex-1 min-h-[300px] h-[350px] bg-gray-50 rounded-xl overflow-hidden border border-gray-200 relative">
                          {ship.selectedPolyline ? (
                            <RouteMap encodedPolyline={ship.selectedPolyline} />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              No Route Data Available
                            </div>
                          )}
                        </div>

                        {/* RIGHT: DETAILS */}
                        <div className="flex-1 flex flex-col justify-between">
                          <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                            
                            <div>
                              <p className="text-xs text-gray-400 uppercase font-bold">Transport Mode</p>
                              <p className="font-medium text-gray-800 capitalize">{ship.transportMode || "N/A"}</p>
                            </div>
                            
                            <div>
                              <p className="text-xs text-gray-400 uppercase font-bold">Vehicle</p>
                              <p className="font-medium text-gray-800">{ship.transportVehicle || "Standard Fleet"}</p>
                            </div>

                            <div>
                              <p className="text-xs text-gray-400 uppercase font-bold">Distance</p>
                              <p className="font-medium text-gray-800">{ship.orderDistance} km</p>
                            </div>

                            <div>
                              <p className="text-xs text-gray-400 uppercase font-bold">Actual Emissions</p>
                              <p className="font-medium text-gray-800 text-lg">
                                {ship.orderCO2Emission?.toFixed(2)} kg
                              </p>
                            </div>

                            <div className="col-span-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-xs text-gray-500 font-medium">Standard Baseline</span>
                                <span className="text-xs font-bold text-gray-700">{ship.orderStandardCO2Emissions?.toFixed(2)} kg</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-500 font-medium">Carbon Savings</span>
                                <span className={`text-sm font-bold ${isPositiveReduction ? "text-green-600" : "text-red-500"}`}>
                                  {isPositiveReduction ? `-${reduction}% Reduction` : `${Math.abs(reduction)}% Increase`}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* ACTION BUTTONS */}
                          
                          
                            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-100">
                            
                              <button
                                onClick={() => setOpenCard(null)}
                                className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-600 font-medium hover:bg-gray-50 transition-transform hover:scale-105 active:scale-95"
                              >
                                Close
                              </button>

                              <button 
                                className="px-5 py-2.5 rounded-xl bg-red-100 text-red-600 font-semibold hover:bg-red-200 transition shadow-sm flex items-center gap-2 transition-transform hover:scale-105 active:scale-95"
                                onClick={() => handleCancel(ship)} 
                              >
                                <span className="material-symbols-outlined text-sm">close</span>
                                Cancel Shipment
                              </button>

                              <button 
                                className=" px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-600 text-white font-semibold hover:opacity-90 shadow-lg flex items-center gap-2 transition-transform hover:scale-105 active:scale-95"
                                onClick={() => handleApprove(ship)} 
                              >
                                <span className="material-symbols-outlined text-sm">check</span>
                                Approve Shipment
                              </button>
                            </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {!loading && isImprovisedView &&
    improvisedGroups.map((group, index) => {
      const groupId = `group-${index}`;
      const isOpen = openCard === groupId;

      return (
        <div
          key={groupId}
          className={`bg-white rounded-xl border ${
            isOpen ? "ring-2 ring-green-400 shadow-md" : "hover:shadow-md"
          }`}
        >
          {/* GROUP HEADER */}
          <div
            onClick={() => setOpenCard(isOpen ? null : groupId)}
            className="px-6 py-5 flex justify-between items-center cursor-pointer"
          >
            <div>
              <p className="text-green-600 font-bold text-lg">
                Grouped Shipment #{index + 1}
              </p>
              <p className="text-sm text-gray-500">
                {group.orders.length} Orders • {group.transportVehicle}
              </p>
            </div>

            <span className={`material-symbols-outlined ${isOpen ? "rotate-180" : ""}`}>
              expand_more
            </span>
          </div>

          {/* EXPANDED */}
          {isOpen && (

            
            <div className="border-t px-6 py-6">
              <div className="flex flex-col lg:flex-row gap-6">

                {/* GROUP MAP */}
                <div className="flex-1 h-[350px] rounded-xl overflow-hidden border">
                  {group.optimizedGroupPolyline ? (
                    <RouteMap
                      encodedPolyline={group.optimizedGroupPolyline}
                      routeStops={group.routeStops}
                    />

                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      No Optimized Route
                    </div>
                  )}
                </div>

                {/* GROUP DETAILS */}
                <div className="flex-1">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-xs text-gray-400 uppercase">Vehicle</p>
                      <p className="font-medium">{group.transportVehicle}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase">Total Weight</p>
                      <p className="font-medium">{group.combinedOrderWeightKg} kg</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase">Total Items</p>
                      <p className="font-medium">{group.combinedOrderTotalItems}</p>
                    </div>
                  </div>

                  {/* ORDERS LIST */}
                  <div className="border rounded-lg divide-y">
                    {group.orders.map(order => (
                      <div
                        key={order.orderId}
                        className="p-3 text-sm flex justify-between items-center"
                      >
                        {/* LEFT: Order info */}
                        <div>
                          <b>{order.orderCode}</b>{" "}
                          — {order.orderOrigin.toUpperCase()} → {order.orderDestination.toUpperCase()}
                        </div>

                        {/* RIGHT: Company name */}
                        <div className="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded">
                          {order.companyName || "Unknown Company"}
                        </div>
                      </div>
                    
                    ))}
                    </div>
                  </div>

              </div>
              {/* ACTION BUTTONS */}
                  <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">

                    <button
                      onClick={() => setOpenCard(null)}
                      className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-600 font-medium hover:bg-gray-50 transition transition-transform hover:scale-105 active:scale-95"
                    >
                      Close
                    </button>

                    {/* <button
                      onClick={() => handleCancelGroup(group)}
                      className="px-5 py-2.5 rounded-xl
  bg-red-100 text-red-600 font-semibold
  hover:bg-red-200 transition
  shadow-sm flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-sm">close</span>
                      Cancel Group
                    </button> */}

                    <button
                      onClick={() => handleApproveGroup(group)}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-600 text-white font-semibold hover:opacity-90 shadow-lg flex items-center gap-2 transition-transform hover:scale-105 active:scale-95"
                    >
                      <span className="material-symbols-outlined text-sm">check</span>
                      Approve Group
                    </button>

                  </div>
            </div>
            

            
          )}
          
        </div>
      );
    })
    
  }

  
          
        </div>
        {confirmAction && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in-95">
              <h3 className="text-lg font-bold bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-600 bg-clip-text text-transparent mb-3">Confirm Logout</h3>
              <p className="text-sm text-gray-600 mb-4">You are about to <b>log out</b> of your admin account.<br />
              <span className="text-xs text-gray-500">You will need to log in again to access the admin panel.</span></p>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
              onClick={() => setConfirmAction(null)}
              className="px-4 py-2 text-sm rounded-xl border border-blue-600 text-blue-700 hover:bg-blue-50 transition-transform hover:scale-105 active:scale-95">Cancel
              </button>
              <button
              onClick={() => {
                handleLogout();
                setConfirmAction(null);
              }}
              className="px-4 py-2 text-sm rounded-xl text-white bg-red-500 hover:bg-red-600 transition-transform hover:scale-105 active:scale-95">
                Confirm</button>
                </div>
              </div>
            </div>)}
        
        
      </main>
      
      <ConfirmDialog
  open={confirmBox.open}
  title={confirmBox.title}
  message={confirmBox.message}
  onCancel={() => setConfirmBox({ open: false })}
  onConfirm={confirmBox.onConfirm}
/>



    </div>

    
  );


}

const ConfirmDialog = ({ open, title, message, onCancel, onConfirm }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in-95">
        <h3 className="text-lg font-bold bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-600 bg-clip-text text-transparent mb-3">{title}</h3>
        <p className="text-sm text-gray-600 mb-4">{message}</p>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm rounded-xl border border-blue-600 text-blue-700 hover:bg-blue-50 transition-transform hover:scale-105 active:scale-95 transition-transform hover:scale-105 active:scale-95"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm rounded-xl text-white bg-red-500 hover:bg-red-600 transition-transform hover:scale-105 active:scale-95 transition-transform hover:scale-105 active:scale-95"
          >
            Confirm
          </button>
        </div>
        </div>
     
    </div>
  );
};

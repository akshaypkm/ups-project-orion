import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import Sidebar from "../Components/UserSideBar"; // Importing your new common Sidebar
import "../styles/UserDashboard.css";    // Importing your clean CSS

export default function ClientDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // --- Filters State ---
  const [emissionPeriod, setEmissionPeriod] = useState("Month");
  const [shipmentPeriod, setShipmentPeriod] = useState("Month");
  const [savingsPeriod, setSavingsPeriod] = useState("Year");

  // --- UI State ---
  const [tradeSection, setTradeSection] = useState(null); // 'buy', 'sell', or null
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [hoveredBarIndex, setHoveredBarIndex] = useState(null);
  const [sellAmount, setSellAmount] = useState("");

  // --- Data State ---
  const [stats, setStats] = useState({
    totalEmissions: 0,
    shipments: 0,
    companyCredits: 0,
    creditMarketPrice: 0,
    forecastedEmissions: 0,
    totalForecastedEmissions: 0,
    emissionsSaved: 0,
    graphData: [],
  });
  const [listings, setListings] = useState([]);

  // --- API Logic ---
  const fetchStats = async () => {
    try {
      const res = await api.get("/api/client-dashboard/stats", {
        params: { 
          EmissionPeriod: emissionPeriod, 
          ShipmentPeriod: shipmentPeriod, 
          EmissionsSavedPeriod: savingsPeriod 
        },
      });
      setStats(res.data);
    } catch (err) {
      console.error("Stats error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchListings = async () => {
    try {
      const res = await api.get("/api/client-dashboard/emissionscreditsystem/listings");
      setListings(res.data);
    } catch (err) { console.error(err); }
  };

  // Re-fetch when filters change
  useEffect(() => { fetchStats(); }, [emissionPeriod, shipmentPeriod, savingsPeriod]);

  // Initial load & Polling
  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const res = await api.get("/api/client-dashboard/emissionscreditsystem");
        setStats(p => ({ ...p, creditMarketPrice: res.data }));
      } catch (err) { console.error(err); }
    };
    
    fetchListings(); // Get listings once on load
    const interval = setInterval(fetchPrice, 5000); // Poll price every 5s
    return () => clearInterval(interval);
  }, []);

  // --- Handlers ---
  const handleSell = async () => {
    if (!sellAmount || parseFloat(sellAmount) <= 0) return alert("Enter valid amount");
    try {
      await api.post("/api/client-dashboard/emissionscreditsystem/sale", parseFloat(sellAmount), {
        headers: { "Content-Type": "application/json" }
      });
      alert("Listed successfully!");
      setSellAmount("");
      fetchStats(); 
      fetchListings();
    } catch (err) { alert("Sale failed"); }
  };

  const handleLogout = () => {
    localStorage.removeItem("ecoroute_token");
    navigate("/");
  };

  // --- Helpers ---
  const maxGraphValue = stats.graphData?.length > 0 ? Math.max(...stats.graphData) : 100;
  const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  if (loading) return <div className="dashboard-container" style={{justifyContent:'center', alignItems:'center'}}>Loading...</div>;

  return (
    <div className="dashboard-container">
      
      {/* 1. Common Sidebar */}
      <Sidebar />

      {/* 2. Main Content Area */}
      <main className="main-content">
        
        {/* Top Header */}
        <header className="top-bar">
          <h2 className="page-title">Dashboard</h2>
          
          <div className="header-actions">
            
            {/* Notification Button */}
            <div style={{position: 'relative'}}>
              <button className="icon-btn" onClick={() => setIsNotifOpen(!isNotifOpen)}>
                <span className="material-symbols-outlined">notifications</span>
              </button>
              {isNotifOpen && (
                <div className="dropdown-menu">
                  <div style={{padding: '1rem', borderBottom: '1px solid #eee', fontSize: '0.9rem', color: '#666'}}>
                    No new notifications
                  </div>
                </div>
              )}
            </div>
            
            {/* Profile Button */}
            <div style={{position: 'relative'}}>
              <button className="icon-btn" onClick={() => setIsProfileOpen(!isProfileOpen)}>
                <span className="material-symbols-outlined" style={{fontSize: '28px'}}>account_circle</span>
              </button>
              {isProfileOpen && (
                <div className="dropdown-menu">
                  <div style={{padding: '1rem'}}>
                    <p style={{fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '0.5rem', color: '#333'}}>User Profile</p>
                    <button 
                      onClick={handleLogout} 
                      style={{color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px', padding: 0}}
                    >
                      <span className="material-symbols-outlined" style={{fontSize: '18px'}}>logout</span> Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* Scrollable Content */}
        <div className="content-scroll-area">
          <div className="stats-grid">
            
            {/* Card 1: CO2 Emissions */}
            <div className="stat-card">
              <p className="stat-title">Total CO2e emissions</p>
              <p className="stat-value">{stats.totalEmissions} t</p>
              <div className="stat-toggle">
                {['Today', 'Month', 'Year'].map(p => (
                  <div 
                    key={p} 
                    className={`toggle-option ${emissionPeriod === p ? 'active' : ''}`} 
                    onClick={() => setEmissionPeriod(p)}
                  >
                    {p}
                  </div>
                ))}
              </div>
            </div>

            {/* Card 2: Shipments */}
            <div className="stat-card">
              <p className="stat-title">Total Shipments</p>
              <p className="stat-value">{stats.shipments}</p>
              <div className="stat-toggle">
                {['Today', 'Month', 'Year'].map(p => (
                  <div 
                    key={p} 
                    className={`toggle-option ${shipmentPeriod === p ? 'active' : ''}`} 
                    onClick={() => setShipmentPeriod(p)}
                  >
                    {p}
                  </div>
                ))}
              </div>
            </div>

            {/* Card 3: Emissions Credit System */}
            <div className="stat-card credit-card">
              <div className="card-header">
                <div className="card-header-title">
                  <span className="material-symbols-outlined text-accent">credit_score</span>
                  Emissions Credit System
                </div>
                <div style={{display: 'flex', gap: '0.5rem'}}>
                  <button 
                    className="action-btn btn-primary" 
                    onClick={() => setTradeSection(tradeSection === 'buy' ? null : 'buy')}
                  >
                    Buy
                  </button>
                  <button 
                    className="action-btn btn-secondary" 
                    onClick={() => setTradeSection(tradeSection === 'sell' ? null : 'sell')}
                  >
                    Sell
                  </button>
                </div>
              </div>

              <div className="credit-stats">
                <div className="credit-stat-item">
                  <small>Market Price</small>
                  <strong>Rs {stats.creditMarketPrice}</strong>
                </div>
                <div className="credit-stat-item">
                  <small>Credits Left</small>
                  <strong className="text-accent">{stats.companyCredits}</strong>
                </div>
                <div className="credit-stat-item">
                  <small>Forecast (2mo)</small>
                  <strong>{stats.forecastedEmissions} t</strong>
                </div>
              </div>

              {/* Buy Drawer */}
              {tradeSection === 'buy' && (
                <div className="trade-panel">
                  <h4 style={{marginBottom: '10px', color: '#374151'}}>Available for Purchase</h4>
                  <table className="trade-table">
                    <thead>
                      <tr>
                        <th>Company</th>
                        <th>Units</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {listings.length > 0 ? listings.map((l, i) => (
                        <tr key={i}>
                          <td>{l.sellerCompanyName}</td>
                          <td>{l.creditsListed} EC</td>
                          <td><button className="action-btn" style={{color: '#17cfb0', background: 'none', border:'none'}}>Buy</button></td>
                        </tr>
                      )) : (
                        <tr><td colSpan="3" style={{textAlign: 'center', color: '#999', padding: '10px'}}>No listings available</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Sell Drawer */}
              {tradeSection === 'sell' && (
                <div className="trade-panel">
                  <h4 style={{marginBottom: '10px', color: '#374151'}}>Sell Credits</h4>
                  <div style={{display: 'flex', gap: '1rem', marginTop: '1rem'}}>
                    <input 
                      type="number" 
                      placeholder="Units to sell" 
                      value={sellAmount} 
                      onChange={e => setSellAmount(e.target.value)}
                      style={{padding: '0.5rem', borderRadius: '6px', border: '1px solid #ddd', flex: 1, outline: 'none'}}
                    />
                    <button className="action-btn btn-primary" onClick={handleSell}>Confirm</button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Charts & Insights Container */}
          <div className="charts-container">
            
            {/* Chart Card */}
            <div className="chart-card">
              <h3 className="stat-title" style={{marginBottom: '1rem'}}>CO2e Month Wise Emissions</h3>
              <div className="bar-chart">
                {monthLabels.map((m, i) => {
                  const val = stats.graphData[i] || 0;
                  const pct = maxGraphValue > 0 ? (val / maxGraphValue) * 100 : 0;
                  return (
                    <div 
                      key={m} 
                      className="bar-group" 
                      onMouseEnter={() => setHoveredBarIndex(i)} 
                      onMouseLeave={() => setHoveredBarIndex(null)}
                    >
                      {hoveredBarIndex === i && <div className="tooltip">{val} t</div>}
                      <div className={`bar ${val === 0 ? 'low' : ''}`} style={{height: `${pct || 5}%`}}></div>
                      <span className="bar-label">{m}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Insights Column */}
            <div className="insights-column">
              {/* Budget Forecast */}
              <div className="insight-card">
                <div className="card-header-title" style={{marginBottom:'1rem'}}>
                  <span className="material-symbols-outlined text-accent">analytics</span>
                  Carbon Budget Forecast
                </div>
                <p style={{fontSize: '0.9rem', color: '#6b7280'}}>Expected emission: {stats.totalForecastedEmissions}t</p>
                <div style={{marginTop: 'auto'}}>
                  <div style={{display:'flex', justifyContent:'space-between', marginBottom:'0.5rem'}}>
                    <span style={{fontWeight:'700', fontSize:'1.2rem'}}>{stats.totalForecastedEmissions} t</span>
                    <span style={{color:'#6b7280', fontSize:'0.9rem'}}>/ 1,200 t</span>
                  </div>
                  <div className="progress-bar-bg">
                    <div className="progress-bar-fill" style={{width: `${(stats.totalForecastedEmissions/1200)*100}%`}}></div>
                  </div>
                </div>
              </div>

              {/* Emissions Saved */}
              <div className="insight-card">
                <div className="card-header-title" style={{marginBottom:'1rem'}}>
                  <span className="material-symbols-outlined text-accent">savings</span>
                  Emissions Saved
                </div>
                <p style={{fontSize: '0.9rem', color: '#6b7280', marginBottom:'1rem'}}>
                  You saved <strong>{stats.emissionsSaved}t</strong> this period.
                </p>
                <div style={{marginTop: 'auto', display: 'flex', alignItems:'center', gap:'0.5rem'}}>
                  <span className="text-accent" style={{fontSize: '1.5rem', fontWeight:'700'}}>{stats.emissionsSaved} t</span>
                  <span className="badge">Saved</span>
                </div>
                <div className="stat-toggle" style={{marginTop:'1rem'}}>
                  {['Today', 'Month', 'Year'].map(p => (
                    <div 
                      key={p} 
                      className={`toggle-option ${savingsPeriod === p ? 'active' : ''}`} 
                      onClick={() => setSavingsPeriod(p)}
                    >
                      {p}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
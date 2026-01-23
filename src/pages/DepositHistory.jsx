import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./DepositHistory.css";

// 🔥 AUTO DETECT - Local + 2 Render Servers
const DEPOSIT_API =
  window.location.hostname === "localhost"
    ? "http://localhost:5001"
    : "https://main-server-firebase.onrender.com";

const DepositHistory = () => {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();

  const loadDeposits = async () => {
    try {
      setLoading(true);
      console.log("🌐 Loading MY deposits from:", DEPOSIT_API);
      
      const res = await fetch(`${DEPOSIT_API}/api/admin/deposits`);
      const data = await res.json();
      
      // 🔥 FILTER BY CURRENT USER EMAIL ONLY
      const storedUser = localStorage.getItem("bgmi_user");
      let userDeposits = data.deposits || [];
      
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        const userEmail = parsedUser.email;
        userDeposits = userDeposits.filter(d => d.email === userEmail);
        console.log("📥 MY DEPOSITS:", userDeposits.length);
      }
      
      setDeposits(userDeposits.reverse());
      
    } catch (err) {
      console.error("❌ Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeposits();
  }, []);

  const filteredDeposits = deposits.filter((d) => {
    if (filter === "all") return true;
    return d.status === filter;
  });

  const getStatusCount = (status) => deposits.filter(d => d.status === status).length;

  if (loading) {
    return (
      <div style={{ padding: "50px", textAlign: "center" }}>
        🔄 Loading History...
      </div>
    );
  }

  return (
    <div className="history-page">
      {/* 🔥 CLEAN HEADER - NO COUNTS */}
      <div className="history-header">
        <div className="header-title">
          <h1>🧾 My Deposit History</h1>
        </div>
      </div>

      <div className="filter-tabs">
        <button className={`filter-tab ${filter === 'all' ? 'active' : ''}`} 
                onClick={() => setFilter('all')}>
          All ({deposits.length})
        </button>
        <button className={`filter-tab ${filter === 'pending' ? 'active' : ''}`} 
                onClick={() => setFilter('pending')}>
          ⏳ Pending ({getStatusCount('pending')})
        </button>
        <button className={`filter-tab ${filter === 'approved' ? 'active' : ''}`} 
                onClick={() => setFilter('approved')}>
          ✅ Approved ({getStatusCount('approved')})
        </button>
        <button className={`filter-tab ${filter === 'rejected' ? 'active' : ''}`} 
                onClick={() => setFilter('rejected')}>
          ❌ Rejected ({getStatusCount('rejected')})
        </button>
      </div>

      <div className="history-container">
        {filteredDeposits.length === 0 ? (
          <div className="empty-state">
            <div className="empty-wallet">💰</div>
            <h3>No {filter} deposits</h3>
            <p>Make a deposit to see your transactions here</p>
            <button onClick={() => navigate("/deposit")}>➕ Add Money</button>
          </div>
        ) : (
          <div className="history-list">
            {filteredDeposits.map((d) => (
              <div key={d.id} className="history-card">
                <div className="card-left">
                  <div className="amount-row">
                    <span className="amount">₹{Number(d.amount).toLocaleString()}</span>
                    <span className={`status-dot ${d.status}`}></span>
                  </div>
                  <div className="details-row">
                    <span className="utr">UTR: {d.utr}</span>
                    <span className="date">
                      {d.createdAt ? new Date(d.createdAt).toLocaleString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit', hour12: true
                      }) : 'Just now'}
                    </span>
                  </div>
                </div>
                <div className={`status-badge-large ${d.status}`}>
                  <span className="badge-icon">
                    {d.status === "approved" ? "✅" : 
                     d.status === "pending" ? "⏳" : "❌"}
                  </span>
                  <span>{d.status.charAt(0).toUpperCase() + d.status.slice(1)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 🔥 SUMMARY BAR COMPLETELY REMOVED ✅ */}
    </div>
  );
};

export default DepositHistory;

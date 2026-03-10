// WithdrawHistory.jsx - UNIQUE CLASS NAMES
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./WithdrawHistory.css"; 

const WITHDRAW_API = window.location.hostname === "localhost"
  ? "http://localhost:5003"
  : "https://withdraw-server.onrender.com";

const formatIndianTime = (utcDate) => {
  if (!utcDate) return "—";
  const date = new Date(utcDate);
  return date.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const WithdrawHistory = () => {
  const [withdraws, setWithdraws] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const loadWithdraws = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const storedUser = localStorage.getItem("bgmi_user");
      
      if (storedUser) {
        const user = JSON.parse(storedUser);
        const res = await fetch(`${WITHDRAW_API}/api/withdraw-history?profileId=${user.profile_id}`);
        
        if (res.ok) {
          const data = await res.json();
          const myWithdraws = Array.isArray(data?.withdraws) ? data.withdraws : [];
          myWithdraws.sort((a, b) => new Date(b?.created_at) - new Date(a?.created_at));
          setWithdraws(myWithdraws);
          setLoading(false);
          return;
        }
      }

      const res = await fetch(`${WITHDRAW_API}/api/admin/withdraw-requests`);
      if (!res.ok) throw new Error("Server error");
      const data = await res.json();
      let allWithdraws = Array.isArray(data?.withdraws) ? data.withdraws : [];

      if (storedUser) {
        const user = JSON.parse(storedUser);
        allWithdraws = allWithdraws.filter((w) => 
          w?.user_email?.toLowerCase() === user.email?.toLowerCase() ||
          w?.profile_id === user.profile_id
        );
      }

      allWithdraws.sort((a, b) => new Date(b?.created_at) - new Date(a?.created_at));
      setWithdraws(allWithdraws);
    } catch (err) {
      console.error("Withdraw history error:", err);
      setError("Failed to load withdraw history. Check if 5003 server running.");
    } finally {
      setLoading(false);
    }
  }, [WITHDRAW_API]);

  useEffect(() => {
    loadWithdraws();
  }, [loadWithdraws]);

  const filteredWithdraws = withdraws.filter((w) => {
    if (filter === "all") return true;
    return w?.status === filter;
  });

  const getStatusCount = (status) => withdraws.filter((w) => w?.status === status).length;
  const refreshHistory = () => loadWithdraws();

  if (loading) {
    return <div className="withdraw-history-page">
      <div className="withdraw-loading-container">
        <div className="withdraw-spinner-large"></div>
        <p>🔄 Loading withdraw history...</p>
      </div>
    </div>;
  }

  if (error) {
    return <div className="withdraw-history-page">
      <div className="withdraw-empty-state">
        <div className="withdraw-empty-icon">⚠️</div>
        <h3>{error}</h3>
        <button onClick={refreshHistory} className="withdraw-refresh-btn">🔄 Retry Load</button>
        <button onClick={() => navigate("/wallet")} className="withdraw-back-btn">← Back to Wallet</button>
      </div>
    </div>;
  }

  return (
    <div className="withdraw-history-page">
      <div className="withdraw-history-header">
        <button className="withdraw-back-button" onClick={() => navigate("/wallet")}>← Back</button>
        <div className="withdraw-header-title">
          <h1>📜 Withdraw History</h1>
          <div className="withdraw-total-count">Total: {withdraws.length} requests</div>
        </div>
        <button className="withdraw-refresh-button" onClick={refreshHistory}>🔄</button>
      </div>

      <div className="withdraw-filter-tabs">
        <button className={`withdraw-filter-tab ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>
          All ({withdraws.length})
        </button>
        <button className={`withdraw-filter-tab ${filter === "pending" ? "active" : ""}`} onClick={() => setFilter("pending")}>
          ⏳ Pending ({getStatusCount("pending")})
        </button>
        <button className={`withdraw-filter-tab ${filter === "approved" ? "active" : ""}`} onClick={() => setFilter("approved")}>
          ✅ Approved ({getStatusCount("approved")})
        </button>
        <button className={`withdraw-filter-tab ${filter === "rejected" ? "active" : ""}`} onClick={() => setFilter("rejected")}>
          ❌ Rejected ({getStatusCount("rejected")})
        </button>
      </div>

      {filteredWithdraws.length === 0 ? (
        <div className="withdraw-empty-state">
          <div className="withdraw-empty-icon">💸</div>
          <h3>No {filter === "all" ? "withdraw" : filter} requests</h3>
          <p className="withdraw-empty-sub">
            {filter === "all" ? "Submit your first withdraw request!" : `No ${filter} withdraws yet`}
          </p>
          <div className="withdraw-empty-actions">
            <button onClick={() => navigate("/withdraw")} className="withdraw-add-money-btn">➕ New Withdraw</button>
            <button onClick={() => navigate("/wallet")} className="withdraw-back-btn">💰 Wallet</button>
          </div>
        </div>
      ) : (
        <div className="withdraw-history-list">
          {filteredWithdraws.map((w, index) => (
            <div key={w?.id || w?.withdraw_id || index} className="withdraw-history-card">
              <div className="withdraw-card-left">
                <div className="withdraw-amount-row">
                  <span className="withdraw-amount">₹{Number(w?.amount || w?.withdraw_amount || 0).toLocaleString()}</span>
                  <span className={`withdraw-status-dot ${w?.status || "pending"}`}></span>
                </div>
                <div className="withdraw-details-row">
                  <span className="withdraw-date">{formatIndianTime(w?.created_at || w?.date)}</span>
                </div>
                <div className="withdraw-user-info">👤 {w?.profile_name || w?.user_name || "You"}</div>
                <div className="withdraw-id">🆔 ID: <b>{(w?.withdraw_id || w?.id || "").slice(0, 8)}</b></div>
              </div>
              <div className={`withdraw-status-badge-large ${w?.status || "pending"}`}>
                {w?.status === "approved" ? "✅ Approved" : 
                 w?.status === "pending" ? "⏳ Pending" : 
                 w?.status === "rejected" ? "❌ Rejected" : "⏳ Processing"}
              </div>
            </div>
          ))}
          <div style={{height: '80px'}}></div>
        </div>
      )}
    </div>
  );
};

export default WithdrawHistory;

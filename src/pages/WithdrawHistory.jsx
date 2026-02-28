import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./WithdrawHistory.css"; 

const WITHDRAW_API =
  window.location.hostname === "localhost"
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

      // 🔥 TRY USER-SPECIFIC API FIRST
      const storedUser = localStorage.getItem("bgmi_user");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        
        // ✅ USER-SPECIFIC WITHDRAW HISTORY (5003 server)
        const res = await fetch(
          `${WITHDRAW_API}/api/withdraw-history?profileId=${user.profile_id}`
        );
        
        if (res.ok) {
          const data = await res.json();
          const myWithdraws = Array.isArray(data?.withdraws) ? data.withdraws : [];
          
          myWithdraws.sort((a, b) => new Date(b?.created_at) - new Date(a?.created_at));
          setWithdraws(myWithdraws);
          setLoading(false);
          return;
        }
      }

      // 🔥 FALLBACK: ADMIN API + USER FILTER
      const res = await fetch(`${WITHDRAW_API}/api/admin/withdraw-requests`);
      if (!res.ok) throw new Error("Server error");

      const data = await res.json();
      let allWithdraws = Array.isArray(data?.withdraws) ? data.withdraws : [];

      if (storedUser) {
        const user = JSON.parse(storedUser);
        allWithdraws = allWithdraws.filter((w) => {
          const sameUser =
            w?.user_email?.toLowerCase() === user.email?.toLowerCase() ||
            w?.profile_id === user.profile_id;
          return sameUser;
        });
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

  const getStatusCount = (status) =>
    withdraws.filter((w) => w?.status === status).length;

  const refreshHistory = () => loadWithdraws();

  if (loading) {
    return (
      <div className="history-page">
        <div className="history-container">
          <div className="loading-container">
            <div className="spinner-large"></div>
            <p>🔄 Loading withdraw history...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="history-page">
        <div className="history-container">
          <div className="empty-state">
            <div className="empty-icon">⚠️</div>
            <h3>{error}</h3>
            <button onClick={refreshHistory} className="refresh-btn">
              🔄 Retry Load
            </button>
            <button onClick={() => navigate("/wallet")} className="back-btn">
              ← Back to Wallet
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="history-page">
      <div className="history-container">
        {/* 🔥 HEADER WITH BACK BUTTON */}
        <div className="history-header">
          <button 
            className="back-button" 
            onClick={() => navigate("/wallet")}
          >
            ← Back
          </button>
          <div className="header-title">
            <h1>📜 Withdraw History</h1>
            <div className="total-count">
              Total: {withdraws.length} requests
            </div>
          </div>
          <button className="refresh-btn" onClick={refreshHistory}>
            🔄
          </button>
        </div>

        {/* 🔥 FILTER TABS */}
        <div className="filter-tabs">
          <button
            className={`filter-tab ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All ({withdraws.length})
          </button>
          <button
            className={`filter-tab ${filter === "pending" ? "active" : ""}`}
            onClick={() => setFilter("pending")}
          >
            ⏳ Pending ({getStatusCount("pending")})
          </button>
          <button
            className={`filter-tab ${filter === "approved" ? "active" : ""}`}
            onClick={() => setFilter("approved")}
          >
            ✅ Approved ({getStatusCount("approved")})
          </button>
          <button
            className={`filter-tab ${filter === "rejected" ? "active" : ""}`}
            onClick={() => setFilter("rejected")}
          >
            ❌ Rejected ({getStatusCount("rejected")})
          </button>
        </div>

        {/* 🔥 LIST OR EMPTY STATE */}
        {filteredWithdraws.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💸</div>
            <h3>No {filter === "all" ? "withdraw" : filter} requests</h3>
            <p className="empty-sub">
              {filter === "all"
                ? "Submit your first withdraw request!"
                : `No ${filter} withdraws yet`}
            </p>
            <div className="empty-actions">
              <button
                onClick={() => navigate("/withdraw")}
                className="add-money-btn"
              >
                ➕ New Withdraw
              </button>
              <button onClick={() => navigate("/wallet")} className="back-btn">
                💰 Wallet
              </button>
            </div>
          </div>
        ) : (
          <div className="history-list">
            {filteredWithdraws.map((w, index) => (
              <div key={w?.id || w?.withdraw_id || index} className="history-card">
                <div className="card-left">
                  <div className="amount-row">
                    <span className="amount">
                      ₹{Number(w?.amount || w?.withdraw_amount || 0).toLocaleString()}
                    </span>
                    <span className={`status-dot ${w?.status || "pending"}`} />
                  </div>
                  <div className="details-row">
                    <span className="date">
                      {formatIndianTime(w?.created_at || w?.date)}
                    </span>
                  </div>
                  <div className="user-info">
                    👤 {w?.profile_name || w?.user_name || "You"}
                  </div>
                  <div className="withdraw-id">
                    🆔 ID: <b>{(w?.withdraw_id || w?.id || "").slice(0, 8)}</b>
                  </div>
                </div>
                <div className={`status-badge-large ${w?.status || "pending"}`}>
                  {w?.status === "approved"
                    ? "✅ Approved"
                    : w?.status === "pending"
                    ? "⏳ Pending"
                    : w?.status === "rejected"
                    ? "❌ Rejected"
                    : "⏳ Processing"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WithdrawHistory;

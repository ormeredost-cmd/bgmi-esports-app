import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./DepositHistory.css";

/* =============================
   API CONFIG
============================= */
const DEPOSIT_API =
  window.location.hostname === "localhost"
    ? "http://localhost:5002"
    : "https://bgmi-server-save-tournament-data.onrender.com";

/* =============================
   TIME FORMAT (INDIA)
============================= */
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

const DepositHistory = () => {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  /* =============================
     LOAD DEPOSITS (USER + VISIBLE)
  ============================= */
  const loadDeposits = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${DEPOSIT_API}/api/deposits`);
      if (!res.ok) throw new Error("Server error");

      const data = await res.json();
      let allDeposits = Array.isArray(data?.deposits) ? data.deposits : [];

      // Get logged in user
      const storedUser = localStorage.getItem("bgmi_user");
      if (storedUser) {
        const user = JSON.parse(storedUser);

        if (user?.email) {
          allDeposits = allDeposits.filter((d) => {
            const sameUser =
              d?.email &&
              d.email.toLowerCase() === user.email.toLowerCase();

            const isVisible = d?.visible !== false; // visible false means hidden

            return sameUser && isVisible;
          });
        }
      } else {
        // If no user found -> show nothing
        allDeposits = [];
      }

      // Sort by date latest first
      allDeposits.sort((a, b) => new Date(b?.date) - new Date(a?.date));

      setDeposits(allDeposits);
    } catch (err) {
      console.error(err);
      setError("Failed to load deposit history");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDeposits();
  }, [loadDeposits]);

  /* =============================
     FILTER
  ============================= */
  const filteredDeposits = deposits.filter((d) => {
    if (filter === "all") return true;
    return d?.status === filter;
  });

  const getStatusCount = (status) =>
    deposits.filter((d) => d?.status === status).length;

  /* =============================
     REFRESH
  ============================= */
  const refreshHistory = () => {
    loadDeposits();
  };

  /* =============================
     LOADING
  ============================= */
  if (loading) {
    return (
      <div className="history-loading">
        🔄 Loading deposit history...
      </div>
    );
  }

  /* =============================
     ERROR
  ============================= */
  if (error) {
    return (
      <div className="history-page">
        <div className="empty-state">
          <h3>⚠️ {error}</h3>
          <button onClick={refreshHistory} className="add-money-btn">
            🔁 Retry
          </button>
        </div>
      </div>
    );
  }

  /* =============================
     UI
  ============================= */
  return (
    <div className="history-page">
      <div className="history-header">
        <div className="header-title">
          <h1>🧾 My Deposit History</h1>
          <div className="total-count">Total: {deposits.length} deposits</div>
        </div>

        <button onClick={refreshHistory} className="refresh-btn">
          ↻ Refresh
        </button>
      </div>

      {/* FILTER TABS */}
      <div className="filter-tabs">
        <button
          className={`filter-tab ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          All ({deposits.length})
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

      {/* LIST */}
      <div className="history-container">
        {filteredDeposits.length === 0 ? (
          <div className="empty-state">
            <div className="empty-wallet">💰</div>
            <h3>No {filter} deposits found</h3>
            <p style={{ color: "#666", margin: "10px 0" }}>
              💡 Admin may have cleaned history. Your balance is safe!
            </p>
            <button
              onClick={() => navigate("/deposit")}
              className="add-money-btn"
            >
              ➕ Add Money
            </button>
          </div>
        ) : (
          <div className="history-list">
            {filteredDeposits.map((d) => (
              <div key={d?.id || Math.random()} className="history-card">
                <div className="card-left">
                  <div className="amount-row">
                    <span className="amount">
                      ₹{Number(d?.amount || 0).toLocaleString()}
                    </span>
                    <span className={`status-dot ${d?.status || "pending"}`} />
                  </div>

                  <div className="details-row">
                    <span className="utr">UTR: {d?.utr || "—"}</span>
                    <span className="date">
                      {formatIndianTime(d?.dateIST || d?.date)}
                    </span>
                  </div>

                  <div className="user-info">👤 {d?.name || "Unknown"}</div>

                  <div className="deposit-id">
                    🆔 Deposit ID: <b>{(d?.id || "").slice(0, 8) || "—"}</b>
                  </div>
                </div>

                <div className={`status-badge-large ${d?.status || "pending"}`}>
                  {d?.status === "approved"
                    ? "✅ Approved"
                    : d?.status === "pending"
                    ? "⏳ Pending"
                    : "❌ Rejected"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DepositHistory;

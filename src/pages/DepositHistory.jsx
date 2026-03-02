import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./DepositHistory.css";

const DEPOSIT_API =
  window.location.hostname === "localhost"
    ? "http://localhost:5002"
    : "https://deposit-and-join-tournament-server.onrender.com";

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

  const loadDeposits = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${DEPOSIT_API}/api/deposits`);
      if (!res.ok) throw new Error("Server error");

      const data = await res.json();
      let allDeposits = Array.isArray(data?.deposits) ? data.deposits : [];

      const storedUser = localStorage.getItem("bgmi_user");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        if (user?.email) {
          allDeposits = allDeposits.filter(
            (d) =>
              d?.email?.toLowerCase() === user.email.toLowerCase() &&
              d?.visible !== false
          );
        }
      } else {
        allDeposits = [];
      }

      allDeposits.sort((a, b) => new Date(b?.date) - new Date(a?.date));
      setDeposits(allDeposits);
    } catch (err) {
      setError("Failed to load deposit history");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDeposits();
  }, [loadDeposits]);

  const filteredDeposits =
    filter === "all"
      ? deposits
      : deposits.filter((d) => d?.status === filter);

  const getStatusCount = (status) =>
    deposits.filter((d) => d?.status === status).length;

  if (loading) {
    return <div className="history-loading">🔄 Loading...</div>;
  }

  return (
    <div className="history-page">
      <div className="history-container">
        {/* HEADER */}
        <div className="history-header">
          <h1>🧾 My Deposit History</h1>
          <div className="total-count">
            Total: {deposits.length} deposits
          </div>
        </div>

        {/* FILTERS */}
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
        {filteredDeposits.length === 0 ? (
          <div className="empty-state">
            <div className="empty-wallet">💰</div>
            <h3>No deposits found</h3>
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
              <div key={d?.id} className="history-card">
                <div className="amount-status-row">
                  <span className="amount">
                    ₹{Number(d?.amount || 0).toLocaleString()}
                  </span>

                  <div className="status-section">
                    <span
                      className={`status-dot ${d?.status || "pending"}`}
                    />
                    <span
                      className={`status-badge-large ${d?.status || "pending"}`}
                    >
                      {d?.status === "approved"
                        ? "Approved"
                        : d?.status === "rejected"
                        ? "Rejected"
                        : "Pending"}
                    </span>
                  </div>
                </div>

                <div className="details-row">
                  <div className="deposit-id">
                    🆔 {(d?.id || "").slice(0, 8)}
                  </div>
                  <div className="date">
                    {formatIndianTime(d?.date)}
                  </div>
                </div>

                <div className="user-info">
                  👤 {d?.name || "Unknown"}
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
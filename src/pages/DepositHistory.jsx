import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./DepositHistory.css";

const DEPOSIT_API = "http://localhost:5002";

const DepositHistory = () => {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();

  const userData = JSON.parse(localStorage.getItem("bgmi_user") || "{}");
  const user = userData.user;
  const userId = user?.id;
  const profileId = user?.profile_id;

  console.log("✅ USER DATA:", { userId, profileId, user });

  useEffect(() => {
    const loadDeposits = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${DEPOSIT_API}/api/admin/deposits`);
        const data = await res.json();

        console.log("📥 ALL Backend deposits:", data.deposits);

        if (!userId && !profileId) {
          navigate("/login");
          return;
        }

        // 🔥 FIXED: BETTER FILTERING - Check multiple fields
        const myDeposits = data.deposits.filter((d) => {
          return (
            d.profileId === userId?.toString() || 
            d.profileId === profileId?.toString() ||
            d.profileId == userId ||
            d.profileId == profileId ||
            d.username === user?.name ||
            d.username === user?.username
          );
        });

        console.log("✅ MY deposits found:", myDeposits);
        setDeposits(myDeposits.reverse());
      } catch (err) {
        console.error("❌ Deposit load error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (userId || profileId) {
      loadDeposits();
    }
  }, [userId, profileId, navigate]);

  const filteredDeposits = deposits.filter((d) => {
    if (filter === "all") return true;
    return d.status === filter;
  });

  const getStatusCount = (status) => deposits.filter(d => d.status === status).length;

  if (loading) {
    return <div className="history-loading">🔄 Loading History...</div>;
  }

  return (
    <div className="history-page">
      <div className="history-header">
        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
        <div className="header-title">
          <h1>🧾 Deposit History</h1>
          <span className="total-count">{deposits.length} Transactions</span>
        </div>
      </div>

      <div className="filter-tabs">
        <button className={`filter-tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
          All ({deposits.length})
        </button>
        <button className={`filter-tab ${filter === 'approved' ? 'active' : ''}`} onClick={() => setFilter('approved')}>
          ✅ Approved ({getStatusCount('approved')})
        </button>
        <button className={`filter-tab ${filter === 'pending' ? 'active' : ''}`} onClick={() => setFilter('pending')}>
          ⏳ Pending ({getStatusCount('pending')})
        </button>
        <button className={`filter-tab ${filter === 'rejected' ? 'active' : ''}`} onClick={() => setFilter('rejected')}>
          ❌ Rejected ({getStatusCount('rejected')})
        </button>
      </div>

      <div className="history-container">
        {filteredDeposits.length === 0 ? (
          <div className="empty-state">
            <div className="empty-wallet">💰</div>
            <h3>No {filter} deposits</h3>
            <p>Make a deposit to see transactions</p>
          </div>
        ) : (
          <div className="history-list">
            {filteredDeposits.map((d) => (
              <div key={d.depositId} className="history-card">
                <div className="card-left">
                  <div className="amount-row">
                    <span className="amount">₹{d.amount}</span>
                    <span className={`status-dot ${d.status}`}></span>
                  </div>
                  <div className="details-row">
                    <span className="utr">UTR: {d.utr}</span>
                    {/* 🔥 FIXED DATE FORMAT */}
                    <span className="date">
                      {d.createdAt && d.createdAt !== 'Invalid Date' ? (
                        new Date(d.createdAt).toLocaleString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true
                        })
                      ) : (
                        'Just now'
                      )}
                    </span>
                  </div>
                </div>
                <div className={`status-badge-large ${d.status}`}>
                  <span className="badge-icon">
                    {d.status === "approved" ? "✅" : 
                     d.status === "pending" ? "⏳" : "❌"}
                  </span>
                  <span>{d.status.toUpperCase()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {deposits.length > 0 && (
        <div className="summary-bar">
          <div className="summary-item">
            <span>Approved: </span>
            <strong>₹{deposits.filter(d => d.status === 'approved').reduce((sum, d) => sum + Number(d.amount), 0)}</strong>
          </div>
          <div className="summary-item">
            <span>Total: </span>
            <strong>{deposits.length}</strong>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepositHistory;

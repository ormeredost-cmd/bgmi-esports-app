import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import "./Wallet.css";

// 🔥 API URLs
const USER_API = window.location.hostname === "localhost" 
  ? "http://localhost:5001"
  : "https://main-server-firebase.onrender.com";

const DEPOSIT_API = window.location.hostname === "localhost" 
  ? "http://localhost:5002"
  : "https://bgmi-server-save-tournament-data.onrender.com";

const Wallet = () => {
  const [balance, setBalance] = useState(0);
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Load user from localStorage
  useEffect(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("bgmi_user"));
      console.log("🔍 localStorage user:", storedUser);
      setUser(storedUser);
    } catch (err) {
      console.error("❌ localStorage parse error:", err);
      setUser(null);
    }
  }, []);

  // Load wallet balance
  const loadWalletBalance = useCallback(async () => {
    if (!user?.profile_id) {
      setBalance(0);
      return;
    }
    try {
      const res = await axios.get(`${USER_API}/api/my-balance?profileId=${user.profile_id}`);
      setBalance(res.data.balance || 0);
    } catch (err) {
      console.error("❌ Wallet balance error:", err);
      setBalance(0);
    }
  }, [user?.profile_id, USER_API]);

  // Load deposits
  const loadDeposits = useCallback(async () => {
    if (!user?.profile_id) {
      setDeposits([]);
      return;
    }
    try {
      const res = await axios.get(`${DEPOSIT_API}/api/deposits`);
      const myDeposits = res.data.deposits.filter(
        (d) => d.profile_id === user.profile_id
      );
      setDeposits(myDeposits.reverse());
    } catch (err) {
      console.error("❌ Deposits error:", err);
      setDeposits([]);
    }
  }, [user?.profile_id, DEPOSIT_API]);

  // Load everything when user loads
  useEffect(() => {
    if (!user?.profile_id) return;
    const loadWallet = async () => {
      setLoading(true);
      await Promise.all([loadWalletBalance(), loadDeposits()]);
      setLoading(false);
    };
    loadWallet();
  }, [user, loadWalletBalance, loadDeposits]);

  const refreshWallet = () => {
    loadWalletBalance();
    loadDeposits();
  };

  if (loading) {
    return (
      <div className="wallet-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading Wallet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="wallet-container">
      {/* HEADER */}
      <div className="wallet-header">
        <div className="header-left">
          <h1>💰 Wallet</h1>
          <p>Welcome back, <strong>{user?.username || 'Player'}</strong></p>
        </div>
        <button className="refresh-btn" onClick={refreshWallet}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M23 4v6h-2V7.07L14 12.57l-4.28-4.48L3 12V4h2v5.72l3-3.14 4.28 4.48L21 3.93V4h2Z" fill="currentColor"/>
            <path d="M21 20v-6h-2v2.93l-4-4.14-4.15 4.13L8 13.07V20H6v-6h2v2.93l3-3.14L13.22 20l4.15-4.13L21 17.07V20h2Z" fill="currentColor"/>
          </svg>
        </button>
      </div>

      {/* BALANCE CARD */}
      <div className="balance-card">
        <div className="balance-info">
          <p className="balance-label">Available Balance</p>
          <h1 className="balance-amount">₹{balance.toLocaleString()}</h1>
          <p className="profile-id">ID: {user?.profile_id}</p>
        </div>
        <div className="balance-actions">
          <button className="quick-action deposit-quick">➕ Add Money</button>
          <button className="quick-action withdraw-quick">➖ Withdraw</button>
        </div>
      </div>

      {/* STATS */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div>
            <p>Total Deposits</p>
            <strong>{deposits.filter(d => d.status === 'approved').reduce((sum, d) => sum + Number(d.amount), 0).toLocaleString()}</strong>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div>
            <p>Pending</p>
            <strong>{deposits.filter(d => d.status === 'pending').length}</strong>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div>
            <p>Approved</p>
            <strong>{deposits.filter(d => d.status === 'approved').length}</strong>
          </div>
        </div>
      </div>

      {/* TRANSACTIONS */}
      <div className="transactions-section">
        <div className="section-header">
          <h2>📋 Recent Transactions</h2>
          <span className="transaction-count">{deposits.length}</span>
        </div>
        
        {deposits.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💸</div>
            <h3>No transactions yet</h3>
            <p>Make your first deposit to see activity here</p>
            <button className="deposit-btn-large">➕ Deposit Now</button>
          </div>
        ) : (
          <div className="transactions-list">
            {deposits.slice(0, 5).map((deposit) => (
              <div key={deposit.id} className={`transaction-item ${deposit.status}`}>
                <div className="transaction-details">
                  <div className="transaction-header">
                    <span className="amount">₹{Number(deposit.amount).toLocaleString()}</span>
                    <span className={`status-badge ${deposit.status}`}>
                      {deposit.status === 'approved' ? 'Completed' : 'Pending'}
                    </span>
                  </div>
                  <div className="transaction-meta">
                    <span>{deposit.date_ist}</span>
                    <span className="utr">UTR: {deposit.utr?.slice(0, 8)}...</span>
                  </div>
                </div>
                <div className="transaction-icon">
                  {deposit.status === 'approved' ? '✅' : '⏳'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ACTION BUTTONS */}
      <div className="action-buttons">
        <button className="action-btn primary" onClick={() => window.location.href = "/deposit"}>
          ➕ Deposit Money
        </button>
        <button className="action-btn secondary" onClick={() => window.location.href = "/withdraw"}>
          ➖ Withdraw Money
        </button>
      </div>
    </div>
  );
};

export default Wallet;

import React, { useEffect, useState } from "react";
import "./Wallet.css";

// 🔥 DYNAMIC API URL - LOCAL + RENDER dono chalega!
const DEPOSIT_API = window.location.hostname === "localhost" 
  ? "http://localhost:5002"
  : "https://bgmi-server-save-tournament-data.onrender.com";

const Wallet = () => {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("bgmi_user"));

  useEffect(() => {
    const loadDeposits = async () => {
      try {
        const res = await fetch(`${DEPOSIT_API}/api/admin/deposits`);
        const data = await res.json();

        if (!user) return;

        const myDeposits = data.deposits.filter(
          (d) => d.profileId === user.profileId
        );

        setDeposits(myDeposits.reverse());
      } catch (err) {
        console.log("Wallet load error");
      } finally {
        setLoading(false);
      }
    };

    loadDeposits();
  }, []);

  const balance = deposits
    .filter((d) => d.status === "approved")
    .reduce((sum, d) => sum + Number(d.amount), 0);

  if (loading) {
    return <div className="wallet-loading">🔄 Loading Wallet...</div>;
  }

  return (
    <div className="wallet-page">
      <h2 className="wallet-title">💰 My Wallet</h2>

      {/* BALANCE CARD */}
      <div className="wallet-balance-card">
        <p className="wallet-balance-label">Available Balance</p>
        <h1 className="wallet-balance">₹{balance}</h1>
      </div>

      {/* ACTION BUTTONS */}
      <div className="wallet-actions">
        <button className="action-btn deposit-btn" onClick={() => window.location.href = "/deposit"}>
          ➕ Deposit
        </button>
        <button className="action-btn withdraw-btn" onClick={() => window.location.href = "/withdraw"}>
          ➖ Withdraw
        </button>
      </div>
    </div>
  );
};

export default Wallet;

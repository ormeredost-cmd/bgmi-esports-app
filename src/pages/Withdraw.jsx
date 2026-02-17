import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Withdraw.css";

const WITHDRAW_API = window.location.hostname === "localhost" 
  ? "http://localhost:5002"
  : "https://bgmi-server-save-tournament-data.onrender.com";

const Withdraw = () => {
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState("");
  const [phone, setPhone] = useState("");
  const [utr, setUtr] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Load user & balance
  useEffect(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("bgmi_user"));
      if (storedUser) {
        setUser(storedUser);
        loadBalance(storedUser.profile_id);
        setPhone(storedUser.phone || "");
      } else {
        navigate("/login");
      }
    } catch (err) {
      navigate("/login");
    }
  }, [navigate]);

  const loadBalance = async (profileId) => {
    try {
      const res = await axios.get(
        `https://main-server-firebase.onrender.com/api/my-balance?profileId=${profileId}`
      );
      setBalance(res.data.balance || 0);
    } catch (err) {
      console.error("Balance load error:", err);
      setBalance(0);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    
    // VALIDATIONS
    if (!amount || amount < 100) {
      setError("Minimum ₹100 withdraw kar sakte ho bhai!");
      return;
    }
    if (parseFloat(amount) > balance) {
      setError("Itna paise nahi hai wallet mein!");
      return;
    }
    if (!phone || phone.length !== 10) {
      setError("Valid 10 digit phone number daal!");
      return;
    }
    if (!utr || utr.length < 10) {
      setError("Valid UTR number daal bhai!");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const withdrawData = {
        profile_id: user.profile_id,
        amount: parseFloat(amount),
        phone,
        utr,
        status: "pending"
      };

      const res = await axios.post(`${WITHDRAW_API}/api/withdrawals`, withdrawData);
      
      if (res.data.success) {
        setSuccess(true);
        // Update wallet balance
        setBalance(balance - parseFloat(amount));
        setTimeout(() => navigate("/wallet"), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Withdraw fail ho gaya!");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="withdraw-container">
        <div className="success-screen">
          <div className="success-icon">✅</div>
          <h1>Withdraw Request Sent!</h1>
          <p>Admin 24hr mein process karega</p>
          <p className="amount-success">₹{amount}</p>
          <p>UTR: {utr}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="withdraw-container">
      <div className="withdraw-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h1>💸 Withdraw</h1>
        <div className="balance-display">
          Available: ₹{balance.toLocaleString()}
        </div>
      </div>

      <form className="withdraw-form" onSubmit={handleWithdraw}>
        <div className="form-group">
          <label>Amount (₹100 minimum)</label>
          <input
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="100"
            max={balance}
            required
          />
          <small>Max: ₹{balance.toLocaleString()}</small>
        </div>

        <div className="form-group">
          <label>Bank UPI Phone</label>
          <input
            type="tel"
            placeholder="9876543210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            maxLength={10}
            required
          />
        </div>

        <div className="form-group">
          <label>Bank UTR Number</label>
          <input
            type="text"
            placeholder="Enter UTR"
            value={utr}
            onChange={(e) => setUtr(e.target.value)}
            required
          />
          <small>Payment screenshot ke saath bhejna hoga</small>
        </div>

        {error && <div className="error-message">{error}</div>}

        <button 
          type="submit" 
          className="withdraw-btn"
          disabled={loading}
        >
          {loading ? "Processing..." : `Withdraw ₹${amount || 0}`}
        </button>
      </form>

      <div className="withdraw-info">
        <h3>ℹ️ Process:</h3>
        <ul>
          <li>1. UTR generate karo bank se</li>
          <li>2. Screenshot admin ko bhejo</li>
          <li>3. 24hr mein process hoga</li>
          <li>4. Min ₹100, Max full balance</li>
        </ul>
      </div>
    </div>
  );
};

export default Withdraw;

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Withdraw.css";

const WITHDRAW_API =
  window.location.hostname === "localhost"
    ? "http://localhost:5002"
    : "https://bgmi-server-save-tournament-data.onrender.com";

const BALANCE_API = "https://main-server-firebase.onrender.com";

const Withdraw = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState("");

  const [loadingBalance, setLoadingBalance] = useState(true);
  const [loadingWithdraw, setLoadingWithdraw] = useState(false);

  const [success, setSuccess] = useState(false);
  const [successAmount, setSuccessAmount] = useState(0);

  const [error, setError] = useState("");

  // ====== USER LOAD ======
  useEffect(() => {
    try {
      let stored = localStorage.getItem("bgmi_user");
      if (!stored) stored = sessionStorage.getItem("bgmi_user");

      if (!stored) {
        navigate("/login");
        return;
      }

      const parsed = JSON.parse(stored);
      if (!parsed?.profile_id) {
        navigate("/login");
        return;
      }

      setUser(parsed);
    } catch (err) {
      navigate("/login");
    }
  }, [navigate]);

  // ====== BALANCE LOAD ======
  useEffect(() => {
    if (!user?.profile_id) return;

    const loadBalance = async () => {
      try {
        setLoadingBalance(true);

        const res = await axios.get(
          `${BALANCE_API}/api/my-balance?profileId=${user.profile_id}`
        );

        setBalance(Number(res.data.balance || 0));
      } catch (err) {
        setBalance(0);
      } finally {
        setLoadingBalance(false);
      }
    };

    loadBalance();
  }, [user?.profile_id]);

  const numericAmount = useMemo(() => Number(amount || 0), [amount]);

  // ====== SUBMIT ======
  const handleWithdraw = async (e) => {
    e.preventDefault();
    setError("");

    // VALIDATION
    if (!amount || numericAmount < 100) {
      setError("Minimum ₹100 withdraw kar sakte ho bhai!");
      return;
    }

    if (numericAmount > balance) {
      setError("Itna paise nahi hai wallet mein!");
      return;
    }

    setLoadingWithdraw(true);

    try {
      const withdrawData = {
        profile_id: user.profile_id,
        amount: numericAmount,
        status: "pending",
        created_at: new Date().toISOString(),
      };

      const res = await axios.post(
        `${WITHDRAW_API}/api/withdrawals`,
        withdrawData
      );

      // ⭐ Real app feel (fake processing)
      await new Promise((r) => setTimeout(r, 1500));

      if (res.data?.success) {
        setSuccessAmount(numericAmount);
        setSuccess(true);

        // Update UI balance instantly
        setBalance((prev) => Math.max(0, prev - numericAmount));

        // Reset
        setAmount("");

        // Redirect after 2.5 sec
        setTimeout(() => navigate("/wallet"), 2500);
      } else {
        setError("Withdraw request fail ho gaya!");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Withdraw fail ho gaya!");
    } finally {
      setLoadingWithdraw(false);
    }
  };

  // ====== SUCCESS SCREEN ======
  if (success) {
    return (
      <div className="withdraw-container">
        <div className="success-card">
          <div className="success-glow"></div>

          <div className="success-icon">✅</div>
          <h1 className="success-title">Withdraw Request Sent!</h1>

          <p className="success-sub">
            Admin 24hr ke andar process karega
          </p>

          <div className="success-amount">
            ₹{Number(successAmount || 0).toLocaleString()}
          </div>

          <div className="success-status">
            ⏳ Status: <b>Pending</b>
          </div>

          <p className="success-note">Redirecting to wallet...</p>
        </div>
      </div>
    );
  }

  // ====== MAIN UI ======
  return (
    <div className="withdraw-container">
      <div className="withdraw-card">
        <div className="withdraw-header">
          <h1>💸 Withdraw</h1>

          <div className="balance-display">
            {loadingBalance ? (
              <span className="balance-loading">Loading balance...</span>
            ) : (
              <>
                Available: <b>₹{Number(balance || 0).toLocaleString()}</b>
              </>
            )}
          </div>
        </div>

        <form className="withdraw-form" onSubmit={handleWithdraw}>
          {/* ONLY AMOUNT */}
          <div className="form-group">
            <label>Withdraw Amount (₹100 minimum)</label>

            <input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="100"
              max={balance}
              required
              disabled={loadingWithdraw || loadingBalance}
            />

            <div className="hint-row">
              <small>Min: ₹100</small>
              <small>Max: ₹{Number(balance || 0).toLocaleString()}</small>
            </div>
          </div>

          {/* ERROR */}
          {error && <div className="error-message">⚠️ {error}</div>}

          {/* BUTTON */}
          <button
            type="submit"
            className="withdraw-btn"
            disabled={loadingWithdraw || loadingBalance}
          >
            {loadingWithdraw ? (
              <>
                <span className="btn-spinner"></span>
                Processing...
              </>
            ) : (
              `Withdraw ₹${numericAmount ? numericAmount : 0}`
            )}
          </button>
        </form>

        <div className="withdraw-info">
          <p>
            🔒 Withdraw request pending jayegi. Admin 24hr me process karega.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Withdraw;

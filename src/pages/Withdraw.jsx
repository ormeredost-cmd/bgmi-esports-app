import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Withdraw.css";

const BALANCE_API = "http://localhost:5002";
const WALLET_API = "http://localhost:5003";

const Withdraw = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState("");

  const [loadingBalance, setLoadingBalance] = useState(true);
  const [loadingWithdraw, setLoadingWithdraw] = useState(false);
  const [error, setError] = useState("");

  // ================= USER LOAD =================
  useEffect(() => {
    try {
      let stored =
        localStorage.getItem("bgmi_user") ||
        sessionStorage.getItem("bgmi_user");

      if (!stored) {
        navigate("/login");
        return;
      }

      const parsed = JSON.parse(stored);

      if (!parsed?.profile_id) {
        navigate("/login");
        return;
      }

      if (parsed.verified === false) {
        setError("Account verify nahi hai. Pehle verify karo.");
        return;
      }

      setUser(parsed);
    } catch {
      navigate("/login");
    }
  }, [navigate]);

  // ================= LOAD BALANCE =================
  const loadBalance = async (profileId) => {
    try {
      setLoadingBalance(true);

      const res = await axios.get(
        `${BALANCE_API}/api/my-balance?profileId=${profileId}`
      );

      setBalance(Number(res.data.balance || 0));
    } catch {
      setBalance(0);
    } finally {
      setLoadingBalance(false);
    }
  };

  useEffect(() => {
    if (user?.profile_id) {
      loadBalance(user.profile_id);
    }
  }, [user]);

  const numericAmount = useMemo(() => Number(amount || 0), [amount]);

  // ================= WITHDRAW =================
  const handleWithdraw = async (e) => {
    e.preventDefault();
    setError("");

    if (!user?.profile_id) {
      setError("Login required.");
      return;
    }

    if (numericAmount < 100) {
      setError("Minimum ₹100 withdraw allowed.");
      return;
    }

    if (numericAmount > balance) {
      setError("Insufficient balance.");
      return;
    }

    setLoadingWithdraw(true);

    try {
      const res = await axios.post(`${WALLET_API}/api/withdraw-request`, {
        profile_id: user.profile_id,
        amount: numericAmount,
      });

      if (res.data?.success) {
        // 🔥 TURANT BALANCE RELOAD (after backend minus)
        await loadBalance(user.profile_id);

        setAmount("");

        // Optional: small delay then redirect
        setTimeout(() => {
          navigate("/withdraw-history");
        }, 1000);
      } else {
        setError(res.data?.error || "Withdraw failed.");
      }
    } catch (err) {
      setError(
        err.response?.data?.error ||
        "Server error. Make sure 5003 wallet server running."
      );
    } finally {
      setLoadingWithdraw(false);
    }
  };

  const goToWithdrawHistory = () => {
    navigate("/withdraw-history");
  };

  // ================= UI =================
  return (
    <div className="withdraw-container">
      <div className="withdraw-card">
        <h1>💸 Withdraw</h1>

        <div className="balance-display">
          {loadingBalance
            ? "Loading..."
            : `Available: ₹${balance.toLocaleString()}`}
        </div>

        <form onSubmit={handleWithdraw}>
          <input
            type="number"
            placeholder="Enter amount (Min ₹100)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="100"
            max={balance}
            required
            disabled={loadingWithdraw || loadingBalance}
            className="amount-input"
          />

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            disabled={
              loadingWithdraw ||
              loadingBalance ||
              numericAmount < 100 ||
              numericAmount > balance
            }
            className="withdraw-submit-btn"
          >
            {loadingWithdraw
              ? "⏳ Processing..."
              : `Withdraw ₹${numericAmount.toLocaleString() || 0}`}
          </button>
        </form>

        <div className="history-section">
          <button
            className="history-btn"
            onClick={goToWithdrawHistory}
            disabled={loadingWithdraw || loadingBalance}
          >
            📜 View Withdraw History
          </button>
        </div>

        <div className="withdraw-info">
          <p>🔒 Balance will be deducted instantly</p>
          <p>💳 Admin approval required</p>
          <p>❌ Reject → Amount auto refund</p>
        </div>
      </div>
    </div>
  );
};

export default Withdraw;
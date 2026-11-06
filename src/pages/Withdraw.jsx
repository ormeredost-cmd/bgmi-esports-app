
import React, { useEffect, useMemo, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "./Withdraw.css";

// CONFETTI LIBRARY
import confetti from "canvas-confetti";

const BALANCE_API = window.location.hostname === "localhost"
  ? "http://localhost:5002"
  : "https://deposit-and-join-tournament-server.onrender.com";

const WALLET_API = window.location.hostname === "localhost"
  ? "http://localhost:5003"
  : "https://withdraw-server.onrender.com";

const Withdraw = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingWithdraw, setLoadingWithdraw] = useState(false);
  const [error, setError] = useState("");
  const [bankVerified, setBankVerified] = useState(false);

  // SUCCESS POPUP
  const [successData, setSuccessData] = useState(null);

  // ==========================================
  // CONFETTI BURST ANIMATION
  // ==========================================

  const launchConfetti = useCallback(() => {
    const duration = 2500;
    const end = Date.now() + duration;

    // Center burst
    confetti({
      particleCount: 120,
      spread: 100,
      startVelocity: 55,
      origin: { x: 0.5, y: 0.55 },
      colors: ["#ff1744", "#ffcc00", "#ffffff", "#ff5252", "#ffd700"],
      zIndex: 99999,
    });

    // Left and right party poppers
    confetti({
      particleCount: 65,
      angle: 60,
      spread: 75,
      origin: { x: 0, y: 0.65 },
      colors: ["#ff1744", "#ffd700", "#ffffff"],
      zIndex: 99999,
    });

    confetti({
      particleCount: 65,
      angle: 120,
      spread: 75,
      origin: { x: 1, y: 0.65 },
      colors: ["#ff1744", "#ffd700", "#ffffff"],
      zIndex: 99999,
    });

    // Falling confetti
    const interval = setInterval(() => {
      if (Date.now() > end) {
        clearInterval(interval);
        return;
      }

      confetti({
        particleCount: 5,
        startVelocity: 20,
        spread: 360,
        ticks: 70,
        origin: {
          x: Math.random(),
          y: Math.random() * 0.4,
        },
        colors: ["#ff1744", "#ffd700", "#ffffff", "#ff8c00"],
        zIndex: 99999,
      });
    }, 180);
  }, []);

  // ==========================================
  // INITIAL WITHDRAW SETUP
  // ==========================================

  const initWithdraw = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      console.log("🔍 Starting withdraw init...");

      let stored =
        localStorage.getItem("bgmi_user") ||
        sessionStorage.getItem("bgmi_user");

      if (!stored) {
        navigate("/login");
        return;
      }

      const parsed = JSON.parse(stored);

      console.log("✅ USER:", parsed.profile_id);

      setUser(parsed);

      if (!parsed?.profile_id) {
        navigate("/login");
        return;
      }

      // BANK CHECK
      const { data: bank, error: bankErr } = await supabase
        .from("user_bank_details")
        .select("is_verified, is_active")
        .eq("user_id", parsed.profile_id)
        .eq("is_active", true)
        .maybeSingle();

      console.log("🏦 BANK:", bank);

      if (bankErr) {
        console.error("❌ BANK ERROR:", bankErr.message);
        setError("Bank check failed");
        return;
      }

      if (!bank?.is_verified || !bank?.is_active) {
        setBankVerified(false);
        setError("🚫 BANK NOT VERIFIED! Add bank details first.");
        return;
      }

      setBankVerified(true);

      // SUPABASE BALANCE
      const { data: userBalance, error: balanceErr } = await supabase
        .from("registeruser")
        .select("balance")
        .eq("profile_id", parsed.profile_id)
        .single();

      console.log("📊 SUPABASE BALANCE:", userBalance);

      if (userBalance && !balanceErr) {
        setBalance(Number(userBalance.balance || 0));
      } else {
        // FALLBACK SERVER
        try {
          const res = await axios.get(
            `${BALANCE_API}/api/my-balance?profileId=${parsed.profile_id}`,
            { timeout: 5000 }
          );

          setBalance(Number(res.data.balance || 0));
        } catch (serverErr) {
          console.error("❌ BALANCE SERVER FAILED:", serverErr.message);
          setBalance(0);
        }
      }

    } catch (err) {
      console.error("❌ TOTAL FAIL:", err);
      setError("Setup failed: " + err.message);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    initWithdraw();
  }, [initWithdraw]);

  const numericAmount = useMemo(
    () => Number(amount || 0),
    [amount]
  );

  // ==========================================
  // WITHDRAW REQUEST
  // ==========================================

  const handleWithdraw = async (e) => {
    e.preventDefault();

    if (!bankVerified) {
      alert("🚫 Pehle bank verify karo!");
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
    setError("");

    try {
      console.log("💸 SENDING WITHDRAW:", {
        profile_id: user.profile_id,
        amount: numericAmount,
      });

      const res = await axios.post(
        `${WALLET_API}/api/withdraw-request`,
        {
          profile_id: user.profile_id,
          amount: numericAmount,
        },
        { timeout: 10000 }
      );

      console.log("✅ WITHDRAW RESPONSE:", res.data);

      if (res.data?.success) {
        // SUCCESS DATA
        setSuccessData({
          amount: numericAmount,
          withdrawId: res.data.withdraw_id,
        });

        // PARTY POPPER ANIMATION
        launchConfetti();

        // Clear input
        setAmount("");

        // Refresh balance
        await initWithdraw();

        // Redirect after success animation
        setTimeout(() => {
          navigate("/withdraw-history");
        }, 3500);

      } else {
        setError(res.data?.error || "Withdraw failed.");
      }

    } catch (err) {
      console.error("❌ WITHDRAW ERROR:", err.response?.data);

      const errorData = err.response?.data;

      if (errorData?.needBank) {
        alert("❌ BANK ADD KARO!\n👉 Bank Details → Save");
        navigate("/bank-details");
      } else {
        setError(errorData?.error || "Server error (5003 down?)");
      }

    } finally {
      setLoadingWithdraw(false);
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="withdraw-container" style={{
        padding: "50px",
        textAlign: "center"
      }}>
        <div style={{ fontSize: "24px" }}>
          ⏳ Loading balance & bank...
        </div>
      </div>
    );
  }

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="withdraw-container">

      <div className="withdraw-card">

        <h1>💸 Withdraw</h1>

        {/* BANK STATUS */}
        <div
          className="bank-status"
          style={{
            padding: "15px",
            marginBottom: "20px",
            borderRadius: "10px",
            background: bankVerified ? "#d4edda" : "#f8d7da",
          }}
        >
          <strong>
            🏦 Bank Status:{" "}
            {bankVerified ? "✅ VERIFIED & READY!" : "🚫 NOT VERIFIED"}
          </strong>

          {!bankVerified && (
            <button
              onClick={() => navigate("/bank-details")}
              className="bank-link-btn"
              style={{ marginLeft: "10px", padding: "8px 16px" }}
            >
              ➕ Add Bank Details
            </button>
          )}
        </div>

        {/* BALANCE */}
        <div
          className="balance-display"
          style={{
            fontSize: "28px",
            fontWeight: "bold",
            color: "#28a745",
            marginBottom: "25px",
            padding: "20px",
            background: "#f8f9fa",
            borderRadius: "15px",
          }}
        >
          💰 Available Balance:{" "}
          <span style={{ color: "#dc3545", fontSize: "32px" }}>
            ₹{balance.toLocaleString("en-IN")}
          </span>
        </div>

        {/* WITHDRAW FORM */}
        <form onSubmit={handleWithdraw}>

          <input
            type="number"
            placeholder="Enter amount (Min ₹100)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="100"
            max={balance}
            step="1"
            className="amount-input"
            disabled={!bankVerified || loadingWithdraw || !!successData}
            style={{
              width: "100%",
              padding: "20px",
              fontSize: "24px",
              borderRadius: "12px",
              border: "2px solid #ddd",
              marginBottom: "15px",
            }}
          />

          {error && (
            <div
              className="error-message"
              style={{
                color: "#dc3545",
                padding: "12px",
                background: "#f8d7da",
                borderRadius: "8px",
                marginBottom: "15px",
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={
              !bankVerified ||
              loadingWithdraw ||
              !!successData ||
              numericAmount < 100 ||
              numericAmount > balance
            }
            className="withdraw-submit-btn"
            style={{
              width: "100%",
              padding: "20px",
              fontSize: "22px",
              background:
                bankVerified && !loadingWithdraw ? "#28a745" : "#ccc",
              color: "white",
              border: "none",
              borderRadius: "15px",
              fontWeight: "bold",
            }}
          >
            {loadingWithdraw
              ? "⏳ Processing Withdraw..."
              : `💸 Withdraw ₹${numericAmount.toLocaleString("en-IN") || 0}`}
          </button>

        </form>

        {/* HISTORY BUTTON */}
        <div style={{ marginTop: "25px" }}>
          <button
            onClick={() => navigate("/withdraw-history")}
            className="history-btn"
            disabled={loadingWithdraw}
            style={{
              width: "100%",
              padding: "15px",
              background: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "12px",
              fontSize: "18px",
            }}
          >
            📜 View Withdraw History
          </button>
        </div>

      </div>

      {/* =====================================
          SUCCESS ANIMATION POPUP
      ===================================== */}

      {successData && (
        <div className="withdraw-success-overlay">

          <div className="withdraw-success-box">

            <div className="withdraw-success-icon">
              🎉
            </div>

            <h2>Withdrawal Request Submitted!</h2>

            <div className="withdraw-success-amount">
              ₹{successData.amount.toLocaleString("en-IN")}
            </div>

            <p>
              Your withdrawal request has been submitted successfully.
            </p>

            <div className="withdraw-success-id">
              Request ID: {successData.withdrawId || "Generated"}
            </div>

            <div className="withdraw-success-note">
              Redirecting to Withdraw History...
            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default Withdraw;

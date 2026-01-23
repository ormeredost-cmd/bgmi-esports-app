import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./DepositQR.css";

// 🔥 AUTO DETECT - Local + 2 Render Servers
const DEPOSIT_API =
  window.location.hostname === "localhost"
    ? "http://localhost:5001"
    : "https://main-server-firebase.onrender.com";

export default function DepositQR() {
  const location = useLocation();
  const navigate = useNavigate();

  const [amount, setAmount] = useState(0);
  const [email, setEmail] = useState("");
  const [utr, setUtr] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  /* =============================
     LOAD AMOUNT + USER EMAIL
  ============================= */
  useEffect(() => {
    // ✅ Amount check
    if (!location.state?.amount) {
      navigate("/deposit");
      return;
    }

    setAmount(location.state.amount);

    // ✅ Load user from localStorage
    try {
      const stored = localStorage.getItem("bgmi_user");
      if (!stored) {
        alert("Please login first");
        navigate("/login");
        return;
      }

      const parsed = JSON.parse(stored);

      // ✅ ALL POSSIBLE EMAIL PATHS
      const userEmail =
        parsed.user?.email ||
        parsed.email ||
        parsed.userEmail;

      if (!userEmail) {
        alert("User email missing. Please login again.");
        localStorage.removeItem("bgmi_user");
        navigate("/login");
        return;
      }

      setEmail(userEmail);
      console.log("👤 Deposit user email:", userEmail);

    } catch (err) {
      console.error("❌ localStorage parse error:", err);
      navigate("/login");
    }
  }, [location.state, navigate]);

  /* =============================
     SUBMIT DEPOSIT
  ============================= */
  const handleSubmit = async () => {
    if (!utr || utr.length !== 12) {
      alert("Please enter valid 12-digit UTR");
      return;
    }

    if (!email) {
      alert("User email missing. Login again.");
      navigate("/login");
      return;
    }

    setLoading(true);

    try {
      const depositData = {
        email,                 // ✅ ONLY EMAIL (BACKEND MATCH)
        amount: Number(amount),
        utr: utr.trim()
      };

      console.log("📤 Sending deposit:", depositData);

      const response = await fetch(`${DEPOSIT_API}/api/deposit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(depositData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Deposit failed");
      }

      console.log("✅ Deposit success:", result);

      setSuccess(true);
      setLoading(false);

      setTimeout(() => {
        navigate("/deposit-history");
      }, 2000);

    } catch (error) {
      console.error("❌ Deposit error:", error);
      alert("Deposit failed: " + error.message);
      setLoading(false);
    }
  };

  /* =============================
     SUCCESS SCREEN
  ============================= */
  if (success) {
    return (
      <div className="qr-success">
        <div className="success-icon">✅</div>
        <h2>Deposit Request Created!</h2>
        <p>₹{amount} — Pending admin approval</p>
        <p>UTR: {utr}</p>
        <div className="loading-spinner">Redirecting...</div>
      </div>
    );
  }

  /* =============================
     MAIN UI
  ============================= */
  return (
    <div className="qr-page">
      <h2 className="qr-title">Pay ₹{amount}</h2>
      <p className="qr-subtitle">Enter UTR after UPI payment</p>

      <div className="qr-container">
        <img
          src="/qr-payment.png"
          alt="QR Code"
          className="qr-image"
        />
        <p className="qr-info">
          UPI ID: yourapp@paytm <br />
          Amount: ₹{amount}
        </p>
      </div>

      <div className="utr-section">
        <label>Enter UTR (12 digits)</label>
        <input
          type="text"
          value={utr}
          maxLength={12}
          placeholder="123456789012"
          onChange={(e) => setUtr(e.target.value.replace(/\D/g, ""))}
          disabled={loading}
        />
      </div>

      <button
        className="submit-btn"
        disabled={loading || utr.length !== 12}
        onClick={handleSubmit}
      >
        {loading ? "Processing..." : "Confirm & Submit"}
      </button>
    </div>
  );
}

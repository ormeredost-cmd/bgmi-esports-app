import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./DepositQR.css";

const DEPOSIT_API =
  window.location.hostname === "localhost"
    ? "http://localhost:5002"
    : "https://bgmi-server-save-tournament-data.onrender.com";

export default function DepositQR() {
  const location = useLocation();
  const navigate = useNavigate();

  const [amount, setAmount] = useState(0);
  const [email, setEmail] = useState("");
  const [profileId, setProfileId] = useState("");
  const [username, setUsername] = useState("");  // 🔥 ADDED USERNAME STATE
  const [utr, setUtr] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  /* =============================
     LOAD AMOUNT + REAL USER DATA (BGMI-8547)
  ============================= */
  useEffect(() => {
    if (!location.state?.amount) {
      navigate("/deposit");
      return;
    }

    setAmount(Number(location.state.amount));

    try {
      const stored = localStorage.getItem("bgmi_user");
      if (!stored) {
        alert("Please login first");
        navigate("/login");
        return;
      }

      const parsed = JSON.parse(stored);
      console.log("👤 FULL USER DATA:", parsed);

      // 🔥 REAL DATA ONLY - NO FALLBACKS!
      const userEmail = parsed?.email || parsed?.user?.email;
      const realProfileId = parsed?.profile_id;        // BGMI-8547 ONLY!
      const realUsername = parsed?.username;           // kajal ONLY!

      if (!userEmail || !realProfileId) {
        alert("User data missing. Login again.");
        localStorage.removeItem("bgmi_user");
        navigate("/login");
        return;
      }

      setEmail(userEmail.toLowerCase().trim());
      setProfileId(realProfileId);                    // BGMI-8547
      setUsername(realUsername || "");                // kajal

      console.log("✅ REAL DATA SET:", {
        email: userEmail,
        profileId: realProfileId,     // BGMI-8547 ✅
        username: realUsername        // kajal ✅
      });

    } catch (err) {
      console.error("❌ localStorage error:", err);
      navigate("/login");
    }
  }, [location.state, navigate]);

  /* =============================
     SUBMIT DEPOSIT WITH REAL DATA
  ============================= */
  const handleSubmit = async () => {
    if (utr.length !== 12) {
      alert("Enter valid 12 digit UTR");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        profileId: profileId,         // BGMI-8547
        username: username,           // kajal 🔥
        email: email,
        amount: Number(amount),
        utr: utr.trim()
      };

      console.log("📤 Deposit payload:", payload);

      const response = await fetch(`${DEPOSIT_API}/api/deposit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Deposit failed");
      }

      console.log("✅ Deposit success:", data);
      setSuccess(true);

      setTimeout(() => {
        navigate("/deposit-history");
      }, 2000);

    } catch (err) {
      console.error("❌ Deposit error:", err);
      alert(err.message);
    } finally {
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
        <h2>Deposit Request Created</h2>
        <p>₹{amount} — Pending approval</p>
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
        <img src="/qr-payment.png" alt="QR" className="qr-image" />
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

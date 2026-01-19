import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./DepositQR.css";

const DEPOSIT_API = "http://localhost:5002";

export default function DepositQR() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [amount, setAmount] = useState(0);
  const [user, setUser] = useState(null);
  const [utr, setUtr] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Get data from previous page
  useEffect(() => {
    if (location.state?.amount && location.state?.user) {
      setAmount(location.state.amount);
      setUser(location.state.user);
      console.log("👤 User received:", location.state.user);
    } else {
      navigate("/deposit");
    }
  }, [location.state, navigate]);

  const handleSubmit = async () => {
    if (!utr.trim()) {
      alert("Please enter UTR number");
      return;
    }

    setLoading(true);

    try {
      // 🔥 FIXED: Clear profile ID logic + EMAIL
      const actualUser = user.user || user;
      const profileId = actualUser.id;                    // ✅ 1768648818820 (numeric ID)
      const bgmiDisplayId = actualUser.profile_id || actualUser.profileId;  // ✅ BGMI-C0V5W
      const userName = actualUser.name || actualUser.username || "Unknown";
      const userEmail = actualUser.email || "-";           // 🔥 NEW EMAIL FIELD

      console.log("🔍 Profile Info:", { profileId, bgmiDisplayId, userName, userEmail });

      const depositData = {
        profileId: profileId,           // ✅ Numeric ID only (1768648818820)
        bgmiDisplayId: bgmiDisplayId,   // ✅ BGMI display ID (BGMI-C0V5W)
        username: userName,
        email: userEmail,               // 🔥 NEW EMAIL FIELD ✅
        amount: amount,
        utr: utr.trim(),
        timestamp: new Date().toISOString()
      };

      console.log("📤 Sending deposit:", depositData);

      const response = await fetch(`${DEPOSIT_API}/api/deposit`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(depositData)
      });

      const result = await response.json();
      
      if (!response.ok) {
        console.error("❌ Backend error:", result);
        throw new Error(result.message || "Deposit creation failed");
      }

      console.log("✅ Deposit created:", result);
      setLoading(false);
      setSuccess(true);
      
      setTimeout(() => {
        navigate("/deposit-history");
      }, 2000);

    } catch (error) {
      setLoading(false);
      console.error("❌ Deposit error:", error);
      alert("Deposit failed: " + error.message);
    }
  };

  if (success) {
    return (
      <div className="qr-success">
        <div className="success-icon">✅</div>
        <h2>Deposit Request Created!</h2>
        <p>₹{amount} - Pending admin approval</p>
        <p>UTR: {utr}</p>
        <div className="loading-spinner">Redirecting to History...</div>
      </div>
    );
  }

  return (
    <div className="qr-page">
      <h2 className="qr-title">Pay ₹{amount}</h2>
      <p className="qr-subtitle">Enter UTR after UPI payment</p>

      {/* QR Code Section */}
      <div className="qr-container">
        <div className="qr-wrapper">
          <img 
            src="/qr-payment.png" 
            alt="Payment QR Code" 
            className="qr-image"
          />
          <p className="qr-info">
            UPI ID: yourapp@paytm<br/>
            Amount: ₹{amount}
          </p>
        </div>
      </div>

      {/* UTR Input Section */}
      <div className="utr-section">
        <label className="utr-label">Enter UTR Number (12 digits)</label>
        <input
          type="text"
          className="utr-input"
          placeholder="123456789012"
          value={utr}
          onChange={(e) => setUtr(e.target.value)}
          maxLength={12}
          disabled={loading}
        />
      </div>

      {/* Submit Button */}
      <button
        className={`submit-btn ${!utr.trim() ? 'disabled' : ''}`}
        disabled={!utr.trim() || loading}
        onClick={handleSubmit}
      >
        {loading ? (
          <>
            <span className="spinner"></span>
            Processing...
          </>
        ) : (
          "Confirm & Submit"
        )}
      </button>

      <div className="back-link"></div>
    </div>
  );
}

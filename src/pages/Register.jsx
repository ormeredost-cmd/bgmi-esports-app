import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Register.css";

// 🔥 LOCAL + RENDER - Dono Perfect!
const API_BASE = window.location.hostname === 'localhost' 
  ? "http://localhost:5003"
  : "https://npm-start-7vdr.onrender.com";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    gamerTag: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("form");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!formData.gamerTag.trim()) return setError("Enter gamer tag");
    if (!formData.email.trim()) return setError("Enter email");
    if (formData.password !== formData.confirmPassword) return setError("Passwords don't match");

    try {
      setLoading(true);
      console.log("📤 Sending OTP to:", `${API_BASE}/auth/send-otp`);
      
      const res = await fetch(`${API_BASE}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email.toLowerCase().trim() }),
      });

      const data = await res.json();
      console.log("📨 Response:", data);
      
      if (!res.ok || !data.success) throw new Error(data.error || "OTP failed");

      setMessage("✅ OTP sent! Check Gmail inbox/spam");
      setStep("otp");
    } catch (err) {
      console.error("❌ Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");

    if (!otp.trim()) return setError("Enter OTP");

    try {
      setLoading(true);
      console.log("🔍 Verifying OTP:", `${API_BASE}/auth/verify-otp`);
      
      const res = await fetch(`${API_BASE}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.gamerTag.trim(),
          email: formData.email.toLowerCase().trim(),
          password: formData.password,
          code: otp.trim(),
        }),
      });

      const data = await res.json();
      console.log("✅ Register response:", data);
      
      if (!res.ok || !data.success) throw new Error(data.error || "Invalid OTP");

      localStorage.setItem("bgmi_user", JSON.stringify(data));
      setMessage("✅ Account created! Redirecting...");
      setTimeout(() => navigate("/", { replace: true }), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Rest of your JSX remains SAME...
  return (
    <div className="auth-screen register-screen">
      <div className="auth-bg-gradient" />
      <div className="auth-card">
        <h1 className="auth-heading">Register</h1>
        
        {error && <div className="auth-alert auth-alert-error">{error}</div>}
        {message && <div className="auth-alert auth-alert-success">{message}</div>}

        {step === "form" ? (
          <form className="auth-form" onSubmit={handleRegister}>
            <label className="auth-field">
              <span className="auth-label">Gamer Tag</span>
              <input type="text" name="gamerTag" placeholder="Soul Goblin" 
                     value={formData.gamerTag} onChange={handleChange} required />
            </label>

            <label className="auth-field">
              <span className="auth-label">Email</span>
              <input type="email" name="email" placeholder="player@bgmi.gg" 
                     value={formData.email} onChange={handleChange} required />
            </label>

            <div className="auth-grid-2">
              <label className="auth-field">
                <span className="auth-label">Password</span>
                <input type="password" name="password" placeholder="Password" 
                       value={formData.password} onChange={handleChange} required />
              </label>
              <label className="auth-field">
                <span className="auth-label">Confirm</span>
                <input type="password" name="confirmPassword" placeholder="Confirm" 
                       value={formData.confirmPassword} onChange={handleChange} required />
              </label>
            </div>

            <button className="auth-btn-primary" disabled={loading}>
              {loading ? "SENDING OTP..." : "SEND OTP"}
            </button>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleVerifyOtp}>
            <label className="auth-field">
              <span className="auth-label">Enter OTP (Check Gmail)</span>
              <input type="text" maxLength={6} placeholder="123456" 
                     value={otp} onChange={(e) => setOtp(e.target.value)} required />
            </label>
            <button className="auth-btn-primary" disabled={loading}>
              {loading ? "VERIFYING..." : "VERIFY & REGISTER"}
            </button>
          </form>
        )}

        <div className="auth-footer-row">
          <Link to="/login" className="auth-link">Already have account? Login</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;

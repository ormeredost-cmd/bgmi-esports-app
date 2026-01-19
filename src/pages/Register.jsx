// src/pages/Register.jsx - ✅ FINAL STABLE (LOCAL + RENDER)
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Register.css";

/* ===============================
   API BASE
   Local  : http://localhost:5001
   Render : https://server-otp-register-api.onrender.com
================================ */
const API_BASE =
  process.env.NODE_ENV === "production"
    ? (process.env.REACT_APP_OTP_API ||
        "https://server-otp-register-api.onrender.com")
    : "http://localhost:5001";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    gamerTag: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("form"); // form | otp
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  /* ===============================
     STEP 1: SEND OTP
  ================================ */
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!formData.gamerTag.trim())
      return setError("Please enter your in-game name");

    if (!formData.email.trim())
      return setError("Please enter email");

    if (formData.password !== formData.confirmPassword)
      return setError("Passwords do not match");

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email.toLowerCase().trim(),
        }),
      });

      const text = await res.text();
      let data = {};
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Server error");
      }

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to send OTP");
      }

      setMessage("OTP sent successfully. Check your email.");
      setStep("otp");
    } catch (err) {
      console.error("SEND OTP ERROR:", err);
      setError(err.message || "OTP sending failed");
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
     STEP 2: VERIFY OTP & REGISTER
  ================================ */
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!otp.trim()) return setError("Please enter OTP");

    try {
      setLoading(true);

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

      const text = await res.text();
      let data = {};
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Server error");
      }

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Invalid OTP");
      }

      localStorage.setItem(
        "bgmi_user",
        JSON.stringify({ user: data.user, token: data.token })
      );

      setMessage("Account created successfully!");
      setTimeout(() => navigate("/", { replace: true }), 800);
    } catch (err) {
      console.error("VERIFY OTP ERROR:", err);
      setError(err.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen register-screen">
      <div className="auth-bg-gradient" />
      <div className="auth-card">
        <h1 className="auth-heading">Register</h1>

        {error && <div className="auth-alert auth-alert-error">{error}</div>}
        {message && (
          <div className="auth-alert auth-alert-success">{message}</div>
        )}

        {step === "form" ? (
          <form className="auth-form" onSubmit={handleRegister}>
            <label className="auth-field">
              <span className="auth-label">In-game name</span>
              <input
                type="text"
                name="gamerTag"
                placeholder="Soul Goblin"
                value={formData.gamerTag}
                onChange={handleChange}
                required
              />
            </label>

            <label className="auth-field">
              <span className="auth-label">Email</span>
              <input
                type="email"
                name="email"
                autoComplete="email"
                placeholder="player@bgmi.gg"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </label>

            <div className="auth-grid-2">
              <label className="auth-field">
                <span className="auth-label">Password</span>
                <input
                  type="password"
                  name="password"
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </label>

              <label className="auth-field">
                <span className="auth-label">Confirm</span>
                <input
                  type="password"
                  name="confirmPassword"
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </label>
            </div>

            <button className="auth-btn-primary" disabled={loading}>
              {loading ? "SENDING OTP..." : "REGISTER"}
            </button>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleVerifyOtp}>
            <label className="auth-field">
              <span className="auth-label">Enter OTP</span>
              <input
                type="text"
                maxLength={6}
                placeholder="6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
            </label>

            <button className="auth-btn-primary" disabled={loading}>
              {loading ? "VERIFYING..." : "VERIFY & CREATE ACCOUNT"}
            </button>
          </form>
        )}

        <div className="auth-footer-row">
          <span>
            <h3>Already registered?</h3>
          </span>
          <Link to="/login" className="auth-link">
            <h3>Login</h3>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;

import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import "./Register.css";

const isLocalhost =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1" ||
  window.location.hostname === "[::1]";

const API_URL = isLocalhost
  ? "http://localhost:5001"
  : import.meta.env.VITE_API_URL || "https://user-register-server.onrender.com";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!username || !email || !password || !confirmPassword) {
      setError("❌ Sab fields bharo!");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("❌ Passwords match nahi kar rahe!");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("🔒 Password 6+ characters ka hona chahiye!");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        username: username.trim(),
        email: email.toLowerCase().trim(),
        password: password.trim(),
      };

      const res = await fetch(`${API_URL}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Registration failed");
      }

      const now = new Date();
      const istTime =
        now.toLocaleDateString("en-GB", { timeZone: "Asia/Kolkata" }) +
        " " +
        now.toLocaleTimeString("en-IN", {
          timeZone: "Asia/Kolkata",
          hour12: true,
        });

      await supabase.from("registeruser").insert([
        {
          profile_id: data.user?.profile_id || "",
          username: username.trim(),
          email: email.toLowerCase().trim(),
          verified: data.user?.verified ?? false,
          balance: data.user?.balance || 0,
          token: data.user?.token || "",
          register_time_ist: istTime,
        },
      ]);

      sessionStorage.setItem("auto_login_email", email.toLowerCase().trim());
      sessionStorage.setItem("auto_login_password", password.trim());

      if (data.requiresVerification) {
        setSuccess(
          "✅ Account created! Verification link email par bhej diya gaya hai."
        );
        window.location.href = "/login?verify=1";
      } else {
        setSuccess("✅ Account created successfully!");
        window.location.href = "/login?registered=1";
      }
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-wrapper">
      <div className="register-container">
        <h2 className="register-title">Free Fire Register</h2>
        <p className="register-subtitle">Create your gaming account</p>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleRegister}>
          <div className="input-group">
            <input
              className="input-field"
              type="text"
              placeholder="🎮 Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <input
              className="input-field"
              type="email"
              placeholder="📧 Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <input
              className="input-field"
              type="password"
              placeholder="🔒 Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <input
              className="input-field"
              type="password"
              placeholder="🔐 Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button className="register-button" type="submit" disabled={loading}>
            {loading ? "Creating..." : "🔥 Create Account"}
          </button>
        </form>

        <div className="login-link">
          Already registered?{" "}
          <a href="/login" className="login-btn">
            Login
          </a>
        </div>
      </div>
    </div>
  );
};

export default Register;
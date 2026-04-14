import React, { useState, useEffect } from "react";
import "./Login.css";

const isLocalhost =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1" ||
  window.location.hostname === "[::1]";

const API_URL = isLocalhost
  ? "http://localhost:5001"
  : import.meta.env.VITE_API_URL || "https://user-register-server.onrender.com";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showRegisteredMsg, setShowRegisteredMsg] = useState(false);

  useEffect(() => {
    const savedEmail = sessionStorage.getItem("auto_login_email");
    const savedPassword = sessionStorage.getItem("auto_login_password");
    const urlParams = new URLSearchParams(window.location.search);
    const registeredParam = urlParams.get("registered");

    if (savedEmail) setEmail(savedEmail);
    if (savedPassword) setPassword(savedPassword);

    if (registeredParam === "1") {
      setShowRegisteredMsg(true);
      setTimeout(() => setShowRegisteredMsg(false), 5000);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const loginRes = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          password: password.trim(),
        }),
      });

      const serverData = await loginRes.json();

      if (!loginRes.ok || !serverData.success) {
        throw new Error(serverData.error || "❌ Login failed!");
      }

      const freshUser = serverData.user;

      const userData = {
        id: freshUser.id,
        username: freshUser.username,
        email: freshUser.email,
        profile_id: freshUser.profile_id,
        verified: true,
        balance: freshUser.balance || 0,
        backend_token: freshUser.token || "",
      };

      localStorage.setItem("bgmi_user", JSON.stringify(userData));

      sessionStorage.removeItem("auto_login_email");
      sessionStorage.removeItem("auto_login_password");

      window.location.href = "/profile";
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "❌ Login failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-container">
        <div className="login-header">
          <div className="bgmi-logo">🔐</div>
          <h2 className="login-title">Free Fire Login</h2>
        </div>

        {showRegisteredMsg && (
          <div className="success-message">
            ✅ Account created successfully! Ab login karo.
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleLogin} className="login-form">
          <div className="input-group">
            <input
              type="email"
              placeholder="📧 Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input-field"
              autoComplete="email"
            />
          </div>

          <div className="input-group">
            <input
              type="password"
              placeholder="🔒 Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="input-field"
              autoComplete="current-password"
            />
          </div>

          <button type="submit" disabled={loading} className="login-button">
            {loading ? "Logging In..." : "🚀 Login"}
          </button>
        </form>

        <div className="login-footer">
          <p className="register-link">
            New player?{" "}
            <a href="/register" className="register-btn">
              Register Now
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
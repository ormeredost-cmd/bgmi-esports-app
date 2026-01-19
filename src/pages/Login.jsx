// src/pages/Login.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

/* ===============================
   AUTH SERVER BASE URL
================================ */
const API_BASE = "http://localhost:5001";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /* ===============================
     LOGIN SUBMIT
  ================================ */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email.trim() || !formData.password) {
      return setError("Please enter email and password");
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email.toLowerCase(),
          password: formData.password,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Invalid email or password");
      }

      // ✅ SAVE USER + TOKEN (SAME STRUCTURE AS REGISTER)
      localStorage.setItem(
        "bgmi_user",
        JSON.stringify({
          user: data.user,
          token: data.token,
        })
      );

      navigate("/", { replace: true });
    } catch (err) {
      console.error("LOGIN ERROR:", err);
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-bg-gradient" />

      <div className="auth-card">
        <h1 className="auth-heading">Login</h1>

        {error && (
          <div className="auth-alert auth-alert-error">{error}</div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-field">
            <span className="auth-label">Email</span>
            <input
              type="email"
              name="email"
              placeholder="player@bgmi.gg"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </label>

          <label className="auth-field">
            <span className="auth-label">Password</span>
            <input
              type="password"
              name="password"
              placeholder="Enter password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </label>

          <button
            type="submit"
            className="auth-btn-primary"
            disabled={loading}
          >
            {loading ? "LOGIN..." : "LOGIN"}
          </button>
        </form>

        <div className="auth-footer-row">
          <span>
            <h3>Create New Account</h3>
          </span>
          <Link to="/register" className="auth-link">
            <h3>Create Account</h3>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;

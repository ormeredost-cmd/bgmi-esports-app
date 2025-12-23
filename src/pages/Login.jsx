import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      alert("Please enter email and password");
      return;
    }

    const fakeUser = {
      email: formData.email,
      createdAt: new Date().toISOString(),
    };

    // Navbar / ProtectedRoute ke liye same key
    localStorage.setItem("bgmi_user", JSON.stringify(fakeUser));

    navigate("/", { replace: true });
  };

  return (
    <div className="auth-screen">
      {/* background glow */}
      <div className="auth-bg-gradient" />

      {/* main card */}
      <div className="auth-card">
        <div className="auth-logo-row">
          <div className="auth-logo-circle">BG</div>
          <span className="auth-logo-title">BGMI ESPORTS HUB</span>
        </div>

        <h1 className="auth-heading">Welcome back</h1>
        <p className="auth-subtitle">
          Login to manage your custom BGMI tournaments, rooms and stats.
        </p>

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

          <button type="submit" className="auth-btn-primary">
            ENTER LOBBY
          </button>
        </form>

        <button type="button" className="auth-btn-secondary">
          Continue with Google
        </button>

        <div className="auth-footer-row">
          <span>New player?</span>
          <Link to="/register" className="auth-link">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;

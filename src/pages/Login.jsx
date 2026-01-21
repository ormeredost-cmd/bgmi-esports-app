import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

// 🔥 LOCAL + RENDER - Dono Perfect!
const API_BASE = window.location.hostname === 'localhost' 
  ? "http://localhost:5003"
  : "https://npm-start-7vdr.onrender.com";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);
      console.log("🔐 Login to:", `${API_BASE}/auth/login`);
      
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      console.log("✅ Login response:", data);
      
      if (!res.ok || !data.success) throw new Error(data.error || "Login failed");

      localStorage.setItem("bgmi_user", JSON.stringify(data));
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-bg-gradient" />
      <div className="auth-card">
        <h1 className="auth-heading">Login</h1>
        {error && <div className="auth-alert auth-alert-error">{error}</div>}
        
        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-field">
            <span className="auth-label">Email</span>
            <input type="email" name="email" placeholder="player@bgmi.gg" 
                   value={formData.email} onChange={handleChange} required />
          </label>
          <label className="auth-field">
            <span className="auth-label">Password</span>
            <input type="password" name="password" placeholder="Password" 
                   value={formData.password} onChange={handleChange} required />
          </label>
          <button className="auth-btn-primary" disabled={loading}>
            {loading ? "LOGIN..." : "LOGIN"}
          </button>
        </form>
        
        <div className="auth-footer-row">
          <Link to="/register" className="auth-link">Create Account</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;

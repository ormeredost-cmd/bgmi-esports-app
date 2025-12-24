// src/pages/Login.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

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

    if (!formData.email || !formData.password) {
      setError("Please enter email and password");
      return;
    }

    try {
      setLoading(true);

      // Firebase Auth login
      const userCred = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      ); // [web:397]

      const user = userCred.user;

      if (!user.emailVerified) {
        setError("Please verify your email before entering the lobby.");
        setLoading(false);
        return;
      }

      // Optional: localStorage me basic user info save (ProtectedRoute / navbar ke लिए)
      const safeUser = {
        uid: user.uid,
        email: user.email,
        createdAt: user.metadata?.creationTime || new Date().toISOString(),
      };
      localStorage.setItem("bgmi_user", JSON.stringify(safeUser));

      navigate("/", { replace: true });
    } catch (err) {
      console.error("Login error:", err);
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-bg-gradient" />

      <div className="auth-card">
        <div className="auth-logo-row">
          <div className="auth-logo-circle">BG</div>
          <span className="auth-logo-title">BGMI ESPORTS HUB</span>
        </div>

        <h1 className="auth-heading">Welcome back</h1>
        <p className="auth-subtitle">
          Login to manage your custom BGMI tournaments, rooms and stats.
        </p>

        {error && <div className="auth-alert auth-alert-error">{error}</div>}

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
            {loading ? "ENTERING..." : "ENTER LOBBY"}
          </button>
        </form>

        <button type="button" className="auth-btn-secondary" disabled>
          Continue with Google (coming soon)
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

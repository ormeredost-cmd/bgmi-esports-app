// src/pages/Register.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Register.css";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { auth } from "../firebase";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    gamerTag: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

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

    if (!formData.gamerTag.trim()) {
      setError("Please enter your in‑game name");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      // Firebase me user create
      const userCred = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      ); // [web:397]

      // Email verification link bhejo
      await sendEmailVerification(userCred.user); // [web:406]

      setMessage(
        "Account created! Check your email for verification link, then login to lobby."
      );

      // Optional: in‑game name ko Firestore me save karna ho to baad me add kar sakte ho

      // Thoda delay ke baad login pe bhej do
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1500);
    } catch (err) {
      console.error("Register error:", err);
      setError(err.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen register-screen">
      <div className="auth-bg-gradient" />

      <div className="auth-card">
        <div className="auth-logo-row">
          <div className="auth-logo-circle">BG</div>
          <span className="auth-logo-title">BGMI ESPORTS HUB</span>
        </div>

        <h1 className="auth-heading">Create your account</h1>
        <p className="auth-subtitle">
          Save your squads, scrims and tournament history in one profile.
        </p>

        {error && <div className="auth-alert auth-alert-error">{error}</div>}
        {message && (
          <div className="auth-alert auth-alert-success">{message}</div>
        )}

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
                placeholder="Create password"
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
                placeholder="Repeat password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </label>
          </div>

          <button
            type="submit"
            className="auth-btn-primary"
            disabled={loading}
          >
            {loading ? "CREATING..." : "CREATE ACCOUNT"}
          </button>
        </form>

        <div className="auth-footer-row">
          <span>Already registered?</span>
          <Link to="/login" className="auth-link">
            Login to lobby
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;

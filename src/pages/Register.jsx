import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Register.css";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    gamerTag: "",
    email: "",
    bgmiId: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const fakeUser = {
      gamerTag: formData.gamerTag,
      email: formData.email,
      bgmiId: formData.bgmiId,
      createdAt: new Date().toISOString(),
    };

    // same key as Navbar / Login
    localStorage.setItem("bgmi_user", JSON.stringify(fakeUser));

    navigate("/", { replace: true });
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

        <form className="auth-form" onSubmit={handleSubmit}>
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

          <label className="auth-field">
            <span className="auth-label">BGMI ID</span>
            <input
              type="text"
              name="bgmiId"
              placeholder="1234567890"
              value={formData.bgmiId}
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

          <button type="submit" className="auth-btn-primary">
            CREATE ACCOUNT
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

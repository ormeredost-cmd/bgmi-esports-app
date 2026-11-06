import React, { useState } from "react";
import "./Register.css";

const isLocalhost =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1" ||
  window.location.hostname === "[::1]";

const API_URL = isLocalhost
  ? "http://localhost:5001"
  : import.meta.env.VITE_API_URL ||
    "https://user-register-server.onrender.com";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ==========================================
  // REGISTER
  // ==========================================

  const handleRegister = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    if (
      !username ||
      !email ||
      !password ||
      !confirmPassword
    ) {
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
      setError(
        "The password should be 6 digits long ⚠️"
      );
      setLoading(false);
      return;
    }

    try {
      const cleanEmail = email.toLowerCase().trim();

      const payload = {
        username: username.trim(),
        email: cleanEmail,
        password: password.trim(),
      };

      const res = await fetch(`${API_URL}/api/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(
          data.error || "Registration failed"
        );
      }

      setOtpSent(true);

      setSuccess(
        `✅ OTP sent to ${cleanEmail}. Email check karo.`
      );
    } catch (err) {
      setError(
        err.message || "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // VERIFY OTP
  // ==========================================

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setOtpLoading(true);

    if (!otp || otp.length !== 6) {
      setError("❌ 6-digit OTP enter karo!");
      setOtpLoading(false);
      return;
    }

    try {
      const res = await fetch(
        `${API_URL}/api/verify-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.toLowerCase().trim(),
            otp: otp.trim(),
          }),
        }
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(
          data.error || "OTP verification failed"
        );
      }

      // Save logged-in user
      const freshUser = data.user;

      const userData = {
        id: freshUser.id,
        username: freshUser.username,
        email: freshUser.email,
        profile_id: freshUser.profile_id,
        verified: true,
        balance: freshUser.balance || 0,
        backend_token: freshUser.token || "",
      };

      localStorage.setItem(
        "bgmi_user",
        JSON.stringify(userData)
      );

      setSuccess(
        "✅ Email verified successfully! Redirecting..."
      );

      setTimeout(() => {
        window.location.href = "/profile";
      }, 1000);
    } catch (err) {
      setError(
        err.message || "OTP verification failed"
      );
    } finally {
      setOtpLoading(false);
    }
  };

  // ==========================================
  // RESEND OTP
  // ==========================================

  const handleResendOtp = async () => {
    setError("");
    setSuccess("");
    setResendLoading(true);

    try {
      const res = await fetch(
        `${API_URL}/api/resend-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.toLowerCase().trim(),
          }),
        }
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(
          data.error || "Could not resend OTP"
        );
      }

      setOtp("");

      setSuccess(
        "✅ New OTP email par bhej diya gaya hai."
      );
    } catch (err) {
      setError(
        err.message || "Could not resend OTP"
      );
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="register-wrapper">
      <div className="register-container">

        {!otpSent ? (
          <>
            <h2 className="register-title">
              BGMI Register
            </h2>

            <p className="register-subtitle">
              Create your gaming account
            </p>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            {success && (
              <div className="success-message">
                {success}
              </div>
            )}

            <form onSubmit={handleRegister}>

              <div className="input-group">
                <input
                  className="input-field"
                  type="text"
                  placeholder="🎮 Username"
                  value={username}
                  onChange={(e) =>
                    setUsername(e.target.value)
                  }
                  required
                />
              </div>

              <div className="input-group">
                <input
                  className="input-field"
                  type="email"
                  placeholder="📧 Email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  required
                />
              </div>

              <div className="input-group">
                <input
                  className="input-field"
                  type="password"
                  placeholder="🔒 Password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  required
                />
              </div>

              <div className="input-group">
                <input
                  className="input-field"
                  type="password"
                  placeholder="🔐 Confirm Password"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(
                      e.target.value
                    )
                  }
                  required
                />
              </div>

              <button
                className="register-button"
                type="submit"
                disabled={loading}
              >
                {loading
                  ? "Sending OTP..."
                  : "🔥 Create Account"}
              </button>
            </form>

            <div className="login-link">
              Already registered?{" "}
              <a
                href="/login"
                className="login-btn"
              >
                Login
              </a>
            </div>
          </>
        ) : (
          <>
            <h2 className="register-title">
              Verify Email
            </h2>

            <p className="register-subtitle">
              OTP sent to
              <br />
              <strong>
                {email.toLowerCase().trim()}
              </strong>
            </p>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            {success && (
              <div className="success-message">
                {success}
              </div>
            )}

            <form onSubmit={handleVerifyOtp}>

              <div className="input-group">
                <input
                  className="input-field"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="🔢 Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) =>
                    setOtp(
                      e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 6)
                    )
                  }
                  required
                />
              </div>

              <button
                className="register-button"
                type="submit"
                disabled={otpLoading}
              >
                {otpLoading
                  ? "Verifying..."
                  : "✅ Verify Email"}
              </button>
            </form>

            <button
              type="button"
              className="login-btn"
              onClick={handleResendOtp}
              disabled={resendLoading}
              style={{
                marginTop: "15px",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              {resendLoading
                ? "Sending..."
                : "🔄 Resend OTP"}
            </button>

            <div className="login-link">
              Wrong email?{" "}
              <button
                type="button"
                onClick={() => {
                  setOtpSent(false);
                  setOtp("");
                  setError("");
                  setSuccess("");
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "inherit",
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                Go Back
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default Register;
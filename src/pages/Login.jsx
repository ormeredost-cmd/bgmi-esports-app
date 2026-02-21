import React, { useState, useEffect } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showVerifyMsg, setShowVerifyMsg] = useState(false);

  // 🔥 AUTO FILL FROM REGISTER + CHECK URL PARAM
  useEffect(() => {
    const savedEmail = sessionStorage.getItem("auto_login_email");
    const savedPassword = sessionStorage.getItem("auto_login_password");
    const urlParams = new URLSearchParams(window.location.search);
    const verifyParam = urlParams.get("verify");

    if (savedEmail && savedPassword) {
      setEmail(savedEmail);
      setPassword(savedPassword);
    }

    // 🔥 SHOW VERIFICATION MESSAGE
    if (verifyParam === "1") {
      setShowVerifyMsg(true);
      setTimeout(() => setShowVerifyMsg(false), 8000); // Hide after 8s
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1️⃣ Firebase Login
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      if (!userCredential.user.emailVerified) {
        setError("⚠️ Pehle email verify karo (Inbox / Spam check)");
        setLoading(false);
        return;
      }

      const firebaseEmail = userCredential.user.email;

      // 2️⃣ Backend Login
      const loginRes = await fetch(
        "https://user-register-server.onrender.com",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: firebaseEmail.toLowerCase().trim(),
          }),
        }
      );

      const serverData = await loginRes.json();
      if (!serverData.success) {
        throw new Error("User not found in system");
      }

      const freshUser = serverData.user;

      const userData = {
        uid: userCredential.user.uid,
        username: freshUser.username,
        email: firebaseEmail,
        profile_id: freshUser.profile_id,
        verified: true,
        balance: freshUser.balance || 0,
        backend_token: freshUser.token,
      };

      localStorage.setItem("bgmi_user", JSON.stringify(userData));

      // 🔥 CLEAR TEMP AUTO LOGIN DATA
      sessionStorage.removeItem("auto_login_email");
      sessionStorage.removeItem("auto_login_password");

      window.location.href = "/profile";

    } catch (err) {
      if (err.code === "auth/user-not-found") {
        setError("👤 User nahi mila! Pehle register karo.");
      } else if (err.code === "auth/wrong-password") {
        setError("🔒 Galat password!");
      } else if (err.code === "auth/invalid-email") {
        setError("📧 Invalid email!");
      } else {
        setError("❌ Login failed!");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-container">
        <div className="login-header">
          <div className="bgmi-logo">🔐</div>
          <h2 className="login-title">BGMI Login</h2>
        </div>

        {/* 🔥 NEW VERIFICATION MESSAGE */}
        {showVerifyMsg && (
          <div className="success-message">
            ✅ Email verification link bhej diya! Inbox/Spam folder check karo 🚀
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
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="login-button"
          >
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

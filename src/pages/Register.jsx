import React, { useState } from "react";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { auth } from "../firebase";
import { supabase } from "../supabaseClient";
import "./Register.css";

// 🔥 PRODUCTION READY
const API_URL =
  import.meta.env.VITE_API_URL || "https://main-server-firebase.onrender.com";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (password !== confirmPassword) {
      setError("❌ Passwords match nahi kar rahe!");
      setLoading(false);
      return;
    }

    if (!username || !email || !password || !confirmPassword) {
      setError("❌ Sab fields bharo!");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("🔒 Password 6+ characters ka hona chahiye!");
      setLoading(false);
      return;
    }

    try {
      // 1️⃣ Firebase Auth - FASTER (parallel calls)
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      
      // 🔥 PARALLEL CALLS - Backend + Email verification together
      const [verificationPromise, serverPromise] = await Promise.allSettled([
        sendEmailVerification(userCredential.user),
        fetch(`${API_URL}/api/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email.toLowerCase().trim(),
            username: username.trim(),
            password: password.trim(),
            uid: userCredential.user.uid,
          }),
        }).then(res => res.json())
      ]);

      const serverData = serverPromise.status === 'fulfilled' ? serverPromise.value : null;
      if (!serverData?.success) throw new Error(serverData?.error || "Server error");

      // 2️⃣ IST Time
      const now = new Date();
      const istTime =
        now.toLocaleDateString("en-GB", { timeZone: "Asia/Kolkata" }) +
        " " +
        now.toLocaleTimeString("en-IN", {
          timeZone: "Asia/Kolkata",
          hour12: true,
        });

      // 3️⃣ Supabase backup
      await supabase.from("registeruser").insert([
        {
          uid: userCredential.user.uid,
          profile_id: serverData.user.profile_id,
          username: username.trim(),
          email: email.toLowerCase().trim(),
          "User Password": password.trim(),
          verified: false,
          balance: serverData.user.balance || 0,
          token: serverData.user.token || "",
          register_time_ist: istTime,
        },
      ]);

      // 🔥 4️⃣ PROFILE DATA → localStorage (TOURNAMENT JOIN KE LIYE!)
      localStorage.setItem("profileId", serverData.user.profile_id);      // ✅ NEW!
      localStorage.setItem("profileName", username.trim());               // ✅ NEW!

      // 🔥 5️⃣ AUTO LOGIN DATA (TEMP – TAB BAND HOTE HI DELETE)
      sessionStorage.setItem("auto_login_email", email);
      sessionStorage.setItem("auto_login_password", password);

      // 🔥 6️⃣ INSTANT REDIRECT - No waiting
      window.location.href = "/login?verify=1";

    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-wrapper">
      <div className="register-container">
        <h2 className="register-title">BGMI Register</h2>
        <p className="register-subtitle">Create your gaming account</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleRegister}>
          <div className="input-group">
            <input
              className="input-field"
              type="text"
              placeholder="🎮 Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="input-group">
            <input
              className="input-field"
              type="email"
              placeholder="📧 Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="input-group">
            <input
              className="input-field"
              type="password"
              placeholder="🔒 Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="input-group">
            <input
              className="input-field"
              type="password"
              placeholder="🔐 Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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

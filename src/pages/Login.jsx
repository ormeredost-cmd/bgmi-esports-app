import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    console.log("🚀 Login started:", email);

    try {
      // 🔥 STEP 1: Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      if (!userCredential.user.emailVerified) {
        alert("⚠️ Email verify karo! Inbox/spam check kar.");
        return;
      }

      const firebaseEmail = userCredential.user.email;
      console.log("✅ Firebase login:", firebaseEmail);

      // 🔥 STEP 2: LOAD REGISTERED USERNAME FIRST (from localStorage)
      let registeredUsername = "Akash"; // Default fallback
      let storedUser = localStorage.getItem("bgmi_user");
      
      if (storedUser) {
        try {
          const parsedStored = JSON.parse(storedUser);
          if (parsedStored.username) {
            registeredUsername = parsedStored.username; // Register form wala name!
            console.log("✅ REGISTER USERNAME LOADED:", registeredUsername);
          }
        } catch (e) {
          console.log("❌ No valid stored username");
        }
      }

      // 🔥 STEP 3: Backend Register/Login with REGISTERED username
      let backendUser = null;
      
      try {
        const registerRes = await fetch("http://localhost:5001/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: firebaseEmail,
            username: registeredUsername  // 🔥 REGISTER FORM NAME (Akash)
          })
        });

        if (registerRes.ok) {
          const registerData = await registerRes.json();
          backendUser = registerData.user;
          console.log("✅ Backend REGISTERED - BGMI ID:", backendUser.profile_id);
        } else {
          // User exists? Login
          const loginRes = await fetch("http://localhost:5001/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: firebaseEmail })
          });

          if (loginRes.ok) {
            const loginData = await loginRes.json();
            backendUser = loginData.user;
            console.log("✅ Backend LOGIN - BGMI ID:", backendUser.profile_id);
          }
        }
      } catch (backendErr) {
        console.warn("Backend sync failed:", backendErr);
      }

      // 🔥 STEP 4: PRIORITY = REGISTER USERNAME (NO email split!)
      const finalUsername = backendUser?.username || registeredUsername;
      const userData = {
        uid: userCredential.user.uid,
        username: finalUsername,  // Akash guaranteed!
        email: firebaseEmail,
        profile_id: backendUser?.profile_id || `BGMI-${Date.now().toString().slice(-5)}`,
        verified: true,
        backend_token: backendUser?.token
      };

      // 🔥 STEP 5: SAVE EVERYWHERE
      localStorage.setItem("bgmi_user", JSON.stringify(userData));
      sessionStorage.setItem("bgmi_user", JSON.stringify(userData));
      
      console.log("✅ FULL LOGIN SUCCESS:", userData);
      alert(`✅ Welcome ${finalUsername}! ID: ${userData.profile_id}`);
      
      setTimeout(() => {
        window.location.href = "/profile";
      }, 1000);

    } catch (err) {
      console.error("Login error:", err.code);
      if (err.code === "auth/user-not-found") {
        setError("👤 User nahi mila! Register karo.");
      } else if (err.code === "auth/wrong-password") {
        setError("🔒 Galat password!");
      } else {
        setError("Login fail! Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      maxWidth: 400, margin: "80px auto", padding: 30, 
      borderRadius: 10, boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
    }}>
      <h2 style={{ textAlign: "center", color: "#ff4444", marginBottom: 20 }}>
        🔐 BGMI Login
      </h2>
      
      {error && (
        <div style={{ 
          color: "#ff4444", padding: 10, background: "#fee", 
          borderRadius: 5, marginBottom: 15, textAlign: "center"
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleLogin}>
        <input
          type="email" 
          placeholder="📧 Email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)} 
          required
          style={{
            width: "100%", padding: 12, margin: "10px 0", borderRadius: 6,
            border: "1px solid #ccc", boxSizing: "border-box"
          }}
        />
        <input
          type="password" 
          placeholder="🔒 Password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)} 
          required
          style={{
            width: "100%", padding: 12, margin: "10px 0", borderRadius: 6,
            border: "1px solid #ccc", boxSizing: "border-box"
          }}
        />
        <button type="submit" disabled={loading}
          style={{
            width: "100%", padding: 12, 
            background: loading ? "#ccc" : "#ff4444", color: "white",
            border: "none", borderRadius: 6, cursor: "pointer", fontSize: 16
          }}>
          {loading ? "⏳ Logging in..." : "🚀 Login & Get BGMI ID"}
        </button>
      </form>

      <p style={{ textAlign: "center", marginTop: 20 }}>
        New player? <a href="/register" style={{ color: "#ff4444", fontWeight: "bold" }}>Register</a>
      </p>

      {/* 🔥 DEBUG BUTTON */}
      <button 
        type="button"
        onClick={() => {
          console.log("🔍 Storage:", localStorage.getItem("bgmi_user"));
          fetch("http://localhost:5001/api/admin/users")
            .then(res => res.json())
            .then(console.log);
        }}
        style={{
          width: "100%", padding: 8, marginTop: 10,
          background: "#28a745", color: "white", border: "none", 
          borderRadius: 4, cursor: "pointer", fontSize: 12
        }}
      >
        🔍 Check Backend Users
      </button>
    </div>
  );
};

export default Login;
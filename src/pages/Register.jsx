import React, { useState } from "react";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { auth } from "../firebase";
import { supabase } from "../supabaseClient";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!username.trim() || !email.trim() || !password.trim()) {
      setError("❌ Sab fields bharo!");
      setLoading(false);
      return;
    }

    try {
      // 1. Firebase Auth ✅
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCredential.user);
      console.log("✅ Firebase UID:", userCredential.user.uid);

      // 2. Server BGMI ID ✅ (ALREADY WORKING!)
      const serverRes = await fetch("http://localhost:5001/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: email.toLowerCase().trim(),
          username: username.trim(),
          password: password.trim(),
          uid: userCredential.user.uid  // UID passed ✅
        }),
      });

      const serverData = await serverRes.json();
      console.log("✅ Server:", serverData);
      
      if (!serverData.success) {
        throw new Error(serverData.error || "Server failed");
      }

      // 3. IST Time
      const now = new Date();
      const istTime = now.toLocaleDateString('en-GB', { 
        timeZone: 'Asia/Kolkata', day: '2-digit', month: '2-digit', year: 'numeric'
      }) + ' ' + now.toLocaleTimeString('en-IN', { 
        timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true 
      });

      // 4. Frontend Supabase (FIXED - No .catch chain!)
      const { error: supabaseError } = await supabase
        .from("registeruser")
        .insert([{
          uid: userCredential.user.uid,
          profile_id: serverData.user.profile_id,
          username: username.trim(),
          email: email.toLowerCase().trim(),
          "User Password": password.trim(),
          verified: false,
          balance: serverData.user.balance || 0,
          token: serverData.user.token || "",
          register_time_ist: istTime
        }]);

      // 5. SUCCESS - Server already saved data!
      localStorage.setItem("bgmi_user", JSON.stringify({
        uid: userCredential.user.uid,
        username: username.trim(),
        email: email.toLowerCase().trim(),
        profile_id: serverData.user.profile_id,
        verified: false,
        balance: 0
      }));

      console.log("🎉 FULL SUCCESS:", serverData.user.profile_id);
      alert(`✅ Account Ready! ID: ${serverData.user.profile_id}\nTime: ${istTime}`);
      setTimeout(() => window.location.href = "/login", 2000);

    } catch (err) {
      console.error("❌ Register error:", err);
      if (err.code === "auth/email-already-in-use") {
        setError("👤 Email already registered!");
      } else if (err.code === "auth/weak-password") {
        setError("🔒 Password 6+ chars ka karo!");
      } else {
        setError(err.message || "Registration failed!");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "80px auto", padding: 30, borderRadius: 10, boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}>
      <h2 style={{ textAlign: "center", color: "#ff4444", marginBottom: 20 }}>📝 BGMI Register</h2>
      
      {error && (
        <div style={{ color: "#ff4444", padding: 10, background: "#fee", borderRadius: 5, marginBottom: 15 }}>
          {error}
        </div>
      )}

      <form onSubmit={handleRegister}>
        <input 
          type="text" 
          placeholder="🎮 Username (admin123)" 
          value={username} 
          onChange={(e) => setUsername(e.target.value)} 
          required 
          style={{ width: "100%", padding: 12, margin: "10px 0", borderRadius: 6, border: "1px solid #ccc", boxSizing: "border-box" }} 
        />
        <input 
          type="email" 
          placeholder="📧 Email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
          style={{ width: "100%", padding: 12, margin: "10px 0", borderRadius: 6, border: "1px solid #ccc", boxSizing: "border-box" }} 
        />
        <input 
          type="password" 
          placeholder="🔒 Password (6+ chars)" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
          minLength={6}
          style={{ width: "100%", padding: 12, margin: "10px 0", borderRadius: 6, border: "1px solid #ccc", boxSizing: "border-box" }} 
        />
        <button 
          type="submit" 
          disabled={loading}
          style={{ width: "100%", padding: 12, background: loading ? "#ccc" : "#ff4444", color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 16 }}
        >
          {loading ? "⏳ Creating..." : "🔥 Register"}
        </button>
      </form>

      <p style={{ textAlign: "center", marginTop: 20 }}>
        Already registered? <a href="/login" style={{ color: "#ff4444", fontWeight: "bold" }}>Login</a>
      </p>
    </div>
  );
};

export default Register;

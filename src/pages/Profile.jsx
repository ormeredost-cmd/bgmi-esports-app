import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "./Profile.css";

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("stats");
  const [deposits, setDeposits] = useState([]);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        console.log("🔍 Profile loading...");
        
        let userData = localStorage.getItem("bgmi_user");
        if (!userData) userData = sessionStorage.getItem("bgmi_user");

        if (!userData) {
          console.log("❌ No user data - redirect");
          navigate("/login");
          return;
        }

        const parsedUser = JSON.parse(userData);
        console.log("🔍 OLD LocalStorage ID:", parsedUser.profile_id); // BGMI-73471 ❌

        // 🔥 SERVER SE FRESH DATA LO (BGMI-8534)
        console.log("🔄 Fetching FRESH data from SERVER...");
        const serverRes = await fetch("https://main-server-firebase.onrender.com/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: parsedUser.email })
        });

        const serverData = await serverRes.json();
        console.log("🔍 SERVER RESPONSE:", serverData);

        if (serverData.success) {
          // 🔥 SERVER KA FRESH DATA USE KARO
          const freshUser = serverData.user;
          console.log("✅ FRESH Server ID:", freshUser.profile_id); // BGMI-8534 ✅
          
          // LocalStorage bhi update kar do
          localStorage.setItem("bgmi_user", JSON.stringify(freshUser));

          const profileData = {
            id: freshUser.profile_id,        // BGMI-8534 ✅
            name: freshUser.username,        // Akash ✅
            stats: {
              kdRatio: "5.2", winRate: "42%", totalMatches: "567",
              chickenDinners: "156", totalKills: "3248", avgDamage: "289",
            },
          };

          setProfile(profileData);
          console.log("✅ Profile set with FRESH ID:", freshUser.profile_id);
        } else {
          // Fallback (agar server fail ho)
          console.log("⚠️ Server fail - using LocalStorage");
          const profileData = {
            id: parsedUser.profile_id || 'BGMI-Loading...',
            name: parsedUser.username,
            stats: {
              kdRatio: "5.2", winRate: "42%", totalMatches: "567",
              chickenDinners: "156", totalKills: "3248", avgDamage: "289",
            },
          };
          setProfile(profileData);
        }

        setLoading(false);

      } catch (error) {
        console.error("🚨 Profile error:", error);
        console.log("⚠️ Using LocalStorage fallback");
        
        // Fallback to local data
        const userData = localStorage.getItem("bgmi_user") || sessionStorage.getItem("bgmi_user");
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setProfile({
            id: parsedUser.profile_id || 'BGMI-Loading...',
            name: parsedUser.username || 'User',
            stats: {
              kdRatio: "5.2", winRate: "42%", totalMatches: "567",
              chickenDinners: "156", totalKills: "3248", avgDamage: "289",
            },
          });
        }
        setLoading(false);
      }
    };

    loadProfile();
  }, [navigate]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', justifyContent: 'center', alignItems: 'center', 
        height: '100vh', flexDirection: 'column', gap: 20
      }}>
        <div style={{ fontSize: '24px', color: '#ff4444' }}>🔄 Loading Profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', color: 'red' }}>
        ❌ No profile data. <a href="/login">Go to Login</a>
      </div>
    );
  }

  const walletBalance = deposits
    .filter(d => d.status === "approved")
    .reduce((sum, d) => sum + Number(d.amount || 0), 0);

  return (
    <div className="esports-profile">
      <header className="profile-header">
        <div className="player-card">
          <div className="avatar-circle">
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=1e40af&color=fff&size=512`}
              alt="Avatar"
            />
          </div>
          <div className="player-details">
            <h1 className="gamer-name">{profile.name}</h1>
            <div className="id-row">
              <span>ID:</span> <strong>{profile.id}</strong> {/* BGMI-8534 ✅ */}
            </div>
          </div>
        </div>
      </header>

      <div className="profile-tabs">
        <button 
          className={activeTab === "stats" ? "active" : ""}
          onClick={() => setActiveTab("stats")}
        >
          📊 Stats
        </button>
        <button 
          className={activeTab === "wallet" ? "active" : ""}
          onClick={() => setActiveTab("wallet")}
        >
          💰 Wallet (₹{walletBalance.toLocaleString()})
        </button>
      </div>

      {activeTab === "stats" && (
        <section className="stats-section">
          <div className="stats-grid">
            {Object.entries(profile.stats).map(([key, value]) => (
              <div key={key} className="stat-box">
                <div className="stat-value">{value}</div>
                <div>{key.replace(/([A-Z])/g, " $1")}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {activeTab === "wallet" && (
        <section className="stats-section">
          <div className="stats-grid">
            <div className="stat-box">
              <div className="stat-value">₹{walletBalance.toLocaleString()}</div>
              <div>✅ Approved Balance</div>
            </div>
            <div className="stat-box">
              <div className="stat-value">{deposits.length}</div>
              <div>Total Deposits</div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Profile;

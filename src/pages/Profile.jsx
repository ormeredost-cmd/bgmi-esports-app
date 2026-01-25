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
        console.log("🔍 FULL USER DATA:", parsedUser);

        // 🔥 REGISTER TIME WALA USERNAME ONLY (NO email split!)
        const username = parsedUser.username;
        
        if (!username) {
          console.error("❌ No username found in storage:", parsedUser);
          navigate("/login");
          return;
        }

        console.log("✅ REGISTERED USERNAME:", username); // Akash NOT jolaxos917
        console.log("✅ BGMI PROFILE ID:", parsedUser.profile_id);

        const profileData = {
          id: parsedUser.profile_id || 'BGMI-Loading...', // BGMI-10001
          name: username,  // REGISTER FORM SE - Akash
          stats: {
            kdRatio: "5.2", winRate: "42%", totalMatches: "567",
            chickenDinners: "156", totalKills: "3248", avgDamage: "289",
          },
        };

        setProfile(profileData);
        setLoading(false);

      } catch (error) {
        console.error("🚨 Profile error:", error);
        navigate("/login");
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
            {/* 🔥 GAMER NAME (REGISTER TIME WALA) */}
            <h1 className="gamer-name">{profile.name}</h1> {/* Akash */}
            
            {/* 🔥 BGMI ID NAME KE NEECHE */}
            <div className="id-row">
              <span>ID:</span> <strong>{profile.id}</strong> {/* BGMI-10001 */}
            </div>
            
            {/* 🔥 NO EMAIL, NO LOGOUT - CLEAN! */}
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
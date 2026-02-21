import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "./Profile.css";

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

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
        console.log("🔍 OLD LocalStorage ID:", parsedUser.profile_id);

        // 🔥 SERVER SE FRESH DATA LO
        console.log("🔄 Fetching FRESH data from SERVER...");
        const serverRes = await fetch("https://user-register-server.onrender.com/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: parsedUser.email })
        });

        const serverData = await serverRes.json();
        console.log("🔍 SERVER RESPONSE:", serverData);

        if (serverData.success) {
          const freshUser = serverData.user;
          console.log("✅ FRESH Server ID:", freshUser.profile_id);
          
          localStorage.setItem("bgmi_user", JSON.stringify(freshUser));

          const profileData = {
            id: freshUser.profile_id,
            name: freshUser.username,
          };

          setProfile(profileData);
        } else {
          const profileData = {
            id: parsedUser.profile_id || 'BGMI-Loading...',
            name: parsedUser.username,
          };
          setProfile(profileData);
        }

        setLoading(false);
      } catch (error) {
        console.error("🚨 Profile error:", error);
        
        const userData = localStorage.getItem("bgmi_user") || sessionStorage.getItem("bgmi_user");
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setProfile({
            id: parsedUser.profile_id || 'BGMI-Loading...',
            name: parsedUser.username || 'User',
          });
        }
        setLoading(false);
      }
    };

    loadProfile();
  }, [navigate]);

  // 🔥 BUTTON CLICK - BANK PAGE PE JAO
  const goToBankDetails = () => {
    navigate('/bank-details');
  };

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
              <span>ID:</span> <strong>{profile.id}</strong>
            </div>
          </div>
        </div>
      </header>

      {/* 🔥 ONLY BIG BANK BUTTON */}
      <div className="profile-action">
        <button 
          className="bank-btn"
          onClick={goToBankDetails}
        >
          🏦 Add Bank Details
        </button>
      </div>
    </div>
  );
};

export default Profile;

import React, { useState, useEffect, useRef, useCallback } from 'react';
import './Profile.css';

const API_URL = 'https://bgmi-api.onrender.com';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const mainRef = useRef(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const usersRes = await fetch(`${API_URL}/admin/users`);
        const users = await usersRes.json();
        const userData = users[0] || { profile_id: 'BGMI-EB7XR', name: 'HX Profile' };
        
        setProfile({
          id: userData.profile_id || 'BGMI-EB7XR',
          name: userData.name || 'HX Profile',
          stats: {
            kdRatio: '5.2', winRate: '42%', totalMatches: '567',
            chickenDinners: '156', totalKills: '3,248', avgDamage: '289'
          }
        });
      } catch {
        setProfile({
          id: 'BGMI-EB7XR', name: 'HX Profile',
          stats: { kdRatio: '5.2', winRate: '42%', totalMatches: '567', chickenDinners: '156', totalKills: '3,248', avgDamage: '289' }
        });
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  // 🔥 PERFECT KEYBOARD HANDLING
  useEffect(() => {
    let initialHeight = window.innerHeight;
    
    const handleResize = () => {
      const currentHeight = window.innerHeight;
      const isKeyboardOpen = currentHeight < initialHeight * 0.9; // 10% shrink = keyboard
      
      setKeyboardOpen(isKeyboardOpen);
      
      if (isKeyboardOpen && mainRef.current) {
        // Keyboard open - scroll to top smoothly
        mainRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
      
      // Update initial height only when keyboard closes
      if (!isKeyboardOpen) {
        initialHeight = currentHeight;
      }
    };

    window.visualViewport?.addEventListener('resize', handleResize);
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.visualViewport?.removeEventListener('resize', handleResize);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  if (loading) return <div className="loading">🔄 Loading...</div>;

  return (
    <div className={`esports-profile ${keyboardOpen ? 'keyboard-open' : ''}`} ref={mainRef}>
      <header className="profile-header">
        <div className="player-card">
          <div className="player-avatar">
            <div className="avatar-circle">
              <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=1e40af&color=fff&size=512`} alt="Gamer Avatar" />
            </div>
          </div>

          <div className="player-details">
            <div className="name-row">
              <h1 className="gamer-name">{profile.name}</h1>
            </div>
            <div className="id-row">
              <span className="id-label">Profile ID:</span>
              <strong className="id-value">{profile.id}</strong>
            </div>
          </div>
        </div>
      </header>

      <section className="stats-section">
        <h2>📊 Performance Stats</h2>
        <div className="stats-grid">
          <div className="stat-box"><div className="stat-value">{profile.stats.kdRatio}</div><div>K/D Ratio</div></div>
          <div className="stat-box"><div className="stat-value">{profile.stats.winRate}</div><div>Win Rate</div></div>
          <div className="stat-box"><div className="stat-value">{profile.stats.chickenDinners}</div><div>Chickens</div></div>
          <div className="stat-box"><div className="stat-value">{profile.stats.totalMatches}</div><div>Matches</div></div>
          <div className="stat-box"><div className="stat-value">{profile.stats.totalKills}</div><div>Total Kills</div></div>
          <div className="stat-box"><div className="stat-value">{profile.stats.avgDamage}</div><div>Avg Damage</div></div>
        </div>
      </section>
    </div>
  );
};

export default Profile;
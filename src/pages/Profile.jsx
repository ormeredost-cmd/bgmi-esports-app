import React, { useState, useEffect } from 'react';
import './Profile.css';

const API_URL = 'https://bgmi-api.onrender.com';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingName, setEditingName] = useState(false);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      console.log('🔄 Loading profile from:', API_URL);
      
      try {
        // 1. Server health check
        const healthRes = await fetch(`${API_URL}/`);
        console.log('✅ Server OK');

        // 2. Auto create demo user (if needed)
        console.log('🚀 Creating demo user...');
        const demoRes = await fetch(`${API_URL}/auth/verify-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'demo@bgmi.com',
            code: '000000',
            name: 'Demo Player',
            password: 'demo123'
          })
        });
        console.log('✅ Demo response:', demoRes.ok);

        // 3. Get users list
        const usersRes = await fetch(`${API_URL}/admin/users`);
        const users = await usersRes.json();
        console.log('✅ Users found:', users.length);

        let userData;
        if (users && users.length > 0) {
          userData = users[0];
          console.log('✅ Real user loaded:', userData.profile_id);
        } else {
          // Fallback demo data
          userData = {
            profile_id: 'BGMI-DEMO-12345',
            name: 'Demo Player'
          };
          console.log('✅ Demo fallback activated');
        }

        // 4. Set profile with full stats
        setProfile({
          id: userData.profile_id || 'BGMI-LOADING',
          name: userData.name || 'Player',
          stats: {
            kdRatio: '5.2',
            winRate: '42%',
            totalMatches: '567',
            chickenDinners: '156',
            totalKills: '3,248',
            avgDamage: '289'
          },
          recentTournaments: ['BGMI Pro Series', 'India Open', 'Demo Clash']
        });
        setEditName(userData.name || 'Demo Player');

      } catch (err) {
        console.error('❌ Profile error:', err);
        setError(`Failed to load: ${err.message}`);
        // Emergency demo
        setProfile({
          id: 'BGMI-EMERGENCY',
          name: 'Emergency Demo',
          stats: { kdRatio: '4.8', winRate: '38%', totalMatches: '420', chickenDinners: '120', totalKills: '2,500', avgDamage: '250' },
          recentTournaments: ['Emergency Mode']
        });
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const saveName = () => {
    if (profile) {
      setProfile({ ...profile, name: editName });
    }
    setEditingName(false);
  };

  const cancelEdit = () => {
    setEditName(profile?.name || '');
    setEditingName(false);
  };

  if (loading) {
    return <div className="loading">🔄 Loading your BGMI Profile...</div>;
  }

  if (error) {
    return (
      <div className="error">
        ❌ {error}
        <br />F12 → Console check kar detailed logs
      </div>
    );
  }

  return (
    <div className="esports-profile">
      <header className="profile-header">
        <div className="player-card">
          <div className="player-avatar">
            <img 
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=1e40af&color=fff&size=140`} 
              alt="Player Avatar" 
            />
          </div>
          <div className="player-details">
            <div className="name-row">
              {editingName ? (
                <>
                  <input 
                    value={editName} 
                    onChange={(e) => setEditName(e.target.value)} 
                    className="name-input" 
                    autoFocus 
                    maxLength={20}
                  />
                  <button onClick={saveName} className="btn-save">💾 Save</button>
                  <button onClick={cancelEdit} className="btn-cancel">❌ Cancel</button>
                </>
              ) : (
                <>
                  <h1>{profile.name}</h1>
                  <button className="btn-edit" onClick={() => setEditingName(true)}>✏️ Edit</button>
                </>
              )}
            </div>
            <div className="player-id">
              <strong>Profile ID: {profile.id}</strong>
            </div>
          </div>
        </div>
      </header>

      <section className="stats-section">
        <h2>📊 Performance Stats</h2>
        <div className="stats-grid">
          <div className="stat-box">
            <div className="stat-value">{profile.stats.kdRatio}</div>
            <div>K/D Ratio</div>
          </div>
          <div className="stat-box">
            <div className="stat-value">{profile.stats.winRate}</div>
            <div>Win Rate</div>
          </div>
          <div className="stat-box">
            <div className="stat-value">{profile.stats.chickenDinners}</div>
            <div>Chickens</div>
          </div>
          <div className="stat-box">
            <div className="stat-value">{profile.stats.totalMatches}</div>
            <div>Matches</div>
          </div>
          <div className="stat-box">
            <div className="stat-value">{profile.stats.totalKills}</div>
            <div>Total Kills</div>
          </div>
          <div className="stat-box">
            <div className="stat-value">{profile.stats.avgDamage}</div>
            <div>Avg Damage</div>
          </div>
        </div>
      </section>

      <section className="tournaments-section">
        <h2>🏆 Recent Tournaments</h2>
        <div className="tournaments-list">
          {profile.recentTournaments.map((tournament, index) => (
            <div key={index} className="tournament-item">
              🏅 {tournament}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Profile;

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
          },
          recentTournaments: ['BGMI Pro Series', 'India Open']
        });
        setEditName(userData.name || 'HX Profile');
      } catch (err) {
        setProfile({
          id: 'BGMI-EB7XR', name: 'HX Profile',
          stats: { kdRatio: '5.2', winRate: '42%', totalMatches: '567', chickenDinners: '156', totalKills: '3,248', avgDamage: '289' },
          recentTournaments: ['Demo Series']
        });
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const saveName = () => { if (profile) setProfile({ ...profile, name: editName }); setEditingName(false); };
  const cancelEdit = () => { setEditName(profile?.name || ''); setEditingName(false); };

  if (loading) return <div className="loading">🔄 Loading...</div>;
  if (error) return <div className="error">❌ {error}</div>;

  return (
    <div className="esports-profile">
      <header className="profile-header">
        <div className="player-card">
          <div className="player-avatar">
            <div className="avatar-circle">
              <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=1e40af&color=fff&size=512`} alt="Avatar" />
            </div>
          </div>
          <div className="player-details">
            <div className="name-row">
              {editingName ? (
                <>
                  <input value={editName} onChange={(e) => setEditName(e.target.value)} className="name-input" autoFocus maxLength={15} />
                  <div className="edit-buttons">
                    <button onClick={saveName} className="btn-save">Save</button>
                    <button onClick={cancelEdit} className="btn-cancel">Cancel</button>
                  </div>
                </>
              ) : (
                <>
                  <h1 className="gamer-name">{profile.name}</h1>
                  <button className="btn-edit" onClick={() => setEditingName(true)}>Edit Name</button>
                </>
              )}
            </div>
            <div className="player-id">Profile ID: <strong>{profile.id}</strong></div>
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

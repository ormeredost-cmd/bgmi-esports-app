// src/pages/MyMatches.jsx - SINGLE DATE ONLY VERSION
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";
import "./MyMatches.css";

const MyMatches = () => {
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bgmiId, setBgmiId] = useState('');
  const [inputVisible, setInputVisible] = useState(false);

  const fetchMatches = useCallback(async (id) => {
    try {
      setLoading(true);
      if (!id) return;

      console.log('🔍 Loading matches for:', id);
      const response = await fetch(`http://localhost:5001/api/my-matches?bgmiId=${id}`);
      const data = await response.json();
      
      console.log('📊 Matches:', data.matches);
      setMatches(data.matches || []);
    } catch (error) {
      console.error('❌ Fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const storedId = localStorage.getItem('lastBgmiId') || localStorage.getItem('tempBgmiId');
    if (storedId) {
      setBgmiId(storedId);
      fetchMatches(storedId);
    } else {
      setInputVisible(true);
    }
  }, [fetchMatches]);

  const handleBgmiIdSubmit = (e) => {
    e.preventDefault();
    if (bgmiId) {
      fetchMatches(bgmiId);
      setInputVisible(false);
    }
  };

  if (loading) {
    return (
      <div className="mymatches-page">
        <BackButton fallbackPath="/tournaments" className="back-btn" />
        <div className="mymatches-container">
          <div className="loading-text">Loading matches...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="mymatches-page">
      <BackButton fallbackPath="/tournaments" className="back-btn" />
      <div className="mymatches-container">
        <div className="page-header">
          <h1>मेरे मैच</h1>
          {bgmiId && <p>ID: <strong>{bgmiId}</strong></p>}
        </div>

        {inputVisible ? (
          <div className="bgmi-input-section">
            <form onSubmit={handleBgmiIdSubmit} className="bgmi-form">
              <input
                type="text"
                className="bgmi-input"
                placeholder="Enter your BGMI ID (51234567890)"
                value={bgmiId}
                onChange={(e) => setBgmiId(e.target.value)}
                autoFocus
              />
              <button type="submit" className="load-btn">
                Load Matches
              </button>
            </form>
          </div>
        ) : matches.length > 0 ? (
          <div className="matches-grid">
            {matches.map((match) => (
              <div key={match.id} className="match-card">
                <div className="match-header">
                  <h3>{match.tournamentName}</h3>
                  <span className={`status registered`}>Registered</span>
                </div>
                <div className="match-details">
                  <div className="detail-row">
                    <span>Player:</span>
                    <span className="highlight">{match.playerName}</span>
                  </div>
                  <div className="detail-row">
                    <span>ID:</span>
                    <span className="highlight">{match.bgmiId}</span>
                  </div>
                  <div className="detail-row">
                    <span>Entry:</span>
                    <span className="price">₹{match.entryFee || 50}</span>
                  </div>
                  <div className="detail-row">
                    <span>Prize:</span>
                    <span className="prize-pool">₹{match.prizePool || 80}</span>
                  </div>
                  <div className="detail-row">
                    <span>Date:</span>
                    <span>{match.date}</span>  {/* ✅ SIRF DATE - NO TIME */}
                  </div>
                  <div className="detail-row joined-time">
                    <span>Joined:</span>
                    <span className="time">Today</span>  {/* ✅ NO DOUBLE DATE */}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-matches">
            <div className="empty-icon">🎮</div>
            <h2>कोई मैच नहीं मिला</h2>
            <p>BGMI ID डालो अपने matches देखने के लिए</p>
            <button className="join-btn" onClick={() => setInputVisible(true)}>
              Enter BGMI ID
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyMatches;

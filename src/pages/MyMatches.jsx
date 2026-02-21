import { useState, useEffect, useCallback } from "react";
import "./MyMatches.css";

const MyMatches = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bgmiId, setBgmiId] = useState("");
  const [inputVisible, setInputVisible] = useState(false);

  const API_URL = window.location.hostname === "localhost" 
    ? "http://localhost:5002"
    : "https://deposit-and-join-tournament-server.onrender.com";

  const fetchMatches = useCallback(async (id) => {
    if (!id) return;

    try {
      const res = await fetch(`${API_URL}/api/my-matches?bgmiId=${id}`);
      const data = await res.json();
      
      if (Array.isArray(data.matches)) {
        setMatches(data.matches);
      } else {
        setMatches([]);
      }
    } catch (err) {
      setMatches([]);
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    const storedId = localStorage.getItem("lastBgmiId") || localStorage.getItem("tempBgmiId");

    if (storedId) {
      setBgmiId(storedId);
      fetchMatches(storedId);
    } else {
      setInputVisible(true);
      setLoading(false);
    }
  }, [fetchMatches]);

  useEffect(() => {
    if (!bgmiId) return;
    const interval = setInterval(() => fetchMatches(bgmiId), 10000);
    return () => clearInterval(interval);
  }, [bgmiId, fetchMatches]);

  const handleBgmiIdSubmit = (e) => {
    e.preventDefault();
    const id = bgmiId.trim();
    
    if (!id) return;

    localStorage.setItem("lastBgmiId", id);
    localStorage.setItem("tempBgmiId", id);
    fetchMatches(id);
    setInputVisible(false);
  };

  if (loading) {
    return (
      <div className="mymatches-page">
        <div className="loading-text">Loading matches…</div>
      </div>
    );
  }

  return (
    <div className="mymatches-page">
      <div className="mymatches-container">
        <div className="page-header">
          <h1>मेरे मैच</h1>
          {bgmiId && <p>ID: <strong>{bgmiId}</strong></p>}
        </div>

        {inputVisible ? (
          <form onSubmit={handleBgmiIdSubmit} className="bgmi-form">
            <input
              type="text"
              placeholder="Enter BGMI ID"
              value={bgmiId}
              onChange={(e) => setBgmiId(e.target.value)}
              autoFocus
            />
            <button type="submit">Load Matches</button>
          </form>
        ) : matches.length > 0 ? (
          <div className="matches-grid">
            {matches.map((match) => (
              <div key={match.id} className="match-card">
                <div className="match-header">
                  <h3>{match.tournament_name}</h3>
                  <span className="status registered">Registered</span>
                </div>

                <div className="match-details">
                  <div className="detail-row">
                    <span>Player:</span>
                    <span className="highlight">{match.player_name}</span>
                  </div>
                  <div className="detail-row">
                    <span>BGMI ID:</span>
                    <span className="highlight">{match.bgmi_id}</span>
                  </div>
                  <div className="detail-row">
                    <span>Entry:</span>
                    <span>₹{match.entry_fee || 0}</span>
                  </div>
                  <div className="detail-row">
                    <span>Prize:</span>
                    <span className="prize-pool">₹{match.prize_pool || 0}</span>
                  </div>
                  <div className="detail-row">
                    <span>Date:</span>
                    <span>{match.date}</span>
                  </div>
                  <div className="detail-row">
                    <span>Time:</span>
                    <span>{match.time}</span>
                  </div>
                  {match.roomId ? (
                    <div className="room-box">
                      <div className="detail-row">
                        <span>Room ID:</span>
                        <strong>{match.roomId}</strong>
                      </div>
                      <div className="detail-row">
                        <span>Password:</span>
                        <strong>{match.roomPassword}</strong>
                      </div>
                    </div>
                  ) : (
                    <div className="room-pending">⏳ Room details coming soon</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-matches">
            <h2>कोई मैच नहीं मिला</h2>
            <p>ID: <strong>{bgmiId}</strong></p>
            <button onClick={() => setInputVisible(true)}>Enter BGMI ID</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyMatches;

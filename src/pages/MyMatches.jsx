// src/pages/MyMatches.jsx - 🔥 SILENT BACKGROUND REFRESH (NO BUTTONS!)
import { useState, useEffect, useCallback } from "react";
import "./MyMatches.css";

const MyMatches = () => {
  const [allMatches, setAllMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  const API_URL = window.location.hostname === "localhost" 
    ? "http://localhost:5002"
    : "https://deposit-and-join-tournament-server.onrender.com";

  // 🔥 GET ALL BGMI IDs
  const getAllBgmiIds = () => {
    try {
      const tournamentJoins = JSON.parse(localStorage.getItem('tournamentJoins') || '[]');
      const uniqueIds = [...new Set(tournamentJoins.map(join => join.bgmiId))];
      const fallback = localStorage.getItem("tempBgmiId") || localStorage.getItem("lastBgmiId");
      if (fallback && !uniqueIds.includes(fallback)) uniqueIds.push(fallback);
      return uniqueIds.filter(Boolean);
    } catch {
      return [localStorage.getItem("tempBgmiId") || localStorage.getItem("lastBgmiId")].filter(Boolean);
    }
  };

  // 🔥 SILENT BACKGROUND FETCH (NO UI CHANGE!)
  const fetchMatchesSilently = useCallback(async (showLoading = false) => {
    const bgmiIds = getAllBgmiIds();
    if (bgmiIds.length === 0) {
      if (showLoading) setAllMatches([]);
      if (showLoading) setLoading(false);
      return;
    }

    try {
      if (showLoading) setLoading(true);
      
      const allMatchesPromises = bgmiIds.map(async (id) => {
        const res = await fetch(`${API_URL}/api/my-matches?bgmiId=${id}`);
        const data = await res.json();
        return data.matches || [];
      });

      const allMatchesArrays = await Promise.all(allMatchesPromises);
      const allMatchesFlat = allMatchesArrays.flat();
      
      // Sort by date (newest first)
      const sortedMatches = allMatchesFlat.sort((a, b) => 
        new Date(b.joined_at) - new Date(a.joined_at)
      );
      
      // 🔥 ONLY UPDATE IF DATA CHANGED (NO BLINK!)
      setAllMatches(prevMatches => {
        if (JSON.stringify(prevMatches) === JSON.stringify(sortedMatches)) {
          return prevMatches; // No change = no re-render!
        }
        return sortedMatches;
      });
      
    } catch (err) {
      console.error("Fetch matches error:", err);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [API_URL]);

  // 🔥 INITIAL LOAD (WITH LOADING)
  useEffect(() => {
    setIsInitialLoad(true);
    fetchMatchesSilently(true);
    setIsInitialLoad(false);
  }, []);

  // 🔥 SILENT BACKGROUND REFRESH (10s - NO LOADING!)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchMatchesSilently(false); // 🔥 NO UI CHANGE!
    }, 10000);
    
    return () => clearInterval(interval);
  }, [fetchMatchesSilently]);

  if (loading && isInitialLoad) {
    return (
      <div className="mymatches-page">
        <div className="loading-text">Loading all matches…</div>
      </div>
    );
  }

  return (
    <div className="mymatches-page">
      <div className="mymatches-container">
        <div className="page-header">
          <h1>मेरे मैच</h1>
          <p>Total: <strong>{allMatches.length}</strong> matches found</p>
        </div>

        {allMatches.length > 0 ? (
          <div className="matches-grid">
            {allMatches.map((match) => (
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
                  {match.room_id ? (
                    <div className="room-box">
                      <div className="detail-row">
                        <span>Room ID:</span>
                        <strong>{match.room_id}</strong>
                      </div>
                      <div className="detail-row">
                        <span>Password:</span>
                        <strong>{match.room_password}</strong>
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
            <p>No matches found for your BGMI IDs</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyMatches;

// src/pages/MyMatches.jsx - 🔥 SIMPLE LOADING + SILENT REFRESH!
import { useState, useEffect, useCallback, useRef } from "react";
import "./MyMatches.css";
import BackButton from '../components/BackButton';

const MyMatches = () => {
  const [allMatches, setAllMatches] = useState([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const hasLoadedRef = useRef(false);
  
  const API_URL = window.location.hostname === "localhost" 
    ? "http://localhost:5002"
    : "https://deposit-and-join-tournament-server.onrender.com";

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

  const fetchMatchesInitial = useCallback(async () => {
    setIsInitialLoading(true);
    
    const bgmiIds = getAllBgmiIds();
    if (bgmiIds.length === 0) {
      setAllMatches([]);
      setIsInitialLoading(false);
      return;
    }

    try {
      const allMatchesPromises = bgmiIds.map(async (id) => {
        const res = await fetch(`${API_URL}/api/my-matches?bgmiId=${id}`);
        const data = await res.json();
        return data.matches || [];
      });

      const allMatchesArrays = await Promise.all(allMatchesPromises);
      const allMatchesFlat = allMatchesArrays.flat();
      const sortedMatches = allMatchesFlat.sort((a, b) => 
        new Date(b.joined_at) - new Date(a.joined_at)
      );
      
      setAllMatches(sortedMatches);
    } catch (err) {
      console.error("Initial fetch error:", err);
      setAllMatches([]);
    } finally {
      setIsInitialLoading(false);
      hasLoadedRef.current = true;
    }
  }, [API_URL]);

  const fetchMatchesSilently = useCallback(async () => {
    if (hasLoadedRef.current && allMatches.length > 0) return;
    
    const bgmiIds = getAllBgmiIds();
    if (bgmiIds.length === 0) return;

    try {
      const allMatchesPromises = bgmiIds.map(async (id) => {
        const res = await fetch(`${API_URL}/api/my-matches?bgmiId=${id}`);
        const data = await res.json();
        return data.matches || [];
      });

      const allMatchesArrays = await Promise.all(allMatchesPromises);
      const allMatchesFlat = allMatchesArrays.flat();
      const sortedMatches = allMatchesFlat.sort((a, b) => 
        new Date(b.joined_at) - new Date(a.joined_at)
      );
      
      setAllMatches(prevMatches => {
        if (JSON.stringify(prevMatches) === JSON.stringify(sortedMatches)) {
          return prevMatches;
        }
        return sortedMatches;
      });
    } catch (err) {
      console.error("Silent fetch error:", err);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchMatchesInitial();
  }, [fetchMatchesInitial]);

  useEffect(() => {
    const interval = setInterval(fetchMatchesSilently, 12000);
    return () => clearInterval(interval);
  }, [fetchMatchesSilently]);

  // 🔥 SIMPLE NORMAL LOADING
  if (isInitialLoading) {
    return (
      <div className="mymatches-page">
        <BackButton fallbackPath="/" />
        <div className="simple-loading">
          <div>⏳ Loading matches...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="mymatches-page">
      <BackButton fallbackPath="/" />
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

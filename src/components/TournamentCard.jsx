// src/components/TournamentCard.jsx - 🔥 TIME LINE + GUN + TOURNAMENT STATUS!
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "./TournamentCard.css";

const TournamentCard = ({ t }) => {
  const [isJoined, setIsJoined] = useState(false);
  const [isFull, setIsFull] = useState(false);
  const [loading, setLoading] = useState(false);
  const [registeredSlots, setRegisteredSlots] = useState(0);
  const [maxSlots, setMaxSlots] = useState(2);
  
  const intervalRef = useRef(null);
  const mountedRef = useRef(true);

  const API_URL = window.location.hostname === "localhost" 
    ? "http://localhost:5002" 
    : "https://deposit-and-join-tournament-server.onrender.com";

  // 🔥 TOURNAMENT SPECIFIC BGMI ID GETTER
  const getBgmiIdForTournament = () => {
    try {
      const tournamentJoins = JSON.parse(localStorage.getItem('tournamentJoins') || '[]');
      const tournamentJoin = tournamentJoins.find(join => join.tournamentId === t.id);
      return tournamentJoin?.bgmiId || localStorage.getItem("tempBgmiId") || localStorage.getItem("lastBgmiId") || "";
    } catch {
      return localStorage.getItem("tempBgmiId") || localStorage.getItem("lastBgmiId") || "";
    }
  };

  const checkStatus = () => {
    if (!mountedRef.current) return;

    // SLOTS - Always works
    fetch(`${API_URL}/api/tournament-slots-count/${t.id}`)
      .then(res => res.json())
      .then(data => {
        setRegisteredSlots(data.registered || 0);
        setMaxSlots(data.max || 2);
        setIsFull((data.registered || 0) >= (data.max || 2));
      })
      .catch(() => {
        setRegisteredSlots(0);
        setMaxSlots(2);
      });

    // 🔥 JOIN STATUS - TOURNAMENT SPECIFIC
    const bgmiId = getBgmiIdForTournament();
    if (bgmiId) {
      fetch(`${API_URL}/api/check-join/${t.id}?bgmiId=${bgmiId}`)
        .then(res => res.json())
        .then(data => {
          console.log(`📊 ${t.id} joined:`, data.joined);
          setIsJoined(data.joined || false);
        })
        .catch(() => setIsJoined(false));
    }
  };

  // 🔥 LOAD IMMEDIATE
  useEffect(() => {
    checkStatus();
  }, []);

  // 🔥 INTERVAL 5s
  useEffect(() => {
    intervalRef.current = setInterval(checkStatus, 5000);
    return () => clearInterval(intervalRef.current);
  }, []);

  // 🔥 CLEANUP
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div className={`tour-card ${t.type?.toLowerCase() === "tdm" ? "tdm-card" : ""}`}>
      <div className="tour-header">
        <span className="tour-game">BGMI</span>
        <span className={`tour-tag ${t.type?.toLowerCase()}`}>{t.type}</span>
      </div>
      <h3 className="tour-title">{t.name}</h3>
      
      {/* 🔥 MODE LINE */}
      <p className="tour-meta">
        <span className="meta-label">Mode</span>
        <span className="meta-value">{t.mode}</span>
      </p>
      
      {/* 🔥 TIME LINE - JOIN → START */}
      {/* 🔥 SIMPLE TIME LINE */}
<p className="tour-meta time-line">
  <span className="meta-label">Time</span>
  <span className="meta-value time-highlight">{t.time}</span>  {/* Sirf ek time! */}
</p>

      
      {/* 🔥 GUN LINE */}
      {t.gun && (
        <p className="tour-meta gun-line">
          <span className="meta-label">Gun</span>
          <span className="meta-value gun-highlight">🔫 {t.gun}</span>
        </p>
      )}
      
      {/* 🔥 ENTRY + PRIZE */}
      <p className="tour-meta">
        <span className="meta-label">Entry</span>
        <span className="meta-value highlight-money">₹{t.entryFee}</span>
      </p>
      <p className="tour-meta">
        <span className="meta-label">Prize</span>
        <span className="meta-value highlight-prize">₹{t.prizePool}</span>
      </p>
      
      <div className="tour-footer">
        <span className={`tour-slots ${isFull ? "slots-full" : ""}`}>
          <span className="meta-label">Slots</span>
          <span className="meta-value live-slots">
            {registeredSlots}/{maxSlots}
            {isFull && <span className="full-badge">🔴 FULL</span>}
          </span>
        </span>

        {isFull ? (
          <button className="btn-tour btn-full" disabled>Tournament Full</button>
        ) : isJoined ? (
          <button className="btn-tour btn-joined" disabled>✅ JOINED</button>
        ) : (
          <Link to={`/tournaments/${t.id}`} className="btn-tour btn-active">View & Register</Link>
        )}
      </div>
    </div>
  );
};

export default TournamentCard;

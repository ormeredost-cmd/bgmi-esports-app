// src/components/TournamentCard.jsx - FINAL MINIMAL FIX
import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import "./TournamentCard.css";

const TournamentCard = ({ t }) => {
  const [isJoined, setIsJoined] = useState(false);
  const [isFull, setIsFull] = useState(false);
  const [loading, setLoading] = useState(true);
  const [registeredSlots, setRegisteredSlots] = useState(0);

  // 🔥 BUG FIX FUNCTION
  const getCurrentBgmiId = () => {
    return localStorage.getItem('tempBgmiId') || localStorage.getItem('lastBgmiId') || '';
  };

  const checkTournamentStatus = useCallback(async () => {
    try {
      setLoading(true);
      
      const bgmiId = getCurrentBgmiId();
      let joinedStatus = false;
      if (bgmiId) {
        const joinResponse = await fetch(`http://localhost:5001/api/check-join/${t.id}?bgmiId=${bgmiId}`);
        const joinResult = await joinResponse.json();
        joinedStatus = joinResult.joined;
      }
      setIsJoined(joinedStatus);

      const slotsResponse = await fetch(`http://localhost:5001/api/tournament-slots-count/${t.id}`);
      const slotsResult = await slotsResponse.json();
      setRegisteredSlots(slotsResult.registered || 0);
      setIsFull(slotsResult.registered >= 2);
      
    } catch (error) {
      console.error('Status check failed:', error);
    } finally {
      setLoading(false);
    }
  }, [t.id]);

  useEffect(() => {
    checkTournamentStatus();
  }, [checkTournamentStatus]);

  useEffect(() => {
    const interval = setInterval(() => {
      checkTournamentStatus();
    }, 3000);
    return () => clearInterval(interval);
  }, [checkTournamentStatus]);

  return (
    <div className={`tour-card ${t.type?.toLowerCase() === "tdm" ? "tdm-card" : ""}`}>
      <div className="tour-header">
        <span className="tour-game">BGMI</span>
        <span className={`tour-tag ${t.type?.toLowerCase()}`}>
          {t.type}
        </span>
      </div>
      <h3 className="tour-title">{t.name}</h3>
      <p className="tour-meta">
        <span className="meta-label">Mode</span>
        <span className="meta-value">{t.mode}</span>
      </p>
      <p className="tour-meta">
        <span className="meta-label">Entry</span>
        <span className="meta-value highlight-money">₹{t.entryFee}</span>
      </p>
      <p className="tour-meta">
        <span className="meta-label">Prize</span>
        <span className="meta-value highlight-prize">₹{t.prizePool}</span>
      </p>
      <div className="tour-footer">
        <span className={`tour-slots ${isFull ? 'slots-full' : ''}`}>
          <span className="meta-label">Slots</span>
          <span className="meta-value live-slots">
            {registeredSlots}/2 
            {isFull && <span className="full-badge">🔴 FULL</span>}
          </span>
        </span>
        {loading ? (
          <button className="btn-tour btn-loading" disabled>🔄 LIVE...</button>
        ) : isFull ? (
          <button className="btn-tour btn-full" disabled>Tournament Full</button>
        ) : isJoined ? (
          <button className="btn-tour btn-joined" disabled>✅ JOINED</button>
        ) : (
          <Link to={`/tournaments/${t.id}`} className="btn-tour btn-active">
            View & Register
          </Link>
        )}
      </div>
    </div>
  );
};

export default TournamentCard;

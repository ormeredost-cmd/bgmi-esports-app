// src/components/TournamentCard.jsx - FINAL FIXED (NO BLINK, SMOOTH UX)

import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import "./TournamentCard.css";

const TournamentCard = ({ t }) => {
  const [isJoined, setIsJoined] = useState(false);
  const [isFull, setIsFull] = useState(false);
  const [loading, setLoading] = useState(true);
  const [registeredSlots, setRegisteredSlots] = useState(0);

  // 🔥 LOCAL SERVER
  const API_URL = "http://localhost:5002";

  // ✅ CURRENT BGMI ID
  const getCurrentBgmiId = () => {
    return (
      localStorage.getItem("tempBgmiId") ||
      localStorage.getItem("lastBgmiId") ||
      ""
    );
  };

  // ✅ STATUS CHECK (NO LOADING TOGGLE)
  const checkTournamentStatus = useCallback(async () => {
    try {
      const bgmiId = getCurrentBgmiId();
      let joinedStatus = false;

      if (bgmiId) {
        const joinRes = await fetch(
          `${API_URL}/api/check-join/${t.id}?bgmiId=${bgmiId}`
        );
        const joinData = await joinRes.json();
        joinedStatus = joinData.joined;
      }

      setIsJoined(joinedStatus);

      const slotsRes = await fetch(
        `${API_URL}/api/tournament-slots-count/${t.id}`
      );
      const slotsData = await slotsRes.json();
      const count = slotsData.registered || 0;

      setRegisteredSlots(count);
      setIsFull(count >= 2);
    } catch (err) {
      console.error("Tournament status error:", err);
    } finally {
      setLoading(false); // ✅ ONLY FIRST TIME
    }
  }, [t.id]);

  // 🔥 FIRST LOAD
  useEffect(() => {
    checkTournamentStatus();
  }, [checkTournamentStatus]);

  // 🔁 BACKGROUND REFRESH (SLOW = NO BLINK)
  useEffect(() => {
    const interval = setInterval(() => {
      checkTournamentStatus();
    }, 8000); // 8 sec

    return () => clearInterval(interval);
  }, [checkTournamentStatus]);

  return (
    <div
      className={`tour-card ${
        t.type?.toLowerCase() === "tdm" ? "tdm-card" : ""
      }`}
    >
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
        <span className="meta-value highlight-money">
          ₹{t.entryFee}
        </span>
      </p>

      <p className="tour-meta">
        <span className="meta-label">Prize</span>
        <span className="meta-value highlight-prize">
          ₹{t.prizePool}
        </span>
      </p>

      <div className="tour-footer">
        <span className={`tour-slots ${isFull ? "slots-full" : ""}`}>
          <span className="meta-label">Slots</span>
          <span className="meta-value live-slots">
            {registeredSlots}/2
            {isFull && <span className="full-badge"> 🔴 FULL</span>}
          </span>
        </span>

        {loading ? (
          <button className="btn-tour btn-loading" disabled>
            🔄 Loading...
          </button>
        ) : isFull ? (
          <button className="btn-tour btn-full" disabled>
            Tournament Full
          </button>
        ) : isJoined ? (
          <button className="btn-tour btn-joined" disabled>
            ✅ JOINED
          </button>
        ) : (
          <Link
            to={`/tournaments/${t.id}`}
            className="btn-tour btn-active"
          >
            View & Register
          </Link>
        )}
      </div>
    </div>
  );
};

export default TournamentCard;

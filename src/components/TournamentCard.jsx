// src/components/TournamentCard.jsx - 🔥 ONE TIME LOADING + SILENT CHECK!
import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import "./TournamentCard.css";

const TournamentCard = ({ t }) => {
  const [isJoined, setIsJoined] = useState(false);
  const [isFull, setIsFull] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true); // 🔥 ONE TIME ONLY!
  const [registeredSlots, setRegisteredSlots] = useState(0);
  const [maxSlots, setMaxSlots] = useState(t.slots || 64); // Default from t
  
  const intervalRef = useRef(null);
  const mountedRef = useRef(true);
  const hasLoadedRef = useRef(false); // 🔥 STOP RELOADING!

  const API_URL = window.location.hostname === "localhost" 
    ? "http://localhost:5002" 
    : "https://deposit-and-join-tournament-server.onrender.com";

  const getBgmiIdForTournament = useCallback(() => {
    try {
      const tournamentJoins = JSON.parse(localStorage.getItem('tournamentJoins') || '[]');
      const tournamentJoin = tournamentJoins.find(join => join.tournamentId === t.id);
      return tournamentJoin?.bgmiId || localStorage.getItem("tempBgmiId") || localStorage.getItem("lastBgmiId") || "";
    } catch {
      return localStorage.getItem("tempBgmiId") || localStorage.getItem("lastBgmiId") || "";
    }
  }, [t.id]);

  // 🔥 ONE TIME INITIAL CHECK (WITH LOADING)
  const checkStatusInitial = useCallback(async () => {
    setIsInitialLoading(true);
    
    try {
      // SLOTS CHECK
      const slotsRes = await fetch(`${API_URL}/api/tournament-slots-count/${t.id}`);
      const slotsData = await slotsRes.json();
      setRegisteredSlots(slotsData.registered || 0);
      setMaxSlots(slotsData.max || t.slots || 64);
      setIsFull((slotsData.registered || 0) >= (slotsData.max || t.slots || 64));

      // JOIN CHECK
      const bgmiId = getBgmiIdForTournament();
      if (bgmiId) {
        const joinRes = await fetch(`${API_URL}/api/check-join/${t.id}?bgmiId=${bgmiId}`);
        const joinData = await joinRes.json();
        console.log(`📊 Initial ${t.id}:`, joinData.joined);
        setIsJoined(!!joinData.joined);
      }
    } catch (error) {
      console.error("Initial check failed:", error);
      setIsJoined(false);
    } finally {
      setIsInitialLoading(false); // 🔥 LOADING END FOREVER!
      hasLoadedRef.current = true;
    }
  }, [t.id, API_URL, t.slots, getBgmiIdForTournament]);

  // 🔥 SILENT BACKGROUND CHECK (NO LOADING)
  const checkStatusSilent = useCallback(async () => {
    // 🔥 Already final status = NO CHECK!
    if (hasLoadedRef.current && (isJoined || isFull)) return;
    
    try {
      const bgmiId = getBgmiIdForTournament();
      if (bgmiId) {
        const joinRes = await fetch(`${API_URL}/api/check-join/${t.id}?bgmiId=${bgmiId}`);
        const joinData = await joinRes.json();
        if (joinData.joined) {
          setIsJoined(true);
          hasLoadedRef.current = true; // 🔥 STOP ALL CHECKS!
        }
      }

      // Silent slots update
      const slotsRes = await fetch(`${API_URL}/api/tournament-slots-count/${t.id}`);
      const slotsData = await slotsRes.json();
      setRegisteredSlots(slotsData.registered || 0);
      setMaxSlots(slotsData.max || t.slots || 64);
      setIsFull((slotsData.registered || 0) >= (slotsData.max || t.slots || 64));
    } catch (error) {
      console.error("Silent check failed:", error);
    }
  }, [t.id, API_URL, t.slots, getBgmiIdForTournament, isJoined, isFull]);

  // 🔥 ONE TIME INITIAL LOAD
  useEffect(() => {
    checkStatusInitial();
  }, [checkStatusInitial]);

  // 🔥 SILENT 8s BACKGROUND CHECK (No loading blink!)
  useEffect(() => {
    intervalRef.current = setInterval(checkStatusSilent, 8000);
    return () => clearInterval(intervalRef.current);
  }, [checkStatusSilent]);

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
      
      <p className="tour-meta">
        <span className="meta-label">Mode</span>
        <span className="meta-value">{t.mode}</span>
      </p>
      
      <p className="tour-meta time-line">
        <span className="meta-label">Time</span>
        <span className="meta-value time-highlight">{t.time}</span>
      </p>

      {t.gun && (
        <p className="tour-meta gun-line">
          <span className="meta-label">Special</span>
          <span className="meta-value gun-highlight">🎮 {t.gun}</span>
        </p>
      )}
      
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
            {isInitialLoading ? "⏳" : `${registeredSlots}/${maxSlots}`}
            {isFull && !isInitialLoading && <span className="full-badge">🔴 FULL</span>}
          </span>
        </span>

        {isInitialLoading ? (
          <button className="btn-tour btn-loading" disabled>Checking...</button>
        ) : isFull ? (
          <button className="btn-tour btn-full" disabled>Tournament Full</button>
        ) : isJoined ? (
          <button className="btn-tour btn-joined" disabled>✅ JOINED</button>
        ) : (
          <Link to={`/tournaments/${t.id}`} className="btn-tour btn-active">Join Now</Link>
        )}
      </div>
    </div>
  );
};

export default TournamentCard;

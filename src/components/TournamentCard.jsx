import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import "./TournamentCard.css";

const TournamentCard = ({ t }) => {
  const [isJoined, setIsJoined] = useState(false);
  const [isFull, setIsFull] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [registeredSlots, setRegisteredSlots] = useState(0);

  // ✅ DEFAULT 50 SLOTS
  const [maxSlots, setMaxSlots] = useState(t.slots || 50);

  const intervalRef = useRef(null);
  const hasLoadedRef = useRef(false);

  const API_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:5002"
      : "https://deposit-and-join-tournament-server.onrender.com";

  // ✅ IMPORTANT FIX (bgmiId)
  const getPlayerId = useCallback(() => {
    return localStorage.getItem("playerId") || "";
  }, []);

  // 🔥 MAP EMOJI
  const getMapEmoji = (mapName) => {
    const maps = {
      Bermuda: "🏝️",
      Kalahari: "🏜️",
      Purgatory: "🌆",
      Alpine: "🏔️",
    };
    return maps[mapName] || "🗺️";
  };

  // 🔥 INITIAL LOAD
  const checkStatusInitial = useCallback(async () => {
    setIsInitialLoading(true);

    try {
      const slotsRes = await fetch(
        `${API_URL}/api/tournament-slots-count/${t.id}`
      );
      const slotsData = await slotsRes.json();

      const totalSlots = slotsData.max ?? t.slots ?? 50;

      setRegisteredSlots(slotsData.registered ?? 0);
      setMaxSlots(totalSlots);
      setIsFull((slotsData.registered ?? 0) >= totalSlots);

      const playerId = getPlayerId();

      if (playerId) {
        const joinRes = await fetch(
          `${API_URL}/api/check-join/${t.id}?bgmiId=${playerId}`
        );
        const joinData = await joinRes.json();
        setIsJoined(!!joinData.joined);
      }
    } catch (error) {
      console.error("Initial check failed:", error);
    } finally {
      setIsInitialLoading(false);
      hasLoadedRef.current = true;
    }
  }, [t.id, API_URL, t.slots, getPlayerId]);

  // 🔥 SILENT UPDATE
  const checkStatusSilent = useCallback(async () => {
    if (hasLoadedRef.current && (isJoined || isFull)) return;

    try {
      const slotsRes = await fetch(
        `${API_URL}/api/tournament-slots-count/${t.id}`
      );
      const slotsData = await slotsRes.json();

      const totalSlots = slotsData.max ?? t.slots ?? 50;

      setRegisteredSlots(slotsData.registered ?? 0);
      setMaxSlots(totalSlots);
      setIsFull((slotsData.registered ?? 0) >= totalSlots);

      const playerId = getPlayerId();

      if (playerId) {
        const joinRes = await fetch(
          `${API_URL}/api/check-join/${t.id}?bgmiId=${playerId}`
        );
        const joinData = await joinRes.json();

        if (joinData.joined) {
          setIsJoined(true);
          hasLoadedRef.current = true;
        }
      }
    } catch (error) {
      console.error("Silent check failed:", error);
    }
  }, [t.id, API_URL, t.slots, getPlayerId, isJoined, isFull]);

  useEffect(() => {
    checkStatusInitial();
  }, [checkStatusInitial]);

  useEffect(() => {
    intervalRef.current = setInterval(checkStatusSilent, 8000);
    return () => clearInterval(intervalRef.current);
  }, [checkStatusSilent]);

  return (
    <div className="tour-card">
      <div className="tour-header">
        <span className="tour-game">FREE FIRE</span>
        <span className="tour-tag">{t.type}</span>
      </div>

      <h3 className="tour-title">{t.name}</h3>

      {/* MAP */}
      {t.map && (
        <p className="tour-meta">
          <span className="meta-label">Map</span>
          <span className="meta-value">
            {getMapEmoji(t.map)} {t.map}
          </span>
        </p>
      )}

      {/* MODE */}
      <p className="tour-meta">
        <span className="meta-label">Mode</span>
        <span className="meta-value">{t.mode}</span>
      </p>

      {/* TIME */}
      <p className="tour-meta">
        <span className="meta-label">Time</span>
        <span className="meta-value">{t.time}</span>
      </p>

      {/* ENTRY */}
      <p className="tour-meta">
        <span className="meta-label">Entry</span>
        <span className="meta-value">₹{t.entryFee}</span>
      </p>

      {/* PER KILL */}
      <p className="tour-meta">
        <span className="meta-label">Per Kill</span>
        <span className="meta-value">₹{t.perKill || 5}</span>
      </p>

      {/* ✅ 🔥 SLOTS (PERFECT UI LIKE PER KILL) */}
      <p className="tour-meta">
        <span className="meta-label">Slots</span>
        <span className="meta-value">
          {registeredSlots}/{maxSlots} {isFull && "🔴 FULL"}
        </span>
      </p>

      {/* 🔥 BUTTON */}
      <div className="tour-footer">
        {isInitialLoading ? (
          <button className="btn-tour" disabled>
            Checking...
          </button>
        ) : isFull ? (
          <button className="btn-tour" disabled>
            Full
          </button>
        ) : isJoined ? (
          <button className="btn-tour" disabled>
            Joined
          </button>
        ) : (
          <Link to={`/tournaments/${t.id}`} className="btn-tour">
            Join Now
          </Link>
        )}
      </div>
    </div>
  );
};

export default TournamentCard;
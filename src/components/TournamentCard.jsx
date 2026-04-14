// src/components/TournamentCard.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import "./TournamentCard.css";

const TournamentCard = ({ t }) => {
  const [isJoined, setIsJoined] = useState(false);
  const [isFull, setIsFull] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [registeredSlots, setRegisteredSlots] = useState(0);
  const [maxSlots, setMaxSlots] = useState(50);

  const intervalRef = useRef(null);
  const mountedRef = useRef(true);
  const hasLoadedRef = useRef(false);

  const API_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:5002"
      : "https://deposit-and-join-tournament-server.onrender.com";

  const getBgmiIdForTournament = useCallback(() => {
    try {
      const tournamentJoins = JSON.parse(
        localStorage.getItem("tournamentJoins") || "[]"
      );
      const tournamentJoin = tournamentJoins.find(
        (join) => join.tournamentId === t.id
      );

      return (
        tournamentJoin?.bgmiId ||
        localStorage.getItem("tempBgmiId") ||
        localStorage.getItem("lastBgmiId") ||
        ""
      );
    } catch {
      return (
        localStorage.getItem("tempBgmiId") ||
        localStorage.getItem("lastBgmiId") ||
        ""
      );
    }
  }, [t.id]);

  const getMapEmoji = (mapName) => {
    const maps = {
      Erangel: "🏝️",
      Miramar: "🏜️",
      Sanhok: "🌴",
      Vikendi: "❄️",
      Karakin: "🏔️",
      Livik: "🏕️",
      Rondo: "🎋",
      Bermuda: "🏝️",
      Purgatory: "🌋",
      Kalahari: "🏜️",
      Alpine: "🏔️",
      NeXTerra: "🌌",
    };
    return maps[mapName] || "🗺️";
  };

  const formatTeamType = (teamType) => {
    const types = {
      solo: "Solo",
      duo: "Duo",
      squad: "Squad",
    };
    return types[teamType?.toLowerCase()] || teamType;
  };

  const checkStatusInitial = useCallback(async () => {
    setIsInitialLoading(true);

    try {
      const slotsRes = await fetch(
        `${API_URL}/api/tournament-slots-count/${t.id}`
      );
      const slotsData = await slotsRes.json();

      if (!mountedRef.current) return;

      const registered = slotsData.registered || 0;
      const fixedMaxSlots = 50;

      setRegisteredSlots(registered);
      setMaxSlots(fixedMaxSlots);
      setIsFull(registered >= fixedMaxSlots);

      const bgmiId = getBgmiIdForTournament();

      if (bgmiId) {
        const joinRes = await fetch(
          `${API_URL}/api/check-join/${t.id}?bgmiId=${bgmiId}`
        );
        const joinData = await joinRes.json();

        if (!mountedRef.current) return;

        setIsJoined(!!joinData.joined);
      }
    } catch (error) {
      console.error("Initial check failed:", error);
      if (mountedRef.current) {
        setIsJoined(false);
      }
    } finally {
      if (mountedRef.current) {
        setIsInitialLoading(false);
        hasLoadedRef.current = true;
      }
    }
  }, [t.id, API_URL, getBgmiIdForTournament]);

  const checkStatusSilent = useCallback(async () => {
    if (hasLoadedRef.current && (isJoined || isFull)) return;

    try {
      const bgmiId = getBgmiIdForTournament();

      if (bgmiId) {
        const joinRes = await fetch(
          `${API_URL}/api/check-join/${t.id}?bgmiId=${bgmiId}`
        );
        const joinData = await joinRes.json();

        if (!mountedRef.current) return;

        if (joinData.joined) {
          setIsJoined(true);
          hasLoadedRef.current = true;
        }
      }

      const slotsRes = await fetch(
        `${API_URL}/api/tournament-slots-count/${t.id}`
      );
      const slotsData = await slotsRes.json();

      if (!mountedRef.current) return;

      const registered = slotsData.registered || 0;
      const fixedMaxSlots = 50;

      setRegisteredSlots(registered);
      setMaxSlots(fixedMaxSlots);
      setIsFull(registered >= fixedMaxSlots);
    } catch (error) {
      console.error("Silent check failed:", error);
    }
  }, [t.id, API_URL, getBgmiIdForTournament, isJoined, isFull]);

  const filledPercent =
    maxSlots > 0
      ? Math.min(100, Math.round((registeredSlots / maxSlots) * 100))
      : 0;

  useEffect(() => {
    mountedRef.current = true;
    checkStatusInitial();
  }, [checkStatusInitial]);

  useEffect(() => {
    intervalRef.current = setInterval(checkStatusSilent, 8000);
    return () => clearInterval(intervalRef.current);
  }, [checkStatusSilent]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div
      className={`tour-card ${
        t.type?.toLowerCase() === "tdm" ? "tdm-card" : ""
      }`}
    >
      <div className="tour-header">
        <span className="tour-game">{t.game || "FREE FIRE"}</span>
        <span className={`tour-tag ${t.type?.toLowerCase()}`}>
          {t.type}
        </span>
      </div>

      <h3 className="tour-title">{t.name}</h3>

      {t.tournamentId && (
        <p className="tour-meta tour-meta-id">
          <span className="meta-label">Tournament ID</span>
          <span className="meta-value">{t.tournamentId}</span>
        </p>
      )}

      {t.teamType && (
        <p className="tour-meta">
          <span className="meta-label">Team Type</span>
          <span className="meta-value">{formatTeamType(t.teamType)}</span>
        </p>
      )}

      {t.map && (
        <p className="tour-meta map-line">
          <span className="meta-label">Map</span>
          <span className="meta-value map-highlight">
            {getMapEmoji(t.map)} {t.map}
          </span>
        </p>
      )}

      <p className="tour-meta">
        <span className="meta-label">Mode</span>
        <span className="meta-value">{t.mode}</span>
      </p>

      <p className="tour-meta time-line">
        <span className="meta-label">Time</span>
        <span className="meta-value time-highlight">{t.time}</span>
      </p>

      <p className="tour-meta">
        <span className="meta-label">Entry</span>
        <span className="meta-value highlight-money">₹{t.entryFee}</span>
      </p>

      {t.perKill !== undefined && (
        <p className="tour-meta">
          <span className="meta-label">Per Kill</span>
          <span className="meta-value highlight-money">₹{t.perKill}</span>
        </p>
      )}

      {(t.winnerPrize !== undefined || t.prizePool !== undefined) && (
        <p className="tour-meta">
          <span className="meta-label">Winner Prize</span>
          <span className="meta-value highlight-prize">
            ₹{t.winnerPrize ?? t.prizePool}
          </span>
        </p>
      )}

      <div className="tour-footer">
        <div className="tour-slots-wrap">
          <span className={`tour-slots ${isFull ? "slots-full" : ""}`}>
            <span className="meta-label">Slots</span>
            <span className="meta-value live-slots">
              {isInitialLoading ? "⏳" : `${registeredSlots}/${maxSlots}`}
              {isFull && !isInitialLoading && (
                <span className="full-badge">🔴 FULL</span>
              )}
            </span>
          </span>

          <div className="slots-progress-wrap">
            <div
              className="slots-progress-track"
              role="progressbar"
              aria-valuenow={filledPercent}
              aria-valuemin="0"
              aria-valuemax="100"
              aria-label="Tournament slots progress"
            >
              <div
                className={`slots-progress-fill ${isFull ? "full" : ""}`}
                style={{
                  width: isInitialLoading ? "0%" : `${filledPercent}%`,
                }}
              />
            </div>
          </div>
        </div>

        {isInitialLoading ? (
          <button className="btn-tour btn-loading" disabled>
            Checking...
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
          <Link to={`/tournaments/${t.id}`} className="btn-tour btn-active">
            Join Now
          </Link>
        )}
      </div>
    </div>
  );
};

export default TournamentCard;
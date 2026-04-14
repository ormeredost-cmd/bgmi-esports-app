// src/pages/MyMatches.jsx
import { useState, useEffect, useCallback, useRef } from "react";
import "./MyMatches.css";
import BackButton from "../components/BackButton";

const MyMatches = () => {
  const [allMatches, setAllMatches] = useState([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const hasLoadedRef = useRef(false);

  const API_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:5002"
      : "https://deposit-and-join-tournament-server.onrender.com";

  // ------------------------------------------------
  // Helpers
  // ------------------------------------------------
  const getAllBgmiIds = () => {
    try {
      const tournamentJoins = JSON.parse(
        localStorage.getItem("tournamentJoins") || "[]"
      );
      const uniqueIds = [...new Set(tournamentJoins.map((join) => join.bgmiId))];

      const fallback =
        localStorage.getItem("tempBgmiId") ||
        localStorage.getItem("lastBgmiId");

      if (fallback && !uniqueIds.includes(fallback)) uniqueIds.push(fallback);

      return uniqueIds.filter(Boolean);
    } catch {
      return [
        localStorage.getItem("tempBgmiId") ||
          localStorage.getItem("lastBgmiId"),
      ].filter(Boolean);
    }
  };

  const formatTeamType = (teamType) => {
    const types = {
      solo: "Solo",
      duo: "Duo",
      squad: "Squad",
    };
    return types[teamType?.toLowerCase()] || teamType || "-";
  };

  // ------------------------------------------------
  // Fetch initial matches
  // ------------------------------------------------
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

      const sortedMatches = allMatchesFlat.sort(
        (a, b) => new Date(b.joined_at) - new Date(a.joined_at)
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

  // ------------------------------------------------
  // Silent refresh (background)
  // ------------------------------------------------
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

      const sortedMatches = allMatchesFlat.sort(
        (a, b) => new Date(b.joined_at) - new Date(a.joined_at)
      );

      setAllMatches((prevMatches) => {
        if (JSON.stringify(prevMatches) === JSON.stringify(sortedMatches)) {
          return prevMatches;
        }
        return sortedMatches;
      });
    } catch (err) {
      console.error("Silent fetch error:", err);
    }
  }, [API_URL, allMatches.length]);

  // ------------------------------------------------
  // Effects
  // ------------------------------------------------
  useEffect(() => {
    fetchMatchesInitial();
  }, [fetchMatchesInitial]);

  useEffect(() => {
    const interval = setInterval(fetchMatchesSilently, 12000);
    return () => clearInterval(interval);
  }, [fetchMatchesSilently]);

  // ------------------------------------------------
  // Render
  // ------------------------------------------------
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
          <h1>My Matches</h1>
          <p>
            Total: <strong>{allMatches.length}</strong> matches found
          </p>
        </div>

        {allMatches.length > 0 ? (
          <div className="matches-grid">
            {allMatches.map((match, index) => {
              // Normalize fields (snake_case + camelCase)
              const fee =
                match.entry_fee ??
                match.entryFee ??
                match.entry ??
                null;

              const prize =
                match.prize_pool ??
                match.prizePool ??
                match.winnerPrize ??
                null;

              const perKill =
                match.per_kill ??
                match.perKill ??
                null;

              const teamType =
                match.team_type ??
                match.teamType ??
                null;

              const mode = match.mode ?? null;
              const map = match.map ?? null;

              const rulesShort =
                match.rules_short ??
                match.rulesShort ??
                null;

              const gun = match.gun ?? null;

              const tournamentId =
                match.tournament_id ??
                match.tournamentId ??
                null;

              const gameName =
                match.player_name ??
                match.game_name ??
                match.playerName ??
                "-";

              const tournamentName =
                match.tournament_name ??
                match.tournamentName ??
                "Tournament";

              const matchDate = match.date ?? "-";
              const matchTime = match.time ?? "-";

              const bgmiId =
                match.bgmi_id ??
                match.bgmiId ??
                "-";

              const roomId = match.room_id ?? match.roomId ?? "";
              const roomPassword =
                match.room_password ??
                match.roomPassword ??
                "";

              return (
                <div
                  key={match.id ?? `${bgmiId}-${index}`}
                  className="match-card"
                >
                  <div className="match-header">
                    <h3>{tournamentName}</h3>
                    <span className="status registered">Registered</span>
                  </div>

                  <div className="match-details">
                    {tournamentId && (
                      <div className="detail-row">
                        <span>Tournament ID:</span>
                        <span className="highlight">{tournamentId}</span>
                      </div>
                    )}

                    <div className="detail-row">
                      <span>Game Name:</span>
                      <span className="highlight">{gameName}</span>
                    </div>

                    <div className="detail-row">
                      <span>Game ID:</span>
                      <span className="highlight">{bgmiId}</span>
                    </div>

                    {teamType && (
                      <div className="detail-row">
                        <span>Team Type:</span>
                        <span>{formatTeamType(teamType)}</span>
                      </div>
                    )}

                    {mode && (
                      <div className="detail-row">
                        <span>Mode:</span>
                        <span>{mode}</span>
                      </div>
                    )}

                    {map && (
                      <div className="detail-row">
                        <span>Map:</span>
                        <span>{map}</span>
                      </div>
                    )}

                    {gun && (
                      <div className="detail-row">
                        <span>Gun:</span>
                        <span>{gun}</span>
                      </div>
                    )}

                    {rulesShort && (
                      <div className="detail-row">
                        <span>Rules:</span>
                        <span>{rulesShort}</span>
                      </div>
                    )}

                    <div className="detail-row">
                      <span>Entry:</span>
                      <span>
                        {fee !== null && fee !== "" ? `₹${fee}` : "-"}
                      </span>
                    </div>

                    {perKill !== null && perKill !== "" && (
                      <div className="detail-row">
                        <span>Per Kill:</span>
                        <span className="highlight">₹{perKill}</span>
                      </div>
                    )}

                    {prize !== null && prize !== "" && (
                      <div className="detail-row">
                        <span>Prize:</span>
                        <span className="prize-pool">₹{prize}</span>
                      </div>
                    )}

                    <div className="detail-row">
                      <span>Date:</span>
                      <span>{matchDate}</span>
                    </div>

                    <div className="detail-row">
                      <span>Time:</span>
                      <span>{matchTime}</span>
                    </div>

                    {roomId ? (
                      <div className="room-box">
                        <div className="detail-row">
                          {/* Yahi pe label change kar sakta hai */}
                          <span>Custom ID:</span>
                          <strong>{roomId}</strong>
                        </div>
                        <div className="detail-row">
                          <span>Custom Password:</span>
                          <strong>{roomPassword || "-"}</strong>
                        </div>
                      </div>
                    ) : (
                      <div className="room-pending">
                        ⏳ Room details coming soon
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="no-matches">
            <h2>No Matches Found</h2>
            <p>No matches found for your BGMI IDs</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyMatches;
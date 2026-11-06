
// src/pages/MyMatches.jsx

import { useState, useEffect, useCallback } from "react";
import "./MyMatches.css";
import { useLoading } from "../context/LoadingContext";

const MyMatches = () => {
  const [allMatches, setAllMatches] = useState([]);

  const { setLoading } = useLoading();

  const API_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:5002"
      : "https://deposit-and-join-tournament-server.onrender.com";

  // ==========================================
  // GET LOGGED-IN USER PROFILE ID
  // ==========================================

  const getProfileId = useCallback(() => {
    try {
      const user = JSON.parse(
        localStorage.getItem("bgmi_user") || "null"
      );

      return user?.profile_id || "";
    } catch (error) {
      console.error("Failed to read user:", error);
      return "";
    }
  }, []);

  // ==========================================
  // REMOVE DUPLICATE MATCHES
  // ==========================================

  const removeDuplicateMatches = useCallback((matches) => {
    const uniqueMap = new Map();

    matches.forEach((match) => {
      const tournamentId =
        match.tournament_id ??
        match.tournamentId ??
        "";

      const bgmiId =
        match.bgmi_id ??
        match.bgmiId ??
        "";

      const profileId =
        match.profile_id ??
        match.profileId ??
        "";

      const matchId = match.id ?? "";

      const uniqueKey = matchId
        ? `id-${matchId}`
        : `${profileId}-${tournamentId}-${bgmiId}`;

      if (!uniqueMap.has(uniqueKey)) {
        uniqueMap.set(uniqueKey, match);
      }
    });

    return Array.from(uniqueMap.values());
  }, []);

  // ==========================================
  // FORMAT TEAM TYPE
  // ==========================================

  const formatTeamType = (teamType) => {
    const types = {
      solo: "Solo",
      duo: "Duo",
      squad: "Squad",
    };

    return types[teamType?.toLowerCase()] || teamType || "-";
  };

  // ==========================================
  // SORT MATCHES
  // ==========================================

  const sortMatches = (matches) => {
    return matches.sort(
      (a, b) =>
        new Date(b.joined_at || b.joinedAt || 0) -
        new Date(a.joined_at || a.joinedAt || 0)
    );
  };

  // ==========================================
  // INITIAL FETCH
  // ==========================================

  const fetchMatchesInitial = useCallback(async () => {
    setLoading(true);

    const profileId = getProfileId();

    if (!profileId) {
      console.error("No profileId found");

      setAllMatches([]);
      setLoading(false);

      return;
    }

    try {
      const res = await fetch(
        `${API_URL}/api/my-matches?profileId=${encodeURIComponent(
          profileId
        )}`
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data?.message ||
          data?.error ||
          `HTTP ${res.status}`
        );
      }

      const matches = Array.isArray(data.matches)
        ? data.matches
        : [];

      const uniqueMatches = removeDuplicateMatches(matches);

      setAllMatches(sortMatches(uniqueMatches));

    } catch (error) {
      console.error("Initial fetch error:", error);
      setAllMatches([]);

    } finally {
      setLoading(false);
    }
  }, [
    API_URL,
    getProfileId,
    removeDuplicateMatches,
    setLoading,
  ]);

  // ==========================================
  // SILENT REFRESH
  // ==========================================

  const fetchMatchesSilently = useCallback(async () => {
    const profileId = getProfileId();

    if (!profileId) return;

    try {
      const res = await fetch(
        `${API_URL}/api/my-matches?profileId=${encodeURIComponent(
          profileId
        )}`
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data?.message ||
          data?.error ||
          `HTTP ${res.status}`
        );
      }

      const matches = Array.isArray(data.matches)
        ? data.matches
        : [];

      const uniqueMatches = removeDuplicateMatches(matches);

      setAllMatches(sortMatches(uniqueMatches));

    } catch (error) {
      console.error("Silent fetch error:", error);
    }
  }, [
    API_URL,
    getProfileId,
    removeDuplicateMatches,
  ]);

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    fetchMatchesInitial();
  }, [fetchMatchesInitial]);

  // ==========================================
  // AUTO REFRESH EVERY 12 SECONDS
  // ==========================================

  useEffect(() => {
    const interval = setInterval(() => {
      fetchMatchesSilently();
    }, 12000);

    return () => clearInterval(interval);
  }, [fetchMatchesSilently]);

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="ak-my-matches-page">

      <div className="ak-my-matches-container">

        {/* HEADER */}

        <div className="ak-my-matches-header">

          <h1>My Matches</h1>

          <p>
            Total:{" "}
            <strong>{allMatches.length}</strong>{" "}
            matches found
          </p>

        </div>

        {/* MATCH LIST */}

        {allMatches.length > 0 ? (

          <div className="ak-my-matches-list">

            {allMatches.map((match, index) => {

              // NORMALIZE FIELDS

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

              const roomId =
                match.room_id ??
                match.roomId ??
                "";

              const roomPassword =
                match.room_password ??
                match.roomPassword ??
                "";

              const cardKey =
                match.id ??
                `${tournamentId}-${bgmiId}-${index}`;

              return (

                <div
                  key={cardKey}
                  className="ak-my-matches-card"
                >

                  {/* CARD HEADER */}

                  <div className="ak-my-matches-card-header">

                    <h3>{tournamentName}</h3>

                    <span className="ak-my-matches-status">
                      Registered
                    </span>

                  </div>

                  {/* MATCH DETAILS */}

                  <div className="ak-my-matches-details">

                    {tournamentId && (

                      <div className="ak-my-matches-row">

                        <span>Tournament ID:</span>

                        <span className="ak-my-matches-highlight">
                          {tournamentId}
                        </span>

                      </div>

                    )}

                    <div className="ak-my-matches-row">

                      <span>Game Name:</span>

                      <span className="ak-my-matches-highlight">
                        {gameName}
                      </span>

                    </div>

                    <div className="ak-my-matches-row">

                      <span>Game ID:</span>

                      <span className="ak-my-matches-highlight">
                        {bgmiId}
                      </span>

                    </div>

                    {teamType && (

                      <div className="ak-my-matches-row">

                        <span>Team Type:</span>

                        <span>
                          {formatTeamType(teamType)}
                        </span>

                      </div>

                    )}

                    {mode && (

                      <div className="ak-my-matches-row">

                        <span>Mode:</span>

                        <span>{mode}</span>

                      </div>

                    )}

                    {map && (

                      <div className="ak-my-matches-row">

                        <span>Map:</span>

                        <span>{map}</span>

                      </div>

                    )}

                    {gun && (

                      <div className="ak-my-matches-row">

                        <span>Gun:</span>

                        <span>{gun}</span>

                      </div>

                    )}

                    {rulesShort && (

                      <div className="ak-my-matches-row">

                        <span>Rules:</span>

                        <span>{rulesShort}</span>

                      </div>

                    )}

                    <div className="ak-my-matches-row">

                      <span>Entry:</span>

                      <span>
                        {fee !== null && fee !== ""
                          ? `₹${fee}`
                          : "-"}
                      </span>

                    </div>

                    {perKill !== null && perKill !== "" && (

                      <div className="ak-my-matches-row">

                        <span>Per Kill:</span>

                        <span className="ak-my-matches-highlight">
                          ₹{perKill}
                        </span>

                      </div>

                    )}

                    {prize !== null && prize !== "" && (

                      <div className="ak-my-matches-row">

                        <span>Prize:</span>

                        <span className="ak-my-matches-prize">
                          ₹{prize}
                        </span>

                      </div>

                    )}

                    <div className="ak-my-matches-row">

                      <span>Date:</span>

                      <span>{matchDate}</span>

                    </div>

                    <div className="ak-my-matches-row">

                      <span>Time:</span>

                      <span>{matchTime}</span>

                    </div>

                    {/* ROOM DETAILS */}

                    {roomId ? (

                      <div className="ak-my-matches-room">

                        <div className="ak-my-matches-row">

                          <span>Custom ID:</span>

                          <strong>{roomId}</strong>

                        </div>

                        <div className="ak-my-matches-row">

                          <span>Custom Password:</span>

                          <strong>
                            {roomPassword || "-"}
                          </strong>

                        </div>

                      </div>

                    ) : (

                      <div className="ak-my-matches-pending">
                        ⏳ Room details coming soon
                      </div>

                    )}

                  </div>

                </div>

              );

            })}

          </div>

        ) : (

          <div className="ak-my-matches-empty">

            <h2>No Matches Found</h2>

            <p>
              No matches found for your account
            </p>

          </div>

        )}

      </div>

    </div>
  );
};

export default MyMatches;

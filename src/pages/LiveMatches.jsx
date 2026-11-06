import React, { useCallback, useEffect, useState } from "react";
import "./LiveMatches.css";


const API_URL =
  import.meta.env.VITE_TOURNAMENT_API_URL ||
  "http://localhost:5005";


const getCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem("bgmi_user") || "{}");
  } catch {
    return {};
  }
};


const formatDate = (value) => {
  if (!value) return "—";


  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;


  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};


const formatTime = (value) => {
  if (!value) return "—";


  const parts = String(value).split(":");
  if (parts.length < 2) return value;


  const date = new Date();
  date.setHours(Number(parts[0]), Number(parts[1]), 0, 0);


  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};


const getAmount = (value) => Number(value || 0);


function LiveMatches() {
  const [activeTab, setActiveTab] = useState("live");
  const [selectedMatch, setSelectedMatch] = useState(null);


  const [liveMatches, setLiveMatches] = useState([]);
  const [historyMatches, setHistoryMatches] = useState([]);


  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  const user = getCurrentUser();


  const profileId =
    user.profile_id ||
    user.profileId ||
    user.user?.profile_id ||
    "";


  const loadMatches = useCallback(async () => {
    if (!profileId) {
      setError("User profile not found. Please login again.");
      setLoading(false);
      return;
    }


    try {
      setError("");


      const encodedProfileId = encodeURIComponent(profileId);


      const [liveResponse, historyResponse] = await Promise.all([
        fetch(
          `${API_URL}/api/player/live-matches?profileId=${encodedProfileId}`
        ),
        fetch(
          `${API_URL}/api/player/match-history?profileId=${encodedProfileId}`
        ),
      ]);


      const liveData = await liveResponse.json();
      const historyData = await historyResponse.json();


      if (!liveResponse.ok) {
        throw new Error(
          liveData.error || "Unable to load live matches."
        );
      }


      if (!historyResponse.ok) {
        throw new Error(
          historyData.error || "Unable to load match history."
        );
      }


      setLiveMatches(
        Array.isArray(liveData.matches) ? liveData.matches : []
      );


      setHistoryMatches(
        Array.isArray(historyData.matches) ? historyData.matches : []
      );
    } catch (err) {
      console.error("LiveMatches loading error:", err);
      setError(err.message || "Unable to load match data.");
    } finally {
      setLoading(false);
    }
  }, [profileId]);


  useEffect(() => {
    loadMatches();


    const interval = setInterval(loadMatches, 12000);


    return () => clearInterval(interval);
  }, [loadMatches]);


  const openResults = (match) => {
    setSelectedMatch(match);
  };


  const closeResults = () => {
    setSelectedMatch(null);
  };


  const getMyResult = (match) => {
    const results = Array.isArray(match.results)
      ? match.results
      : [];


    return results.find(
      (player) =>
        String(player.profile_id) === String(profileId)
    );
  };


  // BGMI NAME
  const getPlayerName = (player) =>
    player.player_name ||
    player.bgmi_name ||
    player.profile_name ||
    "Unknown Player";


  const getPlayerRank = (player) =>
    player.rank_position || player.rank || "—";


  const getRankNumber = (player) =>
    Number(player.rank_position || player.rank) || 999999;


  const getPlayerWinning = (player) =>
    getAmount(
      player.total_winning ??
      player.amount ??
      player.winning_amount
    );


  const sortedResults = [...(selectedMatch?.results || [])].sort(
    (a, b) => getRankNumber(a) - getRankNumber(b)
  );


  const topPlayer = sortedResults[0];


  const renderLoading = () => (
    <div className="empty-match-state">
      <div className="empty-match-icon">◉</div>
      <h3>Loading Matches...</h3>
      <p>Please wait while we fetch your match data.</p>
    </div>
  );


  const renderError = () => (
    <div className="empty-match-state">
      <div className="empty-match-icon">!</div>
      <h3>Unable to Load Matches</h3>
      <p>{error}</p>
      <button
        type="button"
        className="view-rank-btn"
        onClick={() => {
          setLoading(true);
          loadMatches();
        }}
      >
        TRY AGAIN
      </button>
    </div>
  );


  return (
    <div className="live-page">


      {/* 🔥 FULL SCREEN BACKGROUND — cards ke bilkul peeche */}
      <div
        className="live-page-bg"
        style={{
          backgroundImage: `url("${import.meta.env.BASE_URL}assets/mymatches-bg.webp")`,
        }}
      ></div>


      <div className="live-page-header">
        <div>
          <span className="live-small-heading">
            BGMI ESPORTS ARENA
          </span>


          <h1>
            MATCH <span>CENTER</span>
          </h1>


          <p>
            Track your live tournaments and check your match performance.
          </p>
        </div>


        <div className="live-header-icon">
          <span>◉</span>
        </div>
      </div>


      <div className="match-tabs">


        <button
          type="button"
          className={`match-tab ${activeTab === "live" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("live");
            closeResults();
          }}
        >
          <span className="tab-live-dot"></span>
          Live Matches
          <span className="tab-count">{liveMatches.length}</span>
        </button>


        <button
          type="button"
          className={`match-tab ${activeTab === "history" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("history");
            closeResults();
          }}
        >
          <span className="history-tab-icon">▤</span>
          Match History
          <span className="tab-count">{historyMatches.length}</span>
        </button>


      </div>


      <div className="live-content-scroll">


        {loading ? (
          renderLoading()
        ) : error ? (
          renderError()
        ) : (
          <>
            {/* LIVE MATCHES */}


            {activeTab === "live" && (
              <section className="matches-section">


                <div className="section-heading">
                  <div>
                    <h2>Live Matches</h2>
                    <p>Currently running tournaments</p>
                  </div>


                  <span className="live-status-label">
                    <span className="live-status-dot"></span>
                    LIVE NOW
                  </span>
                </div>


                {liveMatches.length > 0 ? (
                  <div className="matches-grid">


                    {liveMatches.map((match) => (
                      <div
                        className="match-card"
                        key={match.match_key || match.id}
                      >


                        <div className="match-card-top">
                          <span className="match-game-tag">BGMI</span>


                          <span className="match-live-tag">
                            <span></span>
                            LIVE
                          </span>
                        </div>


                        <div className="match-card-title">
                          <h3>
                            {match.name || match.tournament_name}
                          </h3>


                          <p>
                            {match.tournament_id} ·{" "}
                            {match.mode || match.game_mode}
                          </p>
                        </div>


                        <div className="match-info-grid">


                          <div className="match-info-item">
                            <span>MAP</span>
                            <strong>{match.map || "—"}</strong>
                          </div>


                          <div className="match-info-item">
                            <span>DATE</span>
                            <strong>{formatDate(match.date)}</strong>
                          </div>


                          <div className="match-info-item">
                            <span>TIME</span>
                            <strong>{formatTime(match.time)}</strong>
                          </div>


                          <div className="match-info-item">
                            <span>ENTRY FEE</span>
                            <strong>₹{getAmount(match.entry_fee)}</strong>
                          </div>


                        </div>


                        <div className="match-player-progress">
                          <div className="player-progress-heading">
                            <span>Players Joined</span>


                            <strong>
                              {match.joined_players || 0}/
                              {match.total_slots || match.slots || 50}
                            </strong>
                          </div>


                          <div className="player-progress-track">
                            <div
                              className="player-progress-fill"
                              style={{
                                width: `${
                                  Math.min(
                                    100,
                                    ((match.joined_players || 0) /
                                      (match.total_slots || match.slots || 50)) *
                                      100
                                  )
                                }%`,
                              }}
                            ></div>
                          </div>
                        </div>


                        <div className="match-prize-row">
                          <span>Prize Pool</span>
                          <strong>
                            ₹{getAmount(match.prize_pool)}
                          </strong>
                        </div>


                        <div className="room-details">
                          <div className="room-detail-heading">
                            <span>ROOM DETAILS</span>


                            <span className="room-ready">
                              {match.room_id && match.room_password
                                ? "AVAILABLE"
                                : "NOT SHARED"}
                            </span>
                          </div>


                          <div className="room-detail-item">
                            <span>Room ID</span>
                            <strong>
                              {match.room_id || "Waiting for admin"}
                            </strong>
                          </div>


                          <div className="room-detail-item">
                            <span>Password</span>
                            <strong>
                              {match.room_password || "Waiting for admin"}
                            </strong>
                          </div>
                        </div>


                        <div className="live-card-footer">
                          <span>Match is currently running</span>
                          <span className="live-footer-icon">●</span>
                        </div>


                      </div>
                    ))}


                  </div>
                ) : (
                  <div className="empty-match-state">
                    <div className="empty-match-icon">◉</div>
                    <h3>No Live Matches</h3>
                    <p>
                      You do not have any live matches right now.
                      Check again later.
                    </p>
                  </div>
                )}


              </section>
            )}


            {/* MATCH HISTORY */}


            {activeTab === "history" && !selectedMatch && (
              <section className="matches-section">


                <div className="section-heading">
                  <div>
                    <h2>Match History</h2>
                    <p>Your completed tournament records</p>
                  </div>


                  <span className="completed-status-label">
                    COMPLETED
                  </span>
                </div>


                {historyMatches.length > 0 ? (
                  <div className="matches-grid">


                    {historyMatches.map((match) => {
                      const myResult = getMyResult(match);


                      return (
                        <div
                          className="match-card history-card"
                          key={match.match_key || match.id}
                        >


                          <div className="match-card-top">
                            <span className="match-game-tag">BGMI</span>


                            <span className="completed-match-tag">
                              ✓ COMPLETED
                            </span>
                          </div>


                          <div className="match-card-title">
                            <h3>
                              {match.name || match.tournament_name}
                            </h3>


                            <p>
                              {match.tournament_id} ·{" "}
                              {match.mode || match.game_mode}
                            </p>
                          </div>


                          <div className="match-info-grid">


                            <div className="match-info-item">
                              <span>MAP</span>
                              <strong>{match.map || "—"}</strong>
                            </div>


                            <div className="match-info-item">
                              <span>DATE</span>
                              <strong>{formatDate(match.date)}</strong>
                            </div>


                            <div className="match-info-item">
                              <span>TIME</span>
                              <strong>{formatTime(match.time)}</strong>
                            </div>


                            <div className="match-info-item">
                              <span>PLAYERS</span>
                              <strong>{match.total_players || 0}</strong>
                            </div>


                          </div>


                          <div className="match-prize-row">
                            <span>Total Prize Pool</span>
                            <strong>
                              ₹{getAmount(match.prize_pool)}
                            </strong>
                          </div>


                          <div className="my-match-performance">


                            {myResult ? (
                              <>
                                <div className="my-performance-label">
                                  YOUR PERFORMANCE
                                </div>


                                <div className="my-performance-data">


                                  <div>
                                    <span>YOUR RANK</span>
                                    <strong>
                                      #{getPlayerRank(myResult)}
                                    </strong>
                                  </div>


                                  <div>
                                    <span>KILLS</span>
                                    <strong>
                                      {getAmount(myResult.kills)}
                                    </strong>
                                  </div>


                                  <div>
                                    <span>WINNING</span>
                                    <strong>
                                      ₹{getPlayerWinning(myResult)}
                                    </strong>
                                  </div>


                                </div>
                              </>
                            ) : (
                              <div className="no-performance">
                                Your result is not available.
                              </div>
                            )}


                          </div>


                          <button
                            type="button"
                            className="view-rank-btn"
                            onClick={() => openResults(match)}
                          >
                            VIEW FULL RESULTS
                            <span>→</span>
                          </button>


                        </div>
                      );
                    })}


                  </div>
                ) : (
                  <div className="empty-match-state">
                    <div className="empty-match-icon">▤</div>
                    <h3>No Match History</h3>
                    <p>
                      Your completed matches will appear here.
                    </p>
                  </div>
                )}


              </section>
            )}


            {/* FULL MATCH RESULTS */}


            {activeTab === "history" && selectedMatch && (
              <section className="result-section">


                <button
                  type="button"
                  className="back-to-history-btn"
                  onClick={closeResults}
                >
                  ← BACK TO MATCH HISTORY
                </button>


                <div className="result-header">
                  <div>
                    <span className="result-overline">
                      TOURNAMENT RESULTS
                    </span>


                    <h2>
                      {selectedMatch.name ||
                        selectedMatch.tournament_name}
                    </h2>


                    <p>
                      {selectedMatch.tournament_id} ·{" "}
                      {selectedMatch.map} ·{" "}
                      {formatDate(selectedMatch.date)} ·{" "}
                      {formatTime(selectedMatch.time)}
                    </p>
                  </div>


                  <div className="result-completed-badge">
                    ✓ COMPLETED
                  </div>
                </div>


                {/* WINNER CARD */}
                {topPlayer && getRankNumber(topPlayer) === 1 && (
                  <div className="winner-highlight">


                    <div className="winner-crown">♛</div>


                    <div className="winner-text">
                      <span>TOURNAMENT WINNER</span>
                      <h3>{getPlayerName(topPlayer)}</h3>
                    </div>


                    <div className="winner-reward">
                      <span>WINNING AMOUNT</span>
                      <strong>₹{getPlayerWinning(topPlayer)}</strong>
                    </div>


                  </div>
                )}


                <div className="result-table-container">


                  <div className="result-table-heading">
                    <div>
                      <h3>PLAYER RESULTS</h3>
                      <p>Complete performance of all players</p>
                    </div>


                    <span>
                      {sortedResults.length} PLAYERS
                    </span>
                  </div>


                  <div className="result-table-scroll">


                    <table className="result-table">


                      <thead>
                        <tr>
                          <th>RANK</th>
                          <th>BGMI NAME</th>
                          <th>KILLS</th>
                          <th>WINNING AMOUNT</th>
                        </tr>
                      </thead>


                      <tbody>
                        {sortedResults.map((player, index) => {
                          const isMe =
                            String(player.profile_id) ===
                            String(profileId);


                          const rankNumber = getRankNumber(player);


                          return (
                            <tr
                              key={player.join_id || player.id || index}
                              className={`${
                                rankNumber === 1 ? "winner-row" : ""
                              } ${isMe ? "my-result-row" : ""}`}
                            >


                              {/* RANK */}
                              <td>
                                <div className="rank-cell">
                                  {rankNumber === 1
                                    ? "🏆"
                                    : `#${getPlayerRank(player)}`}
                                </div>
                              </td>


                              {/* BGMI NAME */}
                              <td>
                                <div className="player-name-cell">


                                  <strong>
                                    {getPlayerName(player)}
                                  </strong>


                                  {rankNumber === 1 && (
                                    <span className="winner-player-label">
                                      WINNER
                                    </span>
                                  )}


                                  {isMe && (
                                    <span className="you-player-label">
                                      YOU
                                    </span>
                                  )}


                                </div>
                              </td>


                              {/* KILLS */}
                              <td>
                                <strong className="kills-value">
                                  {getAmount(player.kills)}
                                </strong>
                              </td>


                              {/* WINNING AMOUNT */}
                              <td>
                                <strong className="amount-value">
                                  ₹{getPlayerWinning(player)}
                                </strong>
                              </td>


                            </tr>
                          );
                        })}
                      </tbody>


                    </table>


                  </div>


                </div>


              </section>
            )}
          </>
        )}


      </div>
    </div>
  );
}


export default LiveMatches;
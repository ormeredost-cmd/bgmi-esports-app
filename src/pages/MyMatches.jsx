import { useState, useEffect, useCallback, useRef } from "react";
import "./MyMatches.css";

const MyMatches = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bgmiId, setBgmiId] = useState("");
  const [inputVisible, setInputVisible] = useState(false);

  // 🔥 AUTO API (LOCAL + RENDER)
  const API_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:5002"
      : "https://bgmi-server-save-tournament-data.onrender.com";

  const firstLoad = useRef(true); // 🔥 no blink

  /* ===============================
     FETCH MATCHES (SAFE)
  ================================ */
  const fetchMatches = useCallback(
    async (id) => {
      if (!id) return;

      try {
        const res = await fetch(
          `${API_URL}/api/my-matches?bgmiId=${id}`
        );
        const data = await res.json();

        if (Array.isArray(data.matches)) {
          setMatches((prev) =>
            JSON.stringify(prev) === JSON.stringify(data.matches)
              ? prev
              : data.matches
          );
        }
      } catch (err) {
        console.error("Fetch matches error:", err);
      } finally {
        if (firstLoad.current) {
          setLoading(false);
          firstLoad.current = false;
        }
      }
    },
    [API_URL]
  );

  /* ===============================
     INITIAL LOAD
  ================================ */
  useEffect(() => {
    const storedId =
      localStorage.getItem("lastBgmiId") ||
      localStorage.getItem("tempBgmiId");

    if (storedId) {
      setBgmiId(storedId);
      fetchMatches(storedId);
    } else {
      setInputVisible(true);
      setLoading(false);
    }
  }, [fetchMatches]);

  /* ===============================
     BACKGROUND AUTO REFRESH
  ================================ */
  useEffect(() => {
    if (!bgmiId) return;

    const interval = setInterval(() => {
      fetchMatches(bgmiId);
    }, 10000); // ⏱️ 10 sec

    return () => clearInterval(interval);
  }, [bgmiId, fetchMatches]);

  /* ===============================
     SUBMIT BGMI ID
  ================================ */
  const handleBgmiIdSubmit = (e) => {
    e.preventDefault();
    if (!bgmiId.trim()) return;

    localStorage.setItem("lastBgmiId", bgmiId);
    fetchMatches(bgmiId);
    setInputVisible(false);
  };

  /* ===============================
     LOADING SCREEN (ONLY ONCE)
  ================================ */
  if (loading) {
    return (
      <div className="mymatches-page">
        {/* ❌ BACKBUTTON REMOVED */}
        <div className="loading-text">Loading matches…</div>
      </div>
    );
  }

  return (
    <div className="mymatches-page">
      {/* ❌ BACKBUTTON REMOVED */}

      <div className="mymatches-container">
        <div className="page-header">
          <h1>मेरे मैच</h1>
          {bgmiId && (
            <p>
              ID: <strong>{bgmiId}</strong>
            </p>
          )}
        </div>

        {/* BGMI INPUT */}
        {inputVisible ? (
          <form onSubmit={handleBgmiIdSubmit} className="bgmi-form">
            <input
              type="text"
              placeholder="Enter BGMI ID"
              value={bgmiId}
              onChange={(e) => setBgmiId(e.target.value)}
              autoFocus
            />
            <button type="submit">Load Matches</button>
          </form>
        ) : matches.length > 0 ? (
          <div className="matches-grid">
            {matches.map((match) => (
              <div key={match.id} className="match-card">
                <div className="match-header">
                  <h3>{match.tournamentName}</h3>
                  <span className="status registered">
                    Registered
                  </span>
                </div>

                <div className="match-details">
                  <div className="detail-row">
                    <span>Player:</span>
                    <span className="highlight">
                      {match.playerName}
                    </span>
                  </div>

                  <div className="detail-row">
                    <span>BGMI ID:</span>
                    <span className="highlight">
                      {match.bgmiId}
                    </span>
                  </div>

                  <div className="detail-row">
                    <span>Entry:</span>
                    <span>₹{match.entryFee}</span>
                  </div>

                  <div className="detail-row">
                    <span>Prize:</span>
                    <span className="prize-pool">
                      ₹{match.prizePool}
                    </span>
                  </div>

                  <div className="detail-row">
                    <span>Date:</span>
                    <span>{match.date}</span>
                  </div>

                  {/* 🔥 ROOM DETAILS */}
                  {match.roomId && match.roomPassword ? (
                    <div className="room-box">
                      <div className="detail-row">
                        <span>Room ID:</span>
                        <strong>{match.roomId}</strong>
                      </div>
                      <div className="detail-row">
                        <span>Password:</span>
                        <strong>{match.roomPassword}</strong>
                      </div>
                    </div>
                  ) : (
                    <div className="room-pending">
                      ⏳ Room details coming soon…
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-matches">
            <h2>कोई मैच नहीं मिला</h2>
            <button onClick={() => setInputVisible(true)}>
              Enter BGMI ID
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyMatches;

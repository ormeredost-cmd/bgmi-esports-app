// src/pages/TournamentDetails.jsx - CLEAN + DIRECT JOIN + LOADING
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { tournamentsSample } from "../data/tournamentsSample";
import "./TournamentDetails.css";

const TournamentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [isJoined, setIsJoined] = useState(false);
  const [isFull, setIsFull] = useState(false);
  const [liveSlots, setLiveSlots] = useState(0);
  const [isLoading, setIsLoading] = useState(false); // 🔄 LOADING STATE

  const API_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:5002"
      : "https://deposit-and-join-tournament-server.onrender.com";

  const checkStatus = useCallback(async () => {
    const bgmiId = localStorage.getItem("tempBgmiId") || localStorage.getItem("lastBgmiId");
    
    if (!bgmiId) return;

    try {
      const joinUrl = `${API_URL}/api/check-join/${id}?bgmiId=${bgmiId}`;
      const joinRes = await fetch(joinUrl);
      const joinData = await joinRes.json();
      setIsJoined(joinData.joined);

      const slotsRes = await fetch(`${API_URL}/api/tournament-slots-count/${id}`);
      const slotsData = await slotsRes.json();
      
      const count = slotsData.registered || 0;
      setLiveSlots(count);
      setIsFull(count >= 2);
    } catch (error) {
      console.error("Status check failed:", error);
    }
  }, [id, API_URL]);

  useEffect(() => {
    if (!id) return;
    checkStatus();
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, [id, checkStatus]);

  const t = tournamentsSample.find((x) => x.id === id);

  if (!t) {
    return (
      <div className="tdm-page">
        <div className="tdm-container">
          <div className="tdm-header">
            <h1 className="tdm-title">Tournament Not Found</h1>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const playerName = e.target.bgmiIdName.value.trim();
    const bgmiId = e.target.bgmiIdNumber.value.trim();

    if (!playerName || !bgmiId) return;

    setIsLoading(true); // 🔄 START LOADING

    const now = new Date();
    const realDate = now.toLocaleDateString("en-IN");
    const realTime = now.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const profileName = localStorage.getItem("profileName") || "";
    const profileId = localStorage.getItem("profileId") || "";

    const joinedMatch = {
      tournamentId: t.id,
      tournamentName: t.name,
      playerName,
      bgmiId,
      profileName,
      profileId,
      mode: t.mode,
      rulesShort: t.rulesShort,
      date: realDate,
      time: realTime,
      map: t.map || "Erangel",
      entryFee: Number(t.entryFee),
      prizePool: Number(t.prizePool),
      slots: liveSlots,
    };

    try {
      const response = await fetch(`${API_URL}/api/join-tournament`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(joinedMatch),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        localStorage.setItem("lastBgmiId", bgmiId);
        localStorage.setItem("tempBgmiId", bgmiId);
        navigate("/my-matches", { replace: true });
      }
    } catch (error) {
      console.error("Join error:", error);
    } finally {
      setIsLoading(false); // ✅ STOP LOADING (ALWAYS)
    }
  };

  return (
    <div className="tdm-page">
      <div className="tdm-container">
        <div className="tdm-header">
          <h1 className="tdm-title">{t.name}</h1>
          <p className="tdm-subtitle">
            Mode: {t.mode} • {t.rulesShort}
          </p>
        </div>

        <div className="tournament-info">
          <div className="info-card">
            <div className="info-label">Date & Time</div>
            <div className="info-value">{t.date} {t.time}</div>
          </div>

          <div className="info-card">
            <div className="info-label">Entry Fee</div>
            <div className="info-value">₹{t.entryFee}</div>
          </div>

          <div className="info-card">
            <div className="info-label">Prize Pool</div>
            <div className="info-value prize">₹{t.prizePool}</div>
          </div>

          <div className="info-card">
            <div className="info-label">Live Slots</div>
            <div className={`info-value slots ${isFull ? "full-slots" : ""}`}>
              {liveSlots}/2 {isFull && <span className="full-badge">FULL</span>}
            </div>
          </div>
        </div>

        <div className="register-section">
          {isFull ? (
            <div className="status-card full">
              <h3>🔴 Tournament Full ({liveSlots}/2)</h3>
              <p>Maximum 2 players allowed</p>
            </div>
          ) : isJoined ? (
            <div className="status-card joined">
              <h3>✅ Already Joined!</h3>
              <p>Check My Matches page</p>
            </div>
          ) : (
            <form className="register-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">🎮 BGMI ID NAME</label>
                <input
                  name="bgmiIdName"
                  type="text"
                  className="form-input"
                  required
                  placeholder="Enter your BGMI name"
                  maxLength={20}
                  disabled={isLoading} // 🔒 Disable during loading
                />
              </div>

              <div className="form-group">
                <label className="form-label">📱 BGMI ID NUMBER</label>
                <input
                  name="bgmiIdNumber"
                  type="text"
                  className="form-input"
                  required
                  placeholder="e.g. 51234567890"
                  maxLength={12}
                  disabled={isLoading} // 🔒 Disable during loading
                />
              </div>

              <div className="form-group">
                <label className="form-label">💰 Entry Fee</label>
                <input
                  type="text"
                  className="form-input"
                  value={`₹${t.entryFee}`}
                  readOnly
                  disabled={isLoading}
                />
              </div>

              <button 
                type="submit" 
                className="submit-btn"
                disabled={isLoading} // 🔒 Prevent double-click
              >
                {isLoading ? "⏳ Loading....." : "✅ Join Tournament"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default TournamentDetails;

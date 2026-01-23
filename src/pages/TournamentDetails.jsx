// src/pages/TournamentDetails.jsx - PRODUCTION READY

import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { tournamentsSample } from "../data/tournamentsSample";
import BackButton from "../components/BackButton";
import "./TournamentDetails.css";

const TournamentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [isJoined, setIsJoined] = useState(false);
  const [isFull, setIsFull] = useState(false);
  const [liveSlots, setLiveSlots] = useState(0);
  const [loading, setLoading] = useState(true);

  // 🔥 AUTO API (LOCAL + RENDER)
  const API_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:5002"
      : "https://bgmi-server-save-tournament-data.onrender.com";

  /* ===============================
     CHECK JOIN + SLOT STATUS
  ================================ */
  const checkStatus = useCallback(async () => {
    try {
      setLoading(true);

      const joinRes = await fetch(
        `${API_URL}/api/check-join/${id}`
      );
      const joinData = await joinRes.json();
      setIsJoined(joinData.joined);

      const slotsRes = await fetch(
        `${API_URL}/api/tournament-slots-count/${id}`
      );
      const slotsData = await slotsRes.json();

      const count = slotsData.registered || 0;
      setLiveSlots(count);
      setIsFull(count >= 2);
    } catch (error) {
      console.error("Status check failed:", error);
    } finally {
      setLoading(false);
    }
  }, [id, API_URL]);

  useEffect(() => {
    if (!id) return;
    checkStatus();
  }, [id, checkStatus]);

  const t = tournamentsSample.find((x) => x.id === id);

  if (!t) {
    return (
      <div className="tdm-page">
        <BackButton fallbackPath="/tournaments" className="back-btn" />
        <div className="tdm-container">
          <div className="tdm-header">
            <h1 className="tdm-title">Tournament Not Found</h1>
            <p className="tdm-subtitle">404 - Check tournament ID</p>
          </div>
        </div>
      </div>
    );
  }

  /* ===============================
     JOIN TOURNAMENT
  ================================ */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const playerName = e.target.bgmiIdName.value;
    const bgmiId = e.target.bgmiIdNumber.value;

    const now = new Date();
    const realDate = now.toLocaleDateString("en-IN");
    const realTime = now.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const joinedMatch = {
      tournamentId: t.id,
      tournamentName: t.name,
      mode: t.mode,
      rules: t.rulesShort,
      date: realDate,
      time: realTime,
      map: t.map || "Erangel",
      entryFee: t.entryFee,
      prizePool: t.prizePool,
      slots: liveSlots,
      status: "Registered",
      playerName,
      bgmiId,
      joinedAt: new Date().toISOString(),
    };

    try {
      const response = await fetch(
        `${API_URL}/api/join-tournament`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(joinedMatch),
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        localStorage.setItem("lastBgmiId", bgmiId);
        localStorage.setItem("tempBgmiId", bgmiId);
        navigate("/my-matches", { replace: true });
      } else {
        setLoading(false);
        alert(result.message || "Registration failed");
      }
    } catch (error) {
      setLoading(false);
      alert("❌ Server error. Try again.");
    }
  };

  /* ===============================
     LOADING STATE
  ================================ */
  if (loading && liveSlots === 0) {
    return (
      <div className="tdm-page">
        <BackButton fallbackPath="/tournaments" className="back-btn" />
        <div
          className="tdm-container"
          style={{ textAlign: "center", padding: "50px" }}
        >
          <h2>Loading Tournament...</h2>
        </div>
      </div>
    );
  }

  /* ===============================
     UI
  ================================ */
  return (
    <div className="tdm-page">
      <BackButton fallbackPath="/tournaments" className="back-btn" />

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
            <div className="info-value">
              {t.date} {t.time}
            </div>
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
            <div className="info-label">Slots</div>
            <div
              className={`info-value slots ${
                isFull ? "full-slots" : ""
              }`}
            >
              {liveSlots}/2{" "}
              {isFull && (
                <span className="full-badge">FULL</span>
              )}
            </div>
          </div>
        </div>

        <div className="register-section">
          {isFull ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px",
                opacity: 0.7,
              }}
            >
              <h3>🔴 Tournament Full (2/2)</h3>
              <p>Maximum 2 players allowed</p>
            </div>
          ) : isJoined ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px",
                opacity: 0.7,
              }}
            >
              <h3>✅ Already Joined</h3>
              <p>
                Check <strong>My Matches</strong>
              </p>
            </div>
          ) : (
            <form
              className="register-form"
              onSubmit={handleSubmit}
            >
              <div className="form-group">
                <label className="form-label">
                  BGMI ID NAME
                </label>
                <input
                  name="bgmiIdName"
                  type="text"
                  className="form-input"
                  required
                  placeholder="Enter your BGMI name"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  BGMI ID NUMBER
                </label>
                <input
                  name="bgmiIdNumber"
                  type="text"
                  className="form-input"
                  required
                  placeholder="e.g. 51234567890"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Payment Amount
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={`₹${t.entryFee}`}
                  readOnly
                />
              </div>

              <button
                type="submit"
                className="submit-btn"
                disabled={loading || isFull}
              >
                {loading
                  ? "Joining..."
                  : "✅ Submit Entry & Save"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default TournamentDetails;

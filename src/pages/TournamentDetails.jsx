// 🔥 SUPABASE FIXED + ONE TIME LOADING - Perfect!
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../supabaseClient";
import { tournamentsSample } from "../data/tournamentsSample";
import "./TournamentDetails.css";

const TournamentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isJoined, setIsJoined] = useState(false);
  const [isFull, setIsFull] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true); // 🔥 ONE TIME ONLY!
  const [liveSlots, setLiveSlots] = useState(0);
  const [maxSlots, setMaxSlots] = useState(2);
  const [isLoading, setIsLoading] = useState(false);
  const [balance, setBalance] = useState(0);
  const [user, setUser] = useState(null);
  
  const hasLoadedRef = useRef(false); // 🔥 STOP RELOADING!

  const API_URL = window.location.hostname === "localhost"
    ? "http://localhost:5002"
    : "https://deposit-and-join-tournament-server.onrender.com";

  const loadBalance = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("bgmi_user") || "{}");
      if (!storedUser.profile_id) return;

      const { data, error } = await supabase
        .from("registeruser")
        .select("balance, username")
        .eq("profile_id", storedUser.profile_id)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setBalance(Number(data.balance || 0));
        setUser({ ...storedUser, username: data.username });
        console.log("💰 Balance loaded:", data.balance);
      }
    } catch (err) {
      console.error("❌ Balance load error:", err);
      setBalance(0);
    }
  };

  const getBgmiIdForTournament = (tournamentId) => {
    try {
      const tournamentJoins = JSON.parse(localStorage.getItem('tournamentJoins') || '[]');
      const tournamentJoin = tournamentJoins.find(join => join.tournamentId === tournamentId);
      return tournamentJoin?.bgmiId || localStorage.getItem("tempBgmiId") || localStorage.getItem("lastBgmiId") || "";
    } catch {
      return localStorage.getItem("tempBgmiId") || localStorage.getItem("lastBgmiId") || "";
    }
  };

  // 🔥 ONE TIME INITIAL LOAD!
  const checkStatusInitial = useCallback(async () => {
    const bgmiId = getBgmiIdForTournament(id);
    if (!bgmiId) {
      setIsInitialLoading(false);
      return;
    }

    try {
      const joinUrl = `${API_URL}/api/check-join/${id}?bgmiId=${bgmiId}`;
      const joinRes = await fetch(joinUrl);
      const joinData = await joinRes.json();
      console.log(`📊 Initial ${id}:`, joinData.joined);
      setIsJoined(joinData.joined);

      const slotsRes = await fetch(`${API_URL}/api/tournament-slots-count/${id}`);
      const slotsData = await slotsRes.json();

      const count = slotsData.registered || 0;
      const max = slotsData.max || 2;
      setLiveSlots(count);
      setMaxSlots(max);
      setIsFull(count >= max);
    } catch (error) {
      console.error("Initial status check failed:", error);
      setIsJoined(false);
    } finally {
      setIsInitialLoading(false); // 🔥 LOADING END FOREVER!
      hasLoadedRef.current = true;
    }
  }, [id, API_URL]);

  // 🔥 BACKGROUND CHECK (No loading)
  const checkStatusBackground = useCallback(async () => {
    if (hasLoadedRef.current && (isJoined || isFull)) return; // 🔥 Already final = NO CHECK!

    const bgmiId = getBgmiIdForTournament(id);
    if (!bgmiId) return;

    try {
      const joinRes = await fetch(`${API_URL}/api/check-join/${id}?bgmiId=${bgmiId}`);
      const joinData = await joinRes.json();
      if (joinData.joined) {
        setIsJoined(true);
        hasLoadedRef.current = true; // 🔥 STOP ALL!
      }

      const slotsRes = await fetch(`${API_URL}/api/tournament-slots-count/${id}`);
      const slotsData = await slotsRes.json();
      const count = slotsData.registered || 0;
      const max = slotsData.max || 2;
      setLiveSlots(count);
      setMaxSlots(max);
      setIsFull(count >= max);
    } catch (error) {
      console.error("Background check failed:", error);
    }
  }, [id, API_URL, isJoined, isFull]);

  useEffect(() => {
    if (!id) return;
    
    // 🔥 ONE TIME LOAD
    loadBalance();
    checkStatusInitial();
    
    // 🔥 BACKGROUND CHECK (Silent - No loading)
    const interval = setInterval(checkStatusBackground, 10000); // 10s silent check
    return () => clearInterval(interval);
  }, [id, checkStatusInitial, checkStatusBackground]);

  const t = tournamentsSample.find((x) => x.id === id);

  if (!t) {
    return (
      <div className="tdm-page">
        <div className="tdm-container">
          <h1>Tournament Not Found</h1>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    const playerName = e.target.bgmiIdName.value.trim();
    const bgmiId = e.target.bgmiIdNumber.value.trim();
    
    if (!playerName || !bgmiId) {
      alert("❌ BGMI Name & ID daalo!");
      return;
    }

    if (!user?.profile_id) {
      alert("❌ Login karo pehle!");
      navigate("/login");
      return;
    }

    const entryFee = Number(t.entryFee);
    if (entryFee > 0 && balance < entryFee) {
      alert(`❌ Balance kam hai!\n💰 Chahiye: ₹${entryFee}\n💳 Hai: ₹${balance}`);
      return;
    }

    setIsLoading(true);
    const originalBalance = balance;

    try {
      if (entryFee > 0) {
        const { error } = await supabase
          .from("registeruser")
          .update({ balance: Math.max(0, balance - entryFee) })
          .eq("profile_id", user.profile_id);

        if (error) throw new Error(`Balance update fail: ${error.message}`);
        await loadBalance();
      }

      const tournamentJoins = JSON.parse(localStorage.getItem('tournamentJoins') || '[]');
      const newJoin = {
        tournamentId: t.id,
        bgmiId,
        playerName,
        timestamp: Date.now()
      };
      const updatedJoins = tournamentJoins.filter(join => join.tournamentId !== t.id).concat(newJoin);
      
      localStorage.setItem('tournamentJoins', JSON.stringify(updatedJoins));
      localStorage.setItem("tempBgmiId", bgmiId);
      localStorage.setItem("lastBgmiId", bgmiId);

      const now = new Date();
      const joinedMatch = {
        tournamentId: t.id,
        tournamentName: t.name,
        playerName,
        bgmiId,
        profileName: user.username || localStorage.getItem("profileName") || "",
        profileId: user.profile_id,
        mode: t.mode,
        rulesShort: t.rulesShort,
        date: now.toLocaleDateString("en-IN"),
        time: now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
        map: t.map || "Erangel",
        entryFee,
        prizePool: Number(t.prizePool),
        slots: maxSlots,
      };

      const response = await fetch(`${API_URL}/api/join-tournament`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(joinedMatch),
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        alert(`✅ JOIN SUCCESS!\n💰 Entry Fee: -₹${entryFee}\n🎮 My Matches me dekho!`);
        navigate("/my-matches", { replace: true });
      } else {
        throw new Error(result.error || "Server fail");
      }

    } catch (error) {
      if (entryFee > 0 && originalBalance !== balance) {
        await supabase
          .from("registeruser")
          .update({ balance: originalBalance })
          .eq("profile_id", user.profile_id);
        await loadBalance();
      }
      alert("❌ Join fail: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="tdm-page">
      <div className="tdm-container">
        <div className="tdm-header">
          <h1 className="tdm-title">{t.name}</h1>
          <p className="tdm-subtitle">Mode: {t.mode} • {t.rulesShort}</p>
        </div>

        <div className="tournament-info">
          <div className="info-card">
            <div className="info-label">💰 Entry Fee</div>
            <div className="info-value">₹{t.entryFee}</div>
          </div>
          <div className="info-card">
            <div className="info-label">💳 Wallet</div>
            <div className={`info-value ${balance >= Number(t.entryFee) ? "success" : "warning"}`}>
              ₹{balance.toLocaleString()}
              {balance < Number(t.entryFee) && <span className="insufficient"> ❌ Add Funds</span>}
            </div>
          </div>
          <div className="info-card">
            <div className="info-label">🏆 Prize</div>
            <div className="info-value prize">₹{t.prizePool}</div>
          </div>
          <div className="info-card">
            <div className="info-label">📊 Slots</div>
            <div className={`info-value slots ${isFull ? "full-slots" : ""}`}>
              {isInitialLoading ? "⏳" : `${liveSlots}/${maxSlots}`} 
              {isFull && !isInitialLoading && <span className="full-badge">FULL</span>}
            </div>
          </div>
        </div>

        <div className="register-section">
          {isInitialLoading ? (
            <div className="status-card loading">
              <h3>⏳ Checking Status...</h3>
              <p>Loading tournament data...</p>
            </div>
          ) : isFull ? (
            <div className="status-card full">
              <h3>🔴 Tournament FULL</h3>
            </div>
          ) : isJoined ? (
            <div className="status-card joined">
              <h3>✅ Already Joined!</h3>
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
                  placeholder="Your BGMI name"
                  maxLength={20}
                  disabled={isLoading}
                />
              </div>
              <div className="form-group">
                <label className="form-label">📱 BGMI ID NUMBER</label>
                <input
                  name="bgmiIdNumber"
                  type="text"
                  className="form-input"
                  required
                  placeholder="51234567890"
                  maxLength={12}
                  disabled={isLoading}
                />
              </div>
              <button
                type="submit"
                className={`submit-btn ${isLoading || balance < Number(t.entryFee) ? "disabled" : ""}`}
                disabled={isLoading || balance < Number(t.entryFee)}
              >
                {isLoading ? "⏳ Processing..." : `✅ JOIN (₹${t.entryFee})`}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default TournamentDetails;

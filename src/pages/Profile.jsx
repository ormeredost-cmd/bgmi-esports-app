import React, { useState, useEffect, useRef } from "react";
import "./Profile.css";

const API_URL = "http://localhost:5001";
const DEPOSIT_API = "http://localhost:5002";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("stats");
  const [deposits, setDeposits] = useState([]);
  const mainRef = useRef(null);

  /* =====================
     LOAD PROFILE
  ===================== */
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const stored = localStorage.getItem("bgmi_user");
        if (!stored) throw new Error("No login");

        const { token } = JSON.parse(stored);
        if (!token) throw new Error("No token");

        const res = await fetch(`${API_URL}/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Unauthorized");

        const user = await res.json();

        setProfile({
          id: user.profile_id,
          name: user.name,
          stats: {
            kdRatio: "5.2",
            winRate: "42%",
            totalMatches: "567",
            chickenDinners: "156",
            totalKills: "3248",
            avgDamage: "289",
          },
        });
      } catch (err) {
        console.error("PROFILE LOAD ERROR:", err);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  /* =====================
     LOAD DEPOSITS
  ===================== */
  useEffect(() => {
    const fetchDeposits = async () => {
      try {
        const res = await fetch(`${DEPOSIT_API}/api/admin/deposits`);
        const data = await res.json();

        const user = JSON.parse(localStorage.getItem("bgmi_user"));
        if (!user) return;

        const myDeposits = data.deposits.filter(
          d => d.profileId === user.profileId
        );

        setDeposits(myDeposits.reverse());
      } catch {
        console.log("Deposit load error");
      }
    };

    fetchDeposits();
  }, []);

  /* =====================
     KEYBOARD FIX
  ===================== */
  useEffect(() => {
    let initialHeight = window.innerHeight;

    const handleResize = () => {
      const currentHeight = window.innerHeight;
      const isOpen = currentHeight < initialHeight * 0.9;
      setKeyboardOpen(isOpen);
      if (!isOpen) initialHeight = currentHeight;
    };

    window.visualViewport?.addEventListener("resize", handleResize);
    window.addEventListener("resize", handleResize);

    return () => {
      window.visualViewport?.removeEventListener("resize", handleResize);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  if (loading) return <div className="loading">🔄 Loading...</div>;
  if (!profile) return <div className="loading">❌ No profile</div>;

  const walletBalance = deposits
    .filter(d => d.status === "approved")
    .reduce((sum, d) => sum + Number(d.amount), 0);

  return (
    <div
      className={`esports-profile ${keyboardOpen ? "keyboard-open" : ""}`}
      ref={mainRef}
    >
      {/* ================= HEADER ================= */}
      <header className="profile-header">
        <div className="player-card">
          <div className="player-avatar">
            <div className="avatar-circle">
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                  profile.name
                )}&background=1e40af&color=fff&size=512`}
                alt="Avatar"
              />
            </div>
          </div>

          <div className="player-details">
            <h1 className="gamer-name">{profile.name}</h1>
            <div className="id-row">
              <span>Profile ID:</span>
              <strong>{profile.id}</strong>
            </div>
          </div>
        </div>
      </header>

      {/* ================= TABS ================= */}
      <div className="profile-tabs">
        <button
          className={activeTab === "stats" ? "active" : ""}
          onClick={() => setActiveTab("stats")}
        >
          📊 Stats
        </button>
        <button
          className={activeTab === "wallet" ? "active" : ""}
          onClick={() => setActiveTab("wallet")}
        >
          💰 Wallet
        </button>
      </div>

      {/* ================= STATS ================= */}
      {activeTab === "stats" && (
        <section className="stats-section">
          <h2>📊 Performance Stats</h2>
          <div className="stats-grid">
            {Object.entries(profile.stats).map(([key, value]) => (
              <div key={key} className="stat-box">
                <div className="stat-value">{value}</div>
                <div>{key.replace(/([A-Z])/g, " $1")}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ================= WALLET ================= */}
      {activeTab === "wallet" && (
        <section className="stats-section">
          <h2>💰 Wallet Overview</h2>

          {/* WALLET CARD */}
          <div className="stats-grid">
            <div className="stat-box">
              <div className="stat-value">₹{walletBalance}</div>
              <div>Approved Balance</div>
            </div>

            <div className="stat-box">
              <div className="stat-value">{deposits.length}</div>
              <div>Total Deposits</div>
            </div>
          </div>

          {/* DEPOSIT HISTORY */}
          <h2 style={{ marginTop: "35px" }}>🧾 Deposit History</h2>

          {deposits.length === 0 ? (
            <div className="stat-box">
              <div className="stat-value">—</div>
              <div>No Deposits Found</div>
            </div>
          ) : (
            <div className="stats-grid">
              {deposits.map(d => (
                <div key={d.depositId} className="stat-box">
                  <div className="stat-value">₹{d.amount}</div>
                  <div>UTR: {d.utr}</div>
                  <div style={{ marginTop: "6px", fontSize: "0.7rem" }}>
                    Status: {d.status.toUpperCase()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default Profile;

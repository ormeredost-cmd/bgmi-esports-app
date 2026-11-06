
import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import TournamentCard from "../components/TournamentCard";
import "./Tournaments.css";

// ============================================================
// API CONFIGURATION
// ============================================================

const TOURNAMENT_API = (
  process.env.REACT_APP_TOURNAMENT_API_URL ||
  (window.location.hostname === "localhost"
    ? "http://localhost:5005"
    : "")
).replace(/\/+$/, "");

// ============================================================
// HELPERS
// ============================================================

const getJson = async (response) => {
  const text = await response.text();

  let data = {};

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    throw new Error("Server ne invalid response bheja.");
  }

  if (!response.ok) {
    throw new Error(
      data.message || data.error || `Server error: ${response.status}`
    );
  }

  return data;
};

// API response ko TournamentCard ke expected format me convert karna
const normalizeTournament = (t) => {
  const entryFee = Number(t.entryFee ?? t.entry_fee ?? 0);
  const prizePool = Number(t.prizePool ?? t.prize_pool ?? 0);
  const perKill = Number(t.perKill ?? t.per_kill ?? 0);
  const totalSlots = Number(
    t.totalSlots ?? t.slots ?? t.maxSlots ?? 0
  );
  const joinedPlayers = Number(
    t.joinedPlayers ?? t.registered ?? 0
  );

  return {
    ...t,

    id: t.id || t.tournament_id,
    tournament_id: t.tournament_id || t.id,

    name: t.name || t.tournament_name || "Untitled Tournament",
    tournament_name:
      t.tournament_name || t.name || "Untitled Tournament",

    mode: t.mode || t.game_mode || "",
    game_mode: t.game_mode || t.mode || "",

    type: t.type || t.match_type || "",
    match_type: t.match_type || t.type || "",

    map: t.map || "Erangel",

    date: t.date || "",
    time: t.time || "",

    entryFee,
    entry_fee: entryFee,

    prizePool,
    prize_pool: prizePool,

    perKill,
    per_kill: perKill,

    totalSlots,
    slots: totalSlots,
    maxSlots: totalSlots,

    joinedPlayers,
    registered: joinedPlayers,

    description: t.description || "",
    rules: t.rules || t.description || "",
    rulesShort:
      t.rulesShort ||
      t.description ||
      t.rules ||
      t.match_type ||
      "",

    image: t.image || t.image_url || "",
    image_url: t.image_url || t.image || "",

    status: t.status || t.tournament_status || "Upcoming",
    tournament_status:
      t.tournament_status || t.status || "Upcoming",

    published: t.published,
    is_visible: t.is_visible,
    is_hidden: t.is_hidden,

    created_at: t.created_at || null,
  };
};

// ============================================================
// COMPONENT
// ============================================================

const Tournaments = () => {
  const [searchParams] = useSearchParams();

  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // URL se mode read karo
  const rawMode = searchParams.get("mode") || "all";
  const mode = rawMode.toLowerCase();

  // String normalization
  const normalize = (str = "") =>
    String(str).toLowerCase().replace(/\s+/g, "");

  // URL mode ko internal filter key me convert karo
  const getModeKeyFromQuery = (m) => {
    if (m === "all") return "all";
    if (m.includes("1v1")) return "1v1";
    if (m.includes("2v2")) return "2v2";
    if (m.includes("4v4")) return "4v4";

    return "all";
  };

  const modeKey = getModeKeyFromQuery(mode);

  // Tournament mode identify karo
  const getModeKeyFromTournament = (tMode) => {
    const nm = normalize(tMode);

    if (nm.includes("1v1")) return "1v1";
    if (nm.includes("2v2")) return "2v2";
    if (nm.includes("4v4")) return "4v4";

    return "all";
  };

  // ============================================================
  // FETCH REAL TOURNAMENTS
  // ============================================================

  const fetchTournaments = useCallback(async () => {
    if (!TOURNAMENT_API) {
      setError(
        "Tournament API URL configured nahi hai. Production environment me REACT_APP_TOURNAMENT_API_URL set karo."
      );
      setLoading(false);
      return;
    }

    try {
      setError("");

      const response = await fetch(
        `${TOURNAMENT_API}/api/tournaments`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          cache: "no-store",
        }
      );

      const data = await getJson(response);

      // API array ya object ke andar tournaments return kar sakti hai
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data.tournaments)
        ? data.tournaments
        : Array.isArray(data.data)
        ? data.data
        : [];

      const normalized = list
        .map(normalizeTournament)
        .filter((t) => t.id);

      setTournaments(normalized);
    } catch (err) {
      console.error("Tournament Fetch Error:", err);

      setError(
        err.message ||
          "Tournaments load nahi ho paaye. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTournaments();

    // Har 30 seconds me list refresh
    const interval = setInterval(() => {
      fetchTournaments();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchTournaments]);

  // ============================================================
  // FILTER TOURNAMENTS
  // ============================================================

  const filteredTournaments = tournaments.filter((t) => {
    if (modeKey === "all") return true;

    const tournamentMode = getModeKeyFromTournament(t.mode);

    return tournamentMode === modeKey;
  });

  // ============================================================
  // PAGE TITLE
  // ============================================================

  const getModeTitle = (key) => {
    const titles = {
      all: "All Tournaments",
      "1v1": "1v1 TDM",
      "2v2": "2v2 TDM",
      "4v4": "4v4 TDM",
    };

    return titles[key] || "All Tournaments";
  };

  // ============================================================
  // RETRY
  // ============================================================

  const handleRetry = () => {
    setLoading(true);
    fetchTournaments();
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="tournaments-page">
      <div className="tournaments-container">
        <header className="page-header">
          <h1>{getModeTitle(modeKey)}</h1>

          <p className="tournaments-count">
            ({loading ? "..." : filteredTournaments.length})
          </p>
        </header>

        <div className="tournaments-section">
          <div className="tour-grid-wrapper">
            <div className="tour-grid">

              {/* LOADING */}
              {loading && (
                <div className="no-tournaments">
                  <h3>Loading Tournaments...</h3>
                  <p>Please wait while we fetch tournaments.</p>
                </div>
              )}

              {/* ERROR */}
              {!loading && error && (
                <div className="no-tournaments">
                  <h3>Unable to Load Tournaments</h3>
                  <p>{error}</p>

                  <button
                    type="button"
                    onClick={handleRetry}
                    className="retry-button"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {/* TOURNAMENT CARDS */}
              {!loading &&
                !error &&
                filteredTournaments.length > 0 &&
                filteredTournaments.map((t) => (
                  <TournamentCard
                    key={t.id}
                    t={t}
                  />
                ))}

              {/* EMPTY STATE */}
              {!loading &&
                !error &&
                filteredTournaments.length === 0 && (
                  <div className="no-tournaments">
                    <h3>कोई टूर्नामेंट नहीं मिला</h3>
                    <p>
                      No tournaments available for this mode.
                    </p>
                  </div>
                )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tournaments;

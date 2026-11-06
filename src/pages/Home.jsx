
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import TournamentCard from "../components/TournamentCard";

const TOURNAMENT_API =
  window.location.hostname === "localhost"
    ? "http://localhost:5005"
    : process.env.REACT_APP_TOURNAMENT_API_URL;

const Home = () => {
  const [featured, setFeatured] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // ==========================================
  // FETCH LIVE TOURNAMENTS FROM ADMIN SERVER
  // ==========================================

  const fetchTournaments = useCallback(async (signal) => {
    try {
      setError("");

      if (!TOURNAMENT_API) {
        throw new Error(
          "Tournament API URL is not configured. Please check your environment variables."
        );
      }

      const response = await fetch(
        `${TOURNAMENT_API}/api/tournaments`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          signal,
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Unable to load tournaments. Please try again."
        );
      }

      // API response handling
      const tournamentList = Array.isArray(data)
        ? data
        : Array.isArray(data.tournaments)
        ? data.tournaments
        : Array.isArray(data.data)
        ? data.data
        : [];

      setFeatured(tournamentList);
    } catch (err) {
      if (err.name === "AbortError") return;

      console.error("HOME TOURNAMENT FETCH ERROR:", err);

      setError(
        err.message || "Something went wrong while loading tournaments."
      );
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    fetchTournaments(controller.signal);

    return () => {
      controller.abort();
    };
  }, [fetchTournaments]);

  // ==========================================
  // MOBILE VIEWPORT FIX
  // ==========================================

  useEffect(() => {
    const setVH = () => {
      document.documentElement.style.setProperty(
        "--vh",
        `${window.innerHeight * 0.01}px`
      );
    };

    setVH();

    window.addEventListener("resize", setVH);

    return () => {
      window.removeEventListener("resize", setVH);
    };
  }, []);

  // ==========================================
  // CATEGORY NAVIGATION
  // ==========================================

  const handleCategoryClick = (cat) => {
    const params = new URLSearchParams();

    if (cat !== "All") {
      params.set("mode", cat);
    }

    navigate(`/tournaments?${params.toString()}`);

    setOpen(false);
  };

  // ==========================================
  // RETRY FETCH
  // ==========================================

  const handleRetry = () => {
    setLoading(true);
    setError("");

    const controller = new AbortController();

    fetchTournaments(controller.signal);
  };

  return (
    <div className="page-esports">
      {/* ================= HERO SECTION ================= */}

      <section className="hero">
        <div className="hero-left">
          <h1 className="hero-title">
            <span className="hero-title-main">BGMI</span>
            <span className="hero-title-accent">ESPORTS</span>
          </h1>

          <div className="hero-actions">
            <div className="all-tour-wrapper">
              <button
                type="button"
                className="hero-btn-primary all-tour-btn all-tour-btn-red"
                onClick={() => setOpen((o) => !o)}
              >
                <span>
                  All Tournaments ({featured.length})
                </span>

                <span
                  className={`all-tour-arrow ${
                    open ? "open" : ""
                  }`}
                >
                  ▼
                </span>
              </button>

              {open && (
                <div className="all-tour-dropdown">
                  {[
                    "All",
                    "1v1 TDM",
                    "2v2 TDM",
                    "4v4 TDM",
                  ].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      className="all-tour-item"
                      onClick={() => handleCategoryClick(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="hero-right">
          <div className="hero-glow" />
        </div>
      </section>

      {/* ================= TOURNAMENT SECTION ================= */}

      <section className="tournaments-section">
        <div className="tour-grid-wrapper">
          {/* LOADING STATE */}

          {loading && (
            <div className="home-loading">
              <div className="home-loader" />

              <p>Loading tournaments...</p>
            </div>
          )}

          {/* ERROR STATE */}

          {!loading && error && (
            <div className="home-error">
              <h3>Unable to Load Tournaments</h3>

              <p>{error}</p>

              <button
                type="button"
                onClick={handleRetry}
              >
                Try Again
              </button>
            </div>
          )}

          {/* EMPTY STATE */}

          {!loading && !error && featured.length === 0 && (
            <div className="home-empty">
              <h3>No Tournaments Available</h3>

              <p>
                New tournaments will appear here once they are
                published by the admin.
              </p>
            </div>
          )}

          {/* TOURNAMENT CARDS */}

          {!loading && !error && featured.length > 0 && (
            <div className="tour-grid">
              {featured.map((t) => (
                <TournamentCard
                  key={t.id || t.tournament_id}
                  t={t}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;

import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { tournamentsSample } from "../data/tournamentsSample";
import TournamentCard from "../components/TournamentCard";

const Home = () => {
  const featured = tournamentsSample;
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  // 🔥 Mobile viewport fix
  useEffect(() => {
    const setVH = () => {
      document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
    };
    setVH();
    window.addEventListener('resize', setVH);
    return () => window.removeEventListener('resize', setVH);
  }, []);

  const handleCategoryClick = (cat) => {
    const params = new URLSearchParams();
    if (cat !== "All") params.set("mode", cat);
    navigate(`/tournaments?${params.toString()}`);
    setOpen(false);
  };

  return (
    <div className="page-esports">
      <section className="hero">
        <div className="hero-left">
          <h1>BGMI Esports</h1>
          <div className="hero-actions">
            <div className="all-tour-wrapper">
              <button
                type="button"
                className="hero-btn-primary all-tour-btn"
                onClick={() => setOpen((o) => !o)}
              >
                <span>All Tournaments ({tournamentsSample.length})</span>
                <span className={`all-tour-arrow ${open ? "open" : ""}`}>
                  ▼
                </span>
              </button>
              {open && (
                <div className="all-tour-dropdown">
                  {["All", "1v1 TDM", "2v2 TDM", "4v4 TDM"].map((cat) => (
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

      <section className="tournaments-section">
        <div className="tour-grid-wrapper">
          <div className="tour-grid">
            {featured.map((t) => (
              <TournamentCard key={t.id} t={t} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

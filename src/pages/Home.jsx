import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { tournamentsSample } from "../data/tournamentsSample";
import TournamentCard from "../components/TournamentCard";

const Home = () => {
  // 🔥 FIXED: SAB TOURNAMENTS SHOW KARO (6 cards!)
  const featured = tournamentsSample;  // ← YE CHANGE KIA!

  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

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
          <p>
            Join custom BGMI tournaments, 1v1 TDM fights and classic scrims.
            Register in seconds and track your matches in real-time.
          </p>

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

      <section className="section">
        <div className="section-header">
          <h2>Available Tournaments ({featured.length})</h2>
         
        </div>

        <div className="tour-grid">
          {featured.map((t) => (
            <TournamentCard key={t.id} t={t} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;

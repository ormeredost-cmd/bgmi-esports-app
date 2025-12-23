import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { tournamentsSample } from "../data/tournamentsSample";
import TournamentCard from "../components/TournamentCard";
import BackButton from "../components/BackButton";

const Tournaments = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const initialMode = params.get("mode") || "All";

  const [category, setCategory] = useState(initialMode);

  useEffect(() => {
    const p = new URLSearchParams(location.search);
    setCategory(p.get("mode") || "All");
  }, [location.search]);

  // ab data me sirf tm1, tm3 (TDM) hi hain
  const filtered = tournamentsSample.filter((t) => {
    if (category === "All") return true;
    if (category === "1v1 TDM") return t.mode === "1v1 TDM";
    if (category === "2v2 TDM") return t.mode === "2v2 TDM";
    if (category === "4v4 TDM") return t.mode === "4v4 TDM";
    return true;
  });

  return (
    <div className="page-esports">
      {/* Top-left fixed back button */}
      <BackButton fallbackPath="/" />

      <div className="section-header">
        <h2>All Tournaments</h2>
      </div>

      {/* Sirf current category chip dikhegi */}
      <div className="category-row">
        <span className="category-chip category-chip-active">
          {category === "All" ? "All" : category}
        </span>
      </div>

      <div className="tour-grid">
        {filtered.map((t) => (
          <TournamentCard key={t.id} t={t} />
        ))}
        {filtered.length === 0 && (
          <p className="empty-text">No tournaments for this category.</p>
        )}
      </div>
    </div>
  );
};

export default Tournaments;

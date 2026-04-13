// src/pages/Tournaments.jsx
import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import TournamentCard from "../components/TournamentCard";
import { tournamentsSample } from "../data/tournamentsSample";
import BackButton from "../components/BackButton";
import "./Tournaments.css";

const Tournaments = () => {
  const [searchParams] = useSearchParams();
  const [filteredTournaments, setFilteredTournaments] = useState([]);

  // URL se mode le, default "all"
  const rawMode = searchParams.get("mode") || "all";
  const mode = rawMode.toLowerCase(); // normalize

  // normalize helper: strings ko lowercase + spaces remove
  const normalize = (str = "") => str.toLowerCase().replace(/\s+/g, "");

  // URL mode -> internal filter keys
  // ?mode=1v1 -> "1v1", ?mode=2v2 -> "2v2", ?mode=4v4 -> "4v4"
  const getModeKeyFromQuery = (m) => {
    if (m === "all") return "all";
    if (m === "1v1") return "1v1";
    if (m === "2v2") return "2v2";
    if (m === "4v4") return "4v4";
    // agar direct "1v1 tdm" aaya ho toh bhi handle
    if (m.includes("1v1")) return "1v1";
    if (m.includes("2v2")) return "2v2";
    if (m.includes("4v4")) return "4v4";
    return "all";
  };

  const modeKey = getModeKeyFromQuery(mode);

  // ek tournament kis bucket me aata hai (1v1 / 2v2 / 4v4)
  const getModeKeyFromTournament = (tMode) => {
    const nm = normalize(tMode); // eg: "solo1v1", "duo2v2", "squad4v4"
    if (nm.includes("1v1")) return "1v1";
    if (nm.includes("2v2")) return "2v2";
    if (nm.includes("4v4")) return "4v4";
    return "all";
  };

  useEffect(() => {
    const filtered = tournamentsSample.filter((t) => {
      if (modeKey === "all") return true;
      const tmKey = getModeKeyFromTournament(t.mode);
      return tmKey === modeKey;
    });

    setFilteredTournaments(filtered);
  }, [modeKey]);

  const getModeTitle = (modeKey) => {
    const titles = {
      all: "All Tournaments",
      "1v1": "1v1 TDM",
      "2v2": "2v2 TDM",
      "4v4": "4v4 TDM"
    };
    return titles[modeKey] || "All Tournaments";
  };

  return (
    <div className="tournaments-page">
      <BackButton fallbackPath="/" />

      <div className="tournaments-container">
        <header className="page-header">
          <h1>{getModeTitle(modeKey)}</h1>
          <p className="tournaments-count">({filteredTournaments.length})</p>
        </header>

        <div className="tournaments-section">
          <div className="tour-grid-wrapper">
            <div className="tour-grid">
              {filteredTournaments.length > 0 ? (
                filteredTournaments.map((t) => (
                  <TournamentCard key={t.id} t={t} />
                ))
              ) : (
                <div className="no-tournaments">
                  <h3>कोई टूर्नामेंट नहीं मिला</h3>
                  <p>No tournaments available for this mode</p>
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
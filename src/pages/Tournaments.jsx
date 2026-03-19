import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import TournamentCard from '../components/TournamentCard';
import { tournamentsSample } from '../data/tournamentsSample';
import BackButton from '../components/BackButton';
import "./Tournaments.css";

const Tournaments = () => {
  const [searchParams] = useSearchParams();
  const [filteredTournaments, setFilteredTournaments] = useState([]);
  const mode = searchParams.get('mode') || 'All';

  useEffect(() => {
    const filtered = tournamentsSample.filter(t => 
      mode === 'All' || t.mode === mode
    );
    setFilteredTournaments(filtered);
  }, [mode]);

  const getModeTitle = (mode) => {
    const titles = {
      'All': 'All Tournaments',
      '1v1 TDM': '1v1 TDM',
      '2v2 TDM': '2v2 TDM', 
      '4v4 TDM': '4v4 TDM'
    };
    return titles[mode] || mode;
  };

  return (
    <div className="tournaments-page">
      {/* 🔥 BACKBUTTON - FIXED POSITION (CSS handle karega) */}
      <BackButton fallbackPath="/" />
      
      <div className="tournaments-container">
        <header className="page-header">
          <h1>{getModeTitle(mode)}</h1>
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

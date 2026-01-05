import { useParams } from "react-router-dom";
import { tournamentsSample } from "../data/tournamentsSample";
import BackButton from "../components/BackButton";
import './TournamentDetails.css';

const TournamentDetails = () => {
  const { id } = useParams();
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

  const handleRegister = (e) => {
    e.preventDefault();
    alert(`✅ Registered for ${t.name}!\nPlayer ID: ${e.target.playerId.value}\nTeam: ${e.target.teamName.value}`);
  };

  return (
    <div className="tdm-page">
      <BackButton fallbackPath="/tournaments" className="back-btn" />
      
      <div className="tdm-container">
        <div className="tdm-header">
          <h1 className="tdm-title">{t.name}</h1>
          <p className="tdm-subtitle">Mode: {t.mode} • {t.rulesShort}</p>
        </div>

        <div className="tournament-info">
          <div className="info-card">
            <div className="info-label">Date & Time</div>
            <div className="info-value">{t.date} {t.time}</div>
          </div>
          <div className="info-card">
            <div className="info-label">Entry Fee</div>
            <div className="info-value">₹{t.entryFee}</div>
          </div>
          <div className="info-card">
            <div className="info-label">Prize Pool</div>
            <div className="info-value">₹{t.prizePool}</div>
          </div>
          <div className="info-card">
            <div className="info-label">Slots</div>
            <div className="info-value">{t.registered}/{t.maxSlots}</div>
          </div>
        </div>

        <div className="register-section">
          <form className="register-form" onSubmit={handleRegister}>
            <div className="form-group">
              <label className="form-label">BGMI Player ID</label>
              <input name="playerId" type="text" className="form-input" placeholder="BGMI-EB7XR" required />
            </div>
            <div className="form-group">
              <label className="form-label">Team Name</label>
              <input name="teamName" type="text" className="form-input" placeholder="Enter Team Name" required />
            </div>
            <button type="submit" className="register-btn">🚀 Register Now</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TournamentDetails;

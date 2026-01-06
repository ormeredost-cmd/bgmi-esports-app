// TournamentDetails.jsx - EXACT BHARAT BHARAT SPEC
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

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`✅ Submitted!\nBGMI ID NAME: ${e.target.bgmiIdName.value}\nBGMI ID NUMBER: ${e.target.bgmiIdNumber.value}\nPayment: ₹50`);
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
            <div className="info-value prize">₹{t.prizePool}</div>
          </div>
          <div className="info-card">
            <div className="info-label">Slots</div>
            <div className="info-value slots" data-total={`/${t.maxSlots}`}>{t.registered}</div>
          </div>
        </div>
        <div className="register-section">
          <form className="register-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">BGMI ID NAME</label>
              <input name="bgmiIdName" type="text" className="form-input" placeholder="BGMI-EB7XR" required />
            </div>
            <div className="form-group">
              <label className="form-label">BGMI ID NUMBER</label>
              <input name="bgmiIdNumber" type="text" className="form-input" placeholder="BGMI-ABC123" required />
            </div>
            <div className="form-group">
              <label className="form-label">Payment Amount</label>
              <input name="payment" type="text" className="form-input" value="₹50" readOnly />
            </div>
            <button type="submit" className="submit-btn">✅ Submit Entry</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TournamentDetails;

// src/components/TournamentCard.jsx
import { Link } from "react-router-dom";
import "./TournamentCard.css";

const TournamentCard = ({ t }) => {
  const isTdm = t.type?.toLowerCase() === "tdm";

  return (
    <div className={`tour-card ${isTdm ? "tdm-card" : ""}`}>
      <div className="tour-header">
        {/* LEFT: BGMI pill */}
        <span className="tour-game">BGMI</span>

        {/* RIGHT: TDM / Classic tag */}
        <span className={`tour-tag ${t.type.toLowerCase()}`}>{t.type}</span>
      </div>

      {/* title without 1v1 box */}
      <h3 className="tour-title">{t.name}</h3>

      <p className="tour-meta">
        <span className="meta-label">Mode</span>
        <span className="meta-value">{t.mode}</span>
      </p>

      <p className="tour-meta">
        <span className="meta-label">Entry</span>
        <span className="meta-value highlight-money">{t.entryFee}</span>
      </p>

      <p className="tour-meta">
        <span className="meta-label">Winner Prize</span>
        <span className="meta-value highlight-prize">{t.prizePool}</span>
      </p>

      <div className="tour-footer">
        <span className="tour-slots">
          <span className="meta-label">Slots</span>
          <span className="meta-value">
            {t.registered}/{t.maxSlots}
          </span>
        </span>

        <Link to={`/tournaments/${t.id}`} className="btn-tour">
          View &amp; Register
        </Link>
      </div>
    </div>
  );
};

export default TournamentCard;

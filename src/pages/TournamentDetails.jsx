// src/pages/TournamentDetails.jsx
import { useParams } from "react-router-dom";
import { tournamentsSample } from "../data/tournamentsSample";
import BackButton from "../components/BackButton";

const TournamentDetails = () => {
  const { id } = useParams();
  const t = tournamentsSample.find((x) => x.id === id);

  if (!t) {
    return (
      <div className="page-esports">
        <BackButton fallbackPath="/tournaments" />

        <h2>404</h2>
        <p>Tournament not found.</p>
      </div>
    );
  }

  const handleRegister = (e) => {
    e.preventDefault();
    alert("Demo: Registration stored locally. Real app me API call hoga.");
  };

  return (
    <div className="page-esports">
      {/* top-left fixed back button */}
      <BackButton fallbackPath="/tournaments" />

      {/* Title ab tournamentsSample ke name se aayega (e.g. "1v1 TDM Tournament") */}
      <h2>{t.name}</h2>

      {/* Yahan sirf mode dikhayenge */}
      <p className="page-tagline">Mode: {t.mode}</p>

      <div className="details-grid">
        <div className="details-main">
          <h3>Overview</h3>
          <p>Date: {t.date}</p>
          <p>Time: {t.time}</p>

          {/* Entry fee 50 ₹ aur prize 80 ₹ tum data file me already set kar chuke ho */}
          <p>Entry Fee: {t.entryFee}</p>
          <p>Prize Pool: {t.prizePool}</p>

          {/* 1v1 ke liye slots 2 hi honge (0/2, 1/2, 2/2) */}
          <p>
            Slots: {t.registered}/{t.maxSlots}
          </p>

          <h3>Rules</h3>
          <p>{t.rulesShort}</p>
        </div>

        <div className="details-side">
          <h3>Register</h3>
          <form className="form-stack" onSubmit={handleRegister}>
            <input type="text" placeholder="Player Name" required />
            <input type="text" placeholder="BGMI ID" required />
            <input type="email" placeholder="Email" required />
            <button type="submit" className="hero-btn-primary">
              Register Now
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TournamentDetails;

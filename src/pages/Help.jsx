// src/pages/Help.jsx
const Help = () => {
  return (
    <div className="page-esports">
      <h2>Help & Rules</h2>
      <p className="page-tagline">
        Basic rules and support information for BGMI tournaments.
      </p>

      <ul className="help-list">
        <li>No hacks, scripts or emulators allowed in mobile-only events.</li>
        <li>Join room at least 10 minutes before match time.</li>
        <li>Check My Matches page for room ID and password.</li>
        <li>Abusive language or griefing can lead to permanent ban.</li>
        <li>For support, contact: support@bgmi-esports.local</li>
      </ul>
    </div>
  );
};

export default Help;

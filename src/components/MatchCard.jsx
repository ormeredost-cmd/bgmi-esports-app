// src/components/MatchCard.jsx
const MatchCard = ({ m }) => {
  return (
    <div className="match-card">
      <div className="match-top">
        <span className="match-mode">{m.mode}</span>
        <span className={`match-status ${m.status.toLowerCase()}`}>{m.status}</span>
      </div>
      <h4 className="match-title">{m.tournamentName}</h4>
      <p className="match-meta">
        Room ID: <strong>{m.roomId || "TBA"}</strong> • Password:{" "}
        <strong>{m.password || "TBA"}</strong>
      </p>
      <p className="match-meta">
        Time: {m.time} • Map: {m.map}
      </p>
      <p className="match-meta">
        Position: {m.position || "-"} • Kills: {m.kills ?? "-"}
      </p>
    </div>
  );
};

export default MatchCard;
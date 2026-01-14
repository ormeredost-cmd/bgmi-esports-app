// src/components/MatchCard.jsx - NEW TOURNAMENT VERSION
import "./MatchCard.css";

const MatchCard = ({ m }) => {
  if (!m) return null;

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short'
      });
    } catch {
      return 'Date not available';
    }
  };

  return (
    <div className="match-card">
      {/* 🔥 HEADER */}
      <div className="match-header">
        <div className="match-title-wrapper">
          <h3 className="match-title">{m.tournamentName || 'Tournament'}</h3>
          <span className={`status-badge status-${m.status?.toLowerCase() || 'registered'}`}>
            {m.status || 'Registered'}
          </span>
        </div>
      </div>

      {/* 🔥 TOURNAMENT DETAILS */}
      <div className="match-details">
        <div className="detail-row">
          <span className="detail-label">Mode:</span>
          <span className="detail-value">{m.mode || 'TDM'}</span>
        </div>

        {m.date && (
          <div className="detail-row">
            <span className="detail-label">Date:</span>
            <span className="detail-value">{m.date}</span>
          </div>
        )}

        {m.time && (
          <div className="detail-row">
            <span className="detail-label">Time:</span>
            <span className="detail-value">{m.time}</span>
          </div>
        )}

        <div className="detail-row">
          <span className="detail-label">Entry:</span>
          <span className="detail-value money">₹{m.entryFee || 0}</span>
        </div>

        <div className="detail-row">
          <span className="detail-label">Prize:</span>
          <span className="detail-value prize">₹{m.prizePool || 0}</span>
        </div>
      </div>

      {/* 🔥 DIVIDER */}
      <div className="card-divider"></div>

      {/* 🔥 YOUR INFO */}
      <div className="player-info">
        <h4 className="player-title">Your Details</h4>
        <div className="detail-row">
          <span className="detail-label">Player:</span>
          <span className="detail-value">{m.playerName || 'Player'}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">BGMI ID:</span>
          <span className="detail-value id">{m.bgmiId || 'ID'}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Joined:</span>
          <span className="detail-value">{formatDate(m.joinedAt)}</span>
        </div>
      </div>

      {/* 🔥 ROOM INFO - NEW */}
      {m.roomId && (
        <div className="room-info">
          <h4 className="room-title">Match Room</h4>
          <div className="detail-row">
            <span className="detail-label">Room ID:</span>
            <span className="detail-value room-id">{m.roomId}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Password:</span>
            <span className="detail-value room-password">{m.password || 'TBA'}</span>
          </div>
        </div>
      )}

      {/* 🔥 FOOTER */}
      <div className="match-footer">
        <span className="footer-note">
          {m.roomId ? 'Room details updated' : 'Room ID/Password will appear here'}
        </span>
        <div className={`status-dot status-${m.status?.toLowerCase() || 'registered'}`}></div>
      </div>
    </div>
  );
};

export default MatchCard;

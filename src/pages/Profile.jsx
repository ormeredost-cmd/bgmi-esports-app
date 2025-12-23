// src/pages/Profile.jsx
import { userSample } from "../data/userSample";

const Profile = () => {
  const u = userSample;

  return (
    <div className="page-esports">
      <h2>Player Profile</h2>
      <div className="profile-grid">
        <div className="profile-main">
          <h3>{u.username}</h3>
          <p>BGMI ID: {u.bgmiId}</p>
          <p>Email: {u.email}</p>
          <p>Device: {u.device}</p>
          <p>Joined: {u.joinedAt}</p>
        </div>
        <div className="profile-stats">
          <div>
            <span className="profile-label">Matches</span>
            <span className="profile-value">{u.totalMatches}</span>
          </div>
          <div>
            <span className="profile-label">Wins</span>
            <span className="profile-value">{u.wins}</span>
          </div>
          <div>
            <span className="profile-label">Top 5</span>
            <span className="profile-value">{u.top5}</span>
          </div>
          <div>
            <span className="profile-label">Best Kills</span>
            <span className="profile-value">{u.bestKills}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

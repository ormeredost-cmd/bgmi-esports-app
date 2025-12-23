// src/pages/MyMatches.jsx
import { matchesSample } from "../data/matchesSample";
import MatchCard from "../components/MatchCard";

const MyMatches = () => {
  return (
    <div className="page-esports">
      <h2>My Matches</h2>
      <p className="page-tagline">
        All tournaments where you are registered. Room ID and password will
        appear here when created by admin.
      </p>

      <div className="matches-grid">
        {matchesSample.map((m) => (
          <MatchCard key={m.id} m={m} />
        ))}
      </div>
    </div>
  );
};

export default MyMatches;

// src/components/Navbar.jsx
import { NavLink, useNavigate } from "react-router-dom";
import "./Navbar.css"; // <-- yeh line add karo

const Navbar = () => {
  const navigate = useNavigate();

  // user logged in? localStorage me bgmi_user hai to true
  const isAuthenticated = !!localStorage.getItem("bgmi_user");

  const handleLogout = () => {
    localStorage.removeItem("bgmi_user");
    navigate("/login", { replace: true });
  };

  return (
    <header className="nav-root">
      <div className="nav-left">
        <div className="nav-logo">
          <span className="nav-logo-main">BGMI</span>
          <span className="nav-logo-sub">Esports</span>
        </div>
      </div>

      <nav className="nav-links">
        <NavLink to="/" end className="nav-link">
          Home
        </NavLink>

        <NavLink to="/my-matches" className="nav-link">
          My Matches
        </NavLink>

        <NavLink to="/profile" className="nav-link">
          Profile
        </NavLink>

        <NavLink to="/help" className="nav-link">
          Help
        </NavLink>
      </nav>

      <div className="nav-right">
        {isAuthenticated && (
          <button
            type="button"
            className="nav-auth-btn"
            onClick={handleLogout}
          >
            Logout
          </button>
        )}
        {/* not authenticated ho to right side empty rahegi */}
      </div>
    </header>
  );
};

export default Navbar;

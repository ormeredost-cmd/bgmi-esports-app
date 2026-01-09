// src/components/Navbar.jsx
import { NavLink, useNavigate } from "react-router-dom";
import "./Navbar.css";

const Navbar = ({ variant = "bottom-tabs" }) => {
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem("bgmi_user");

  const handleLogout = () => {
    localStorage.removeItem("bgmi_user");
    navigate("/login", { replace: true });
  };

  if (variant === "top-logout") {
    return (
      <div className="nav-top-logout">
        {isAuthenticated && (
          <button type="button" className="nav-auth-btn" onClick={handleLogout}>
            Logout
          </button>
        )}
      </div>
    );
  }

  return (
    <nav className="nav-bottom">
      <NavLink 
        to="/" 
        end 
        className={({ isActive }) => `nav-tab ${isActive ? 'nav-tab-active' : ''}`}
      >
        <span className="nav-tab-label">Home</span>
      </NavLink>

      <NavLink 
        to="/my-matches" 
        className={({ isActive }) => `nav-tab ${isActive ? 'nav-tab-active' : ''}`}
      >
        <span className="nav-tab-label">My Matches</span>
      </NavLink>

      {/* YE LINE FIX KIA - GALAT THA PEHLE */}
      <NavLink 
        to="/profile" 
        className={({ isActive }) => `nav-tab ${isActive ? 'nav-tab-active' : ''}`}
      >
        <span className="nav-tab-label">Profile</span>
      </NavLink>

      <NavLink 
        to="/help" 
        className={({ isActive }) => `nav-tab ${isActive ? 'nav-tab-active' : ''}`}
      >
        <span className="nav-tab-label">Help</span>
      </NavLink>
    </nav>
  );
};

export default Navbar;

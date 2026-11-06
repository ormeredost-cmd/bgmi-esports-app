
import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

import NotificationBell from "./NotificationBell";

import "./Navbar.css";

const Navbar = ({ variant = "bottom-tabs" }) => {
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  const goTo = (path) => {
    setOpen(false);
    navigate(path);
  };

  const handleLogout = () => {
    setOpen(false);
    localStorage.removeItem("bgmi_user");
    navigate("/login", { replace: true });
  };

  // ==========================================
  // CLOSE DROPDOWN ON OUTSIDE CLICK / ESCAPE
  // ==========================================

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  // ==========================================
  // TOP MENU + NOTIFICATION BELL
  // ==========================================

  if (variant === "top-menu") {
    return (
      <div className="nav-top-menu">

        {/* NOTIFICATION + HAMBURGER IN ONE ROW */}
        <div className="top-menu-actions">

          {/* NOTIFICATION BELL */}
          <div className="top-menu-notification">
            <NotificationBell />
          </div>

          {/* HAMBURGER MENU */}
          <div className="menu-wrapper" ref={menuRef}>

            <button
              type="button"
              className={`menu-btn ${open ? "menu-btn-open" : ""}`}
              aria-label="Toggle navigation menu"
              aria-expanded={open}
              aria-haspopup="true"
              onClick={() => setOpen((previous) => !previous)}
            >
              <span className="menu-btn-icon">
                {open ? "✕" : "☰"}
              </span>
            </button>

            {open && (
              <div className="menu-dropdown">

                <div className="menu-dropdown-heading">
                  PLAYER MENU
                </div>

                {/* MATCH CENTER */}
                <button
                  type="button"
                  onClick={() => goTo("/live-matches")}
                >
                  <span className="menu-item-icon">⚔</span>
                  <span>Live Matches & History</span>
                </button>

                <div className="menu-divider" />

                {/* WALLET */}
                <button
                  type="button"
                  onClick={() => goTo("/wallet")}
                >
                  <span className="menu-item-icon">◈</span>
                  <span>Wallet</span>
                </button>

                {/* DEPOSIT HISTORY */}
                <button
                  type="button"
                  onClick={() => goTo("/deposit-history")}
                >
                  <span className="menu-item-icon">▤</span>
                  <span>Deposit History</span>
                </button>

                <div className="menu-divider" />

                {/* DEPOSIT */}
                <button
                  type="button"
                  onClick={() => goTo("/deposit")}
                >
                  <span className="menu-item-icon">＋</span>
                  <span>Deposit</span>
                </button>

                {/* WITHDRAW */}
                <button
                  type="button"
                  onClick={() => goTo("/withdraw")}
                >
                  <span className="menu-item-icon">－</span>
                  <span>Withdraw</span>
                </button>

                {/* WITHDRAW HISTORY */}
                <button
                  type="button"
                  onClick={() => goTo("/withdraw-history")}
                >
                  <span className="menu-item-icon">▤</span>
                  <span>Withdraw History</span>
                </button>

                {/* BANK DETAILS */}
                <button
                  type="button"
                  onClick={() => goTo("/bank-details")}
                >
                  <span className="menu-item-icon">▣</span>
                  <span>Bank Details</span>
                </button>

                <div className="menu-divider" />

                {/* LOGOUT */}
                <button
                  type="button"
                  className="menu-logout"
                  onClick={handleLogout}
                >
                  <span className="menu-item-icon">↪</span>
                  <span>Logout</span>
                </button>

              </div>
            )}

          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // BOTTOM NAVIGATION TABS
  // ==========================================

  const tabs = [
    { path: "/", label: "Home", icon: "⌂", end: true },
    { path: "/my-matches", label: "Join", icon: "⚔" },
    { path: "/profile", label: "Profile", icon: "♙" },
    { path: "/help", label: "Help", icon: "?" },
  ];

  return (
    <nav className="nav-bottom" aria-label="Main navigation">

      {tabs.map((tab) => (
        <NavLink
          key={tab.path}
          to={tab.path}
          end={tab.end || false}
          className={({ isActive }) =>
            `nav-tab ${isActive ? "nav-tab-active" : ""}`
          }
        >
          <span className="nav-tab-icon" aria-hidden="true">
            {tab.icon}
          </span>

          <span className="nav-tab-label">
            {tab.label}
          </span>
        </NavLink>
      ))}

    </nav>
  );
};

export default Navbar;

// src/components/Navbar.jsx
import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import "./Navbar.css";

const Navbar = ({ variant = "bottom-tabs" }) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const goTo = (path) => {
    setOpen(false);
    navigate(path);
  };

  const handleLogout = () => {
    setOpen(false);
    localStorage.removeItem("bgmi_user");
    navigate("/login", { replace: true });
  };

  /* =========================
     TOP MENU (☰ DROPDOWN)
  ========================== */
  if (variant === "top-menu") {
    return (
      <div className="nav-top-menu">
        <div className="menu-wrapper">
          <button
            className="menu-btn"
            onClick={() => setOpen(o => !o)}
          >
            ☰
          </button>

          {open && (
            <div className="menu-dropdown">
              {/* 💰 WALLET (DIRECT PAGE) */}
              <button onClick={() => goTo("/wallet")}>
                💰 Wallet
              </button>

              {/* 🧾 DEPOSIT HISTORY (SEPARATE PAGE) */}
              <button onClick={() => goTo("/deposit-history")}>
                🧾 Deposit History
              </button>

              {/* ➕ DEPOSIT */}
              <button onClick={() => goTo("/deposit")}>
                ➕ Deposit
              </button>

              {/* ➖ WITHDRAW */}
              <button onClick={() => goTo("/withdraw")}>
                ➖ Withdraw
              </button>

              {/* 🚪 LOGOUT */}
              <button
                className="menu-logout"
                onClick={handleLogout}
              >
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* =========================
     BOTTOM TABS
  ========================== */
  return (
    <nav className="nav-bottom">
      <NavLink to="/" end className="nav-tab">
        <span className="nav-tab-label">Home</span>
      </NavLink>

      <NavLink to="/my-matches" className="nav-tab">
        <span className="nav-tab-label">Join</span>
      </NavLink>

      <NavLink to="/profile" className="nav-tab">
        <span className="nav-tab-label">Profile</span>
      </NavLink>

      <NavLink to="/help" className="nav-tab">
        <span className="nav-tab-label">Help</span>
      </NavLink>
    </nav>
  );
};

export default Navbar;

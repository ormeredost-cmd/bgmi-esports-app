// src/App.jsx
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Tournaments from "./pages/Tournaments";
import TournamentDetails from "./pages/TournamentDetails";
import MyMatches from "./pages/MyMatches";
import Profile from "./pages/Profile";
import Wallet from "./pages/Wallet"; 
import DepositHistory from "./pages/DepositHistory"; // ✅ NEW IMPORT
import Help from "./pages/Help";
import Login from "./pages/Login";
import Register from "./pages/Register";

import Deposit from "./pages/Deposit";
import DepositQR from "./pages/DepositQR";

import ProtectedRoute from "./components/ProtectedRoute";
import "./styles/appTheme.css";

/* =========================
   MAIN LAYOUT
========================= */
const MainLayout = ({ children }) => {
  const location = useLocation();

  const hideLayout =
    location.pathname === "/login" ||
    location.pathname === "/register";

  if (hideLayout) {
    return children;
  }

  return (
    <div className="app-root-esports">
      {/* TOP BAR */}
      <header className="app-topbar">
        <div className="app-topbar-left">
          <span className="app-topbar-logo-main">BGMI</span>
          <span className="app-topbar-logo-sub">Esports</span>
        </div>

        <div className="app-topbar-right">
          <Navbar variant="top-menu" />
        </div>
      </header>

      {/* PAGE CONTENT */}
      <main className="app-main-esports has-bottom-nav">
        {children}
      </main>

      {/* BOTTOM NAV */}
      <Navbar variant="bottom-tabs" />
      <Footer />
    </div>
  );
};

/* =========================
   APP ROUTES
========================= */
function App() {
  return (
    <Router>
      <Routes>
        {/* PUBLIC */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* HOME */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Home />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* TOURNAMENTS */}
        <Route
          path="/tournaments"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Tournaments />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/tournaments/:id"
          element={
            <ProtectedRoute>
              <MainLayout>
                <TournamentDetails />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* MY MATCHES */}
        <Route
          path="/my-matches"
          element={
            <ProtectedRoute>
              <MainLayout>
                <MyMatches />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* WALLET */}
        <Route
          path="/wallet"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Wallet />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* ✅ DEPOSIT HISTORY - NEW ROUTE */}
        <Route
          path="/deposit-history"
          element={
            <ProtectedRoute>
              <MainLayout>
                <DepositHistory />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* DEPOSIT */}
        <Route
          path="/deposit"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Deposit />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* DEPOSIT QR */}
        <Route
          path="/deposit/qr"
          element={
            <ProtectedRoute>
              <MainLayout>
                <DepositQR />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* PROFILE */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Profile />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* HELP */}
        <Route
          path="/help"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Help />
              </MainLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;

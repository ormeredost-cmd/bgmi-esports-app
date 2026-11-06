
import { LoadingProvider } from "./context/LoadingContext";
import GlobalLoader from "./components/GlobalLoader";

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
import LiveMatches from "./pages/LiveMatches";

import Profile from "./pages/Profile";
import Wallet from "./pages/Wallet";
import DepositHistory from "./pages/DepositHistory";
import Help from "./pages/Help";
import Login from "./pages/Login";
import Register from "./pages/Register";

import Deposit from "./pages/Deposit";
import DepositQR from "./pages/DepositQR";
import Withdraw from "./pages/Withdraw";

import WithdrawHistory from "./pages/WithdrawHistory";
import BankDetails from "./pages/BankDetails";

import ProtectedRoute from "./components/ProtectedRoute";
import "./styles/appTheme.css";

// ============================================================
// MAIN LAYOUT
// ============================================================

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

      {/* TOP HEADER */}
      <header className="app-topbar">

        <div className="app-topbar-left">
          <img
            src="/assets/bgmi-logo.png"
            alt="BGMI Logo"
            className="app-topbar-logo-image"
          />
        </div>

        <div className="app-topbar-right">
          <Navbar variant="top-menu" />
        </div>

      </header>

      {/* PAGE CONTENT */}
      <main className="app-main-esports has-bottom-nav">
        {children}
      </main>

      {/* BOTTOM NAVIGATION */}
      <Navbar variant="bottom-tabs" />

      {/* FOOTER */}
      <Footer />

    </div>
  );
};

// ============================================================
// APP ROUTES
// ============================================================

function App() {
  return (
    <Router>

      <LoadingProvider>

        <GlobalLoader />

        <Routes>

          {/* ================================================
              PUBLIC ROUTES
              NO TOPBAR / BOTTOM NAVBAR
          ================================================= */}

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

          {/* ================================================
              PROTECTED ROUTES
              WITH FULL APP LAYOUT
          ================================================= */}

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

          {/* TOURNAMENT DETAILS */}
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

          {/* ================================================
              LIVE MATCHES & MATCH HISTORY
          ================================================= */}

          <Route
            path="/live-matches"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <LiveMatches />
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

          {/* DEPOSIT HISTORY */}
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

          {/* WITHDRAW HISTORY */}
          <Route
            path="/withdraw-history"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <WithdrawHistory />
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

          {/* WITHDRAW */}
          <Route
            path="/withdraw"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Withdraw />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* BANK DETAILS */}
          <Route
            path="/bank-details"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <BankDetails />
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

          {/* HELP / SUPPORT */}
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

      </LoadingProvider>

    </Router>
  );
}

export default App;

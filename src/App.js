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
import Help from "./pages/Help";
import Login from "./pages/Login";
import Register from "./pages/Register";

import ProtectedRoute from "./components/ProtectedRoute";
import "./styles/appTheme.css";

const MainLayout = ({ children }) => {
  const location = useLocation();

  const hideLayout =
    location.pathname === "/login" || location.pathname === "/register";

  if (hideLayout) {
    return children;
  }

  return (
    <div className="app-root-esports">
      {/* top bar only logout + logo */}
      <header className="app-topbar">
        <div className="app-topbar-left">
          <span className="app-topbar-logo-main">BGMI</span>
          <span className="app-topbar-logo-sub">Esports</span>
        </div>
        <div className="app-topbar-right">
          <Navbar variant="top-logout" />
        </div>
      </header>

      {/* page content with bottom padding for nav */}
      <main className="app-main-esports has-bottom-nav">{children}</main>

      {/* bottom navigation tabs */}
      <Navbar variant="bottom-tabs" />

      {/* optional footer (desktop ke liye zyda useful) */}
      <Footer />
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected + layout */}
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
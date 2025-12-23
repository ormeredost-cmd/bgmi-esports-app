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

/**
 * Layout only for main (protected) pages.
 * Login/Register iske bahar rahenge, isliye waha scroll issue nahi aayega.
 */
const MainLayout = ({ children }) => {
  const location = useLocation();

  // login/register pe navbar nahi chahiye (safety ke लिए, waise bhi use nahi karenge)
  const hideNavbar =
    location.pathname === "/login" || location.pathname === "/register";

  return (
    <div className="app-root-esports">
      {!hideNavbar && <Navbar />}
      <main className="app-main-esports">{children}</main>
      {!hideNavbar && <Footer />}
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        {/* ---------- Public auth routes (no layout, no footer) ---------- */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ---------- Protected routes with layout ---------- */}
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

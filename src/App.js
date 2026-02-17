// src/App.jsx - BANK DETAILS ROUTE ADDED ✅
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
import DepositHistory from "./pages/DepositHistory";
import Help from "./pages/Help";
import Login from "./pages/Login";
import Register from "./pages/Register";

import Deposit from "./pages/Deposit";
import DepositQR from "./pages/DepositQR";
import Withdraw from "./pages/Withdraw";

// 🔥 BANK DETAILS IMPORT ✅
import BankDetails from "./pages/BankDetails"; 

import ProtectedRoute from "./components/ProtectedRoute";
import "./styles/appTheme.css";

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
      <header className="app-topbar">
        <div className="app-topbar-left">
          <span className="app-topbar-logo-main">BGMI</span>
          <span className="app-topbar-logo-sub">Esports</span>
        </div>
        <div className="app-topbar-right">
          <Navbar variant="top-menu" />
        </div>
      </header>
      <main className="app-main-esports has-bottom-nav">
        {children}
      </main>
      <Navbar variant="bottom-tabs" />
      <Footer />
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        {/* 🔥 PUBLIC ROUTES */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/tournaments" element={<Tournaments />} />
        <Route path="/tournaments/:id" element={<TournamentDetails />} />
        <Route path="/help" element={<Help />} />

        {/* 🔥 PROTECTED ROUTES */}
        <Route path="/" element={
          <ProtectedRoute>
            <MainLayout>
              <Home />
            </MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/my-matches" element={
          <ProtectedRoute>
            <MainLayout>
              <MyMatches />
            </MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/wallet" element={
          <ProtectedRoute>
            <MainLayout>
              <Wallet />
            </MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/deposit-history" element={
          <ProtectedRoute>
            <MainLayout>
              <DepositHistory />
            </MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/deposit" element={
          <ProtectedRoute>
            <MainLayout>
              <Deposit />
            </MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/deposit/qr" element={
          <ProtectedRoute>
            <MainLayout>
              <DepositQR />
            </MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/withdraw" element={
          <ProtectedRoute>
            <MainLayout>
              <Withdraw />
            </MainLayout>
          </ProtectedRoute>
        } />

        {/* 🔥 BANK DETAILS ROUTE - NEW ✅ */}
        <Route path="/bank-details" element={
          <ProtectedRoute>
            <MainLayout>
              <BankDetails />
            </MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute>
            <MainLayout>
              <Profile />
            </MainLayout>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;

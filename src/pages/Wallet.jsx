// 🔥 Wallet.jsx - NO LOADING SCREEN, PERFECT SILENT SYNC!
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { supabase } from "../supabaseClient";
import "./Wallet.css";

// 🔥 API URLs
const USER_API = window.location.hostname === "localhost" 
  ? "http://localhost:5001"
  : "https://user-register-server.onrender.com";

const DEPOSIT_API = window.location.hostname === "localhost" 
  ? "http://localhost:5002"
  : "https://deposit-and-join-tournament-server.onrender.com";

const Wallet = () => {
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0);
  const [supabaseBalance, setSupabaseBalance] = useState(0);
  const [deposits, setDeposits] = useState([]);
  const [user, setUser] = useState(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true); // 🔥 ONLY FIRST LOAD
  const lastBalanceRef = useRef(0);
  const refreshTimeoutRef = useRef(null);

  // Load user from localStorage (Instant)
  useEffect(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("bgmi_user"));
      console.log("🔍 User loaded:", storedUser?.profile_id);
      setUser(storedUser);
    } catch (err) {
      console.error("❌ User load error:", err);
    }
  }, []);

  // 🔥 SUPABASE BALANCE (Silent)
  const loadSupabaseBalance = useCallback(async () => {
    if (!user?.profile_id) return 0;
    
    try {
      const { data, error } = await supabase
        .from("registeruser")
        .select("balance")
        .eq("profile_id", user.profile_id)
        .maybeSingle();

      if (!error && data) {
        const supaBalance = Number(data.balance || 0);
        
        // 🔥 SILENT UPDATE - No render if same
        if (Math.abs(supaBalance - lastBalanceRef.current) > 0.01) {
          setSupabaseBalance(supaBalance);
          lastBalanceRef.current = supaBalance;
          localStorage.setItem('wallet_balance', supaBalance.toString());
          console.log("💰 SUPABASE:", supaBalance);
        }
        return supaBalance;
      }
      return 0;
    } catch (err) {
      console.error("Supabase error:", err);
      return 0;
    }
  }, [user?.profile_id]);

  // 🔥 SERVER BALANCE (Silent)
  const loadWalletBalance = useCallback(async () => {
    if (!user?.profile_id) return;
    
    try {
      const res = await axios.get(`${USER_API}/api/my-balance?profileId=${user.profile_id}`, { 
        timeout: 3000 
      });
      const serverBalance = Number(res.data.balance || 0);
      
      // 🔥 PRIORITY: Supabase > Server
      const finalBalance = supabaseBalance || serverBalance;
      if (Math.abs(finalBalance - lastBalanceRef.current) > 0.01) {
        setBalance(finalBalance);
        lastBalanceRef.current = finalBalance;
      }
    } catch (err) {
      // Silent fail
    }
  }, [user?.profile_id, supabaseBalance]);

  // 🔥 DEPOSITS (Silent)
  const loadDeposits = useCallback(async () => {
    if (!user?.profile_id) return;
    
    try {
      const res = await axios.get(`${DEPOSIT_API}/api/deposits`, { timeout: 5000 });
      const myDeposits = res.data.deposits.filter(d => d.profile_id === user.profile_id);
      setDeposits(myDeposits.reverse());
    } catch (err) {
      // Silent fail
    }
  }, [user?.profile_id]);

  // 🔥 INITIAL LOAD ONLY (No repeat loading)
  useEffect(() => {
    if (!user?.profile_id || !isInitialLoading) return;
    
    const initialLoad = async () => {
      // Fast parallel load
      await Promise.all([
        loadSupabaseBalance(),
        loadWalletBalance(),
        loadDeposits()
      ]);
      setIsInitialLoading(false); // 🔥 DISABLE LOADING FOREVER
    };
    
    initialLoad();
  }, [user, isInitialLoading, loadSupabaseBalance, loadWalletBalance, loadDeposits]);

  // 🔥 SILENT BACKGROUND REFRESH (No loading screen)
  useEffect(() => {
    if (!user?.profile_id || isInitialLoading) return;
    
    // 15-sec silent refresh
    refreshTimeoutRef.current = setInterval(async () => {
      await Promise.all([
        loadSupabaseBalance(),
        loadWalletBalance(),
        loadDeposits()
      ]);
    }, 15000);

    return () => {
      if (refreshTimeoutRef.current) clearInterval(refreshTimeoutRef.current);
    };
  }, [user, loadSupabaseBalance, loadWalletBalance, loadDeposits, isInitialLoading]);

  // 🔥 INSTANT TOURNAMENT SYNC
  useEffect(() => {
    const handleBalanceUpdate = async () => {
      console.log("⚡ Tournament sync triggered!");
      await loadSupabaseBalance();
      await loadWalletBalance();
    };

    window.addEventListener('balanceUpdate', handleBalanceUpdate);
    window.addEventListener('storage', (e) => {
      if (e.key === 'balanceUpdated' || e.key === 'wallet_balance') {
        handleBalanceUpdate();
      }
    });

    return () => {
      window.removeEventListener('balanceUpdate', handleBalanceUpdate);
    };
  }, [loadSupabaseBalance, loadWalletBalance]);

  const refreshWallet = () => {
    loadSupabaseBalance();
    loadWalletBalance();
    loadDeposits();
  };

  const goToWithdrawHistory = () => {
    navigate("/withdraw-history");
  };

  // 🔥 NO LOADING AFTER FIRST LOAD
  if (isInitialLoading) {
    return (
      <div className="wallet-container">
        <div className="loading-fullscreen" style={{background: 'transparent'}}>
          <div className="spinner-large" style={{opacity: 0.5}}></div>
          <p style={{fontSize: '14px'}}>Loading...</p>
        </div>
      </div>
    );
  }

  const displayBalance = supabaseBalance > 0 ? supabaseBalance : balance;

  return (
    <div className="wallet-container">
      {/* HEADER */}
      <div className="wallet-header">
        <div className="header-left">
          <h1>💰 Wallet</h1>
          <p>Welcome back, <strong>{user?.username || 'Player'}</strong></p>
        </div>
        <button className="refresh-btn" onClick={refreshWallet} title="Refresh">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M23 4v6h-2V7.07L14 12.57l-4.28-4.48L3 12V4h2v5.72l3-3.14 4.28 4.48L21 3.93V4h2Z" fill="currentColor"/>
            <path d="M21 20v-6h-2v2.93l-4-4.14-4.15 4.13L8 13.07V20H6v-6h2v2.93l3-3.14L13.22 20l4.15-4.13L21 17.07V20h2Z" fill="currentColor"/>
          </svg>
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div className="main-content">
        {/* BALANCE CARD */}
        <div className="balance-card">
          <div className="balance-info">
            <p className="balance-label">Available Balance</p>
            <h1 className="balance-amount">₹{displayBalance.toLocaleString()}</h1>
            <p className="profile-id">ID: {user?.profile_id}</p>
            {supabaseBalance > 0 && (
              <p className="sync-status" style={{fontSize: '12px', color: '#28a745', margin: 0}}>
                ✅ Tournament synced
              </p>
            )}
          </div>
          <div className="balance-actions">
            <button className="quick-action deposit-quick" onClick={() => navigate("/deposit")}>
              ➕ Add Money
            </button>
            <button className="quick-action withdraw-quick" onClick={() => navigate("/withdraw")}>
              ➖ Withdraw
            </button>
            <button className="quick-action history-quick" onClick={goToWithdrawHistory}>
              📜 Withdraw History
            </button>
          </div>
        </div>

        {/* STATS */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📈</div>
            <div>
              <p>Total Deposits</p>
              <strong>₹{deposits.filter(d => d.status === 'approved').reduce((sum, d) => sum + Number(d.amount || 0), 0).toLocaleString()}</strong>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⏳</div>
            <div>
              <p>Pending</p>
              <strong>{deposits.filter(d => d.status === 'pending').length}</strong>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div>
              <p>Approved</p>
              <strong>{deposits.filter(d => d.status === 'approved').length}</strong>
            </div>
          </div>
        </div>

        {/* SILENT SYNC INFO */}
        <div className="quick-info-card" style={{opacity: 0.7, fontSize: '0.8em'}}>
          <div className="quick-info-content">
            <p>Silent auto-sync | Tournament deducts instant</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wallet;

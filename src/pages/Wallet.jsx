// 🔥 Wallet.jsx - GLOBAL LOADER + MOBILE SCROLL + SILENT SYNC + BACKBUTTON

import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";

import { useNavigate } from "react-router-dom";
import axios from "axios";
import { supabase } from "../supabaseClient";
import { useLoading } from "../context/LoadingContext";

import "./Wallet.css";

const USER_API =
  window.location.hostname === "localhost"
    ? "http://localhost:5001"
    : "https://user-register-server.onrender.com";

const DEPOSIT_API =
  window.location.hostname === "localhost"
    ? "http://localhost:5002"
    : "https://deposit-and-join-tournament-server.onrender.com";

const Wallet = () => {
  const navigate = useNavigate();

  // 🌐 GLOBAL LOADER
  const { setLoading } = useLoading();

  const [balance, setBalance] = useState(0);
  const [supabaseBalance, setSupabaseBalance] = useState(0);
  const [deposits, setDeposits] = useState([]);
  const [user, setUser] = useState(null);

  // Initial page loading
  const [isInitialLoading, setIsInitialLoading] =
    useState(true);

  const lastBalanceRef = useRef(0);
  const refreshTimeoutRef = useRef(null);

  // ==========================================
  // LOAD USER FROM LOCALSTORAGE
  // ==========================================
  useEffect(() => {
    try {
      const storedUser = JSON.parse(
        localStorage.getItem("bgmi_user")
      );

      console.log(
        "🔍 User loaded:",
        storedUser?.profile_id
      );

      setUser(storedUser);
    } catch (err) {
      console.error(
        "❌ User load error:",
        err
      );

      setUser(null);
      setIsInitialLoading(false);
    }
  }, []);

  // ==========================================
  // SUPABASE BALANCE
  // ==========================================
  const loadSupabaseBalance = useCallback(
    async () => {
      if (!user?.profile_id) return 0;

      try {
        const { data, error } =
          await supabase
            .from("registeruser")
            .select("balance")
            .eq(
              "profile_id",
              user.profile_id
            )
            .maybeSingle();

        if (!error && data) {
          const supaBalance = Number(
            data.balance || 0
          );

          setSupabaseBalance(
            supaBalance
          );

          localStorage.setItem(
            "wallet_balance",
            supaBalance.toString()
          );

          lastBalanceRef.current =
            supaBalance;

          console.log(
            "💰 SUPABASE:",
            supaBalance
          );

          return supaBalance;
        }

        return 0;
      } catch (err) {
        console.error(
          "Supabase error:",
          err
        );

        return 0;
      }
    },
    [user?.profile_id]
  );

  // ==========================================
  // SERVER BALANCE
  // ==========================================
  const loadWalletBalance = useCallback(
    async () => {
      if (!user?.profile_id) return 0;

      try {
        const res = await axios.get(
          `${USER_API}/api/my-balance?profileId=${encodeURIComponent(
            user.profile_id
          )}`,
          {
            timeout: 3000,
          }
        );

        const serverBalance = Number(
          res.data?.balance || 0
        );

        setBalance(
          serverBalance
        );

        console.log(
          "💰 SERVER BALANCE:",
          serverBalance
        );

        return serverBalance;
      } catch (err) {
        // Silent fail
        return 0;
      }
    },
    [user?.profile_id]
  );

  // ==========================================
  // DEPOSITS
  // ==========================================
  const loadDeposits = useCallback(
    async () => {
      if (!user?.profile_id) return;

      try {
        const res = await axios.get(
          `${DEPOSIT_API}/api/deposits?profileId=${encodeURIComponent(
            user.profile_id
          )}&_=${Date.now()}`,
          {
            timeout: 5000,
          }
        );

        const myDeposits =
          Array.isArray(
            res.data?.deposits
          )
            ? res.data.deposits
            : [];

        setDeposits(
          [...myDeposits].reverse()
        );

        console.log(
          "💳 Deposits loaded:",
          myDeposits.length,
          "Profile:",
          user.profile_id
        );
      } catch (err) {
        // Silent fail
      }
    },
    [user?.profile_id]
  );

  // ==========================================
  // INITIAL LOAD
  // GLOBAL PNG LOADER
  // ==========================================
  useEffect(() => {
    if (!user?.profile_id) {
      return;
    }

    if (!isInitialLoading) {
      return;
    }

    const initialLoad = async () => {
      // 🔥 GLOBAL LOADER ON
      setLoading(true);

      try {
        await Promise.all([
          loadSupabaseBalance(),
          loadWalletBalance(),
          loadDeposits(),
        ]);
      } catch (error) {
        console.error(
          "❌ Initial wallet load error:",
          error
        );
      } finally {
        // 🔥 GLOBAL LOADER OFF
        setIsInitialLoading(false);
        setLoading(false);
      }
    };

    initialLoad();
  }, [
    user,
    isInitialLoading,
    loadSupabaseBalance,
    loadWalletBalance,
    loadDeposits,
    setLoading,
  ]);

  // ==========================================
  // SILENT BACKGROUND REFRESH
  // NO GLOBAL LOADER HERE
  // ==========================================
  useEffect(() => {
    if (
      !user?.profile_id ||
      isInitialLoading
    ) {
      return;
    }

    refreshTimeoutRef.current =
      setInterval(async () => {
        await Promise.all([
          loadSupabaseBalance(),
          loadWalletBalance(),
          loadDeposits(),
        ]);
      }, 15000);

    return () => {
      if (refreshTimeoutRef.current) {
        clearInterval(
          refreshTimeoutRef.current
        );
      }
    };
  }, [
    user,
    loadSupabaseBalance,
    loadWalletBalance,
    loadDeposits,
    isInitialLoading,
  ]);

  // ==========================================
  // INSTANT TOURNAMENT BALANCE SYNC
  // NO GLOBAL LOADER
  // ==========================================
  useEffect(() => {
    const handleBalanceUpdate =
      async () => {
        console.log(
          "⚡ Tournament sync triggered!"
        );

        await loadSupabaseBalance();
        await loadWalletBalance();
      };

    const handleStorage = (e) => {
      if (
        e.key === "balanceUpdated" ||
        e.key === "wallet_balance"
      ) {
        handleBalanceUpdate();
      }
    };

    window.addEventListener(
      "balanceUpdate",
      handleBalanceUpdate
    );

    window.addEventListener(
      "storage",
      handleStorage
    );

    return () => {
      window.removeEventListener(
        "balanceUpdate",
        handleBalanceUpdate
      );

      window.removeEventListener(
        "storage",
        handleStorage
      );
    };
  }, [
    loadSupabaseBalance,
    loadWalletBalance,
  ]);

  // ==========================================
  // MANUAL REFRESH
  // NO GLOBAL LOADER
  // ==========================================
  const refreshWallet = () => {
    loadSupabaseBalance();
    loadWalletBalance();
    loadDeposits();
  };

  // ==========================================
  // WITHDRAW HISTORY
  // ==========================================
  const goToWithdrawHistory = () => {
    navigate("/withdraw-history");
  };

  // ==========================================
  // DISPLAY BALANCE
  // ==========================================
  const displayBalance =
    supabaseBalance > 0
      ? supabaseBalance
      : balance;

  // ==========================================
  // UI
  // ==========================================
  return (
    <div className="wallet-container">

    
      

      {/* HEADER */}
      <div className="wallet-header">
        <div className="header-left">
          <h1>💰 Wallet</h1>

          <p>
            Welcome back{" "}
            <strong>
              {user?.username || "Player"}
            </strong>
          </p>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="main-content">

        {/* BALANCE CARD */}
        <div className="balance-card">

          <div className="balance-info">

            <p className="balance-label">
              Available Balance
            </p>

            <h1 className="balance-amount">
              ₹
              {displayBalance.toLocaleString()}
            </h1>

            <p className="profile-id">
              ID: {user?.profile_id}
            </p>

            {supabaseBalance > 0 && (
              <p
                className="sync-status"
                style={{
                  fontSize: "12px",
                  color: "#28a745",
                  margin: "4px 0 0 0",
                }}
              ></p>
            )}

          </div>

          <div className="balance-actions">

            <button
              className="quick-action deposit-quick"
              onClick={() =>
                navigate("/deposit")
              }
            >
              ➕ Add Money
            </button>

            <button
              className="quick-action withdraw-quick"
              onClick={() =>
                navigate("/withdraw")
              }
            >
              ➖ Withdraw
            </button>

            <button
              className="quick-action history-quick"
              onClick={
                goToWithdrawHistory
              }
            >
              📜 Withdraw History
            </button>

          </div>
        </div>

        {/* STATS */}
        <div className="stats-grid">

          {/* TOTAL DEPOSITS */}
          <div className="stat-card">

            <div className="stat-icon">
              📈
            </div>

            <div>
              <p>Total Deposits</p>

              <strong>
                ₹
                {deposits
                  .filter(
                    (d) =>
                      d.status ===
                      "approved"
                  )
                  .reduce(
                    (sum, d) =>
                      sum +
                      Number(
                        d.amount || 0
                      ),
                    0
                  )
                  .toLocaleString()}
              </strong>
            </div>

          </div>

          {/* PENDING */}
          <div className="stat-card">

            <div className="stat-icon">
              ⏳
            </div>

            <div>
              <p>Pending</p>

              <strong>
                {
                  deposits.filter(
                    (d) =>
                      d.status ===
                      "pending"
                  ).length
                }
              </strong>
            </div>

          </div>

          {/* APPROVED */}
          <div className="stat-card">

            <div className="stat-icon">
              ✅
            </div>

            <div>
              <p>Approved</p>

              <strong>
                {
                  deposits.filter(
                    (d) =>
                      d.status ===
                      "approved"
                  ).length
                }
              </strong>
            </div>

          </div>

        </div>

        {/* EXTRA SPACE FOR SCROLL */}
        <div
          style={{
            height: "80px",
          }}
        ></div>

      </div>
    </div>
  );
};

export default Wallet;
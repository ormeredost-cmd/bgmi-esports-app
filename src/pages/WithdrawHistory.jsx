import React, {
  useEffect,
  useState,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import "./WithdrawHistory.css";

/* ============================================================
   API
============================================================ */

const WITHDRAW_API =
  window.location.hostname === "localhost"
    ? "http://localhost:5003"
    : "https://withdraw-server.onrender.com";

/* ============================================================
   FORMAT INDIAN TIME
============================================================ */

const formatIndianTime = (utcDate) => {
  if (!utcDate) {
    return "—";
  }

  const date = new Date(utcDate);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

/* ============================================================
   COMPONENT
============================================================ */

const WithdrawHistory = () => {
  const [withdraws, setWithdraws] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  /* ==========================================================
     LOAD USER WITHDRAW HISTORY
  ========================================================== */

  const loadWithdraws = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      /* ======================================================
         GET LOGGED-IN USER
      ====================================================== */

      const storedUser =
        localStorage.getItem("bgmi_user");

      if (!storedUser) {
        navigate("/login");
        return;
      }

      let user;

      try {
        user = JSON.parse(storedUser);
      } catch (parseError) {
        console.error(
          "❌ USER DATA PARSE ERROR:",
          parseError
        );

        localStorage.removeItem("bgmi_user");
        navigate("/login");
        return;
      }

      /* ======================================================
         PROFILE ID
      ====================================================== */

      const profileId =
        String(
          user?.profile_id || ""
        ).trim();

      if (!profileId) {
        navigate("/login");
        return;
      }

      console.log(
        "📋 Loading withdraw history:",
        profileId
      );

      /* ======================================================
         USER HISTORY API
      ====================================================== */

      const res = await fetch(
        `${WITHDRAW_API}/api/withdraw-history?profileId=${encodeURIComponent(
          profileId
        )}`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      let data = {};

      try {
        data = await res.json();
      } catch {
        data = {};
      }

      /* ======================================================
         API ERROR
      ====================================================== */

      if (!res.ok) {
        throw new Error(
          data?.error ||
            data?.message ||
            `HTTP ${res.status}`
        );
      }

      /* ======================================================
         GET WITHDRAWS
      ====================================================== */

      const myWithdraws =
        Array.isArray(
          data?.withdraws
        )
          ? [...data.withdraws]
          : [];

      /* ======================================================
         NEWEST FIRST
      ====================================================== */

      myWithdraws.sort(
        (a, b) =>
          new Date(
            b?.created_at || 0
          ) -
          new Date(
            a?.created_at || 0
          )
      );

      setWithdraws(
        myWithdraws
      );

      console.log(
        "✅ Withdraw history loaded:",
        myWithdraws.length
      );
    } catch (err) {
      console.error(
        "❌ Withdraw history error:",
        err
      );

      setWithdraws([]);

      setError(
        "Failed to load withdraw history. Check if 5003 server running."
      );
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  /* ==========================================================
     INITIAL LOAD
  ========================================================== */

  useEffect(() => {
    loadWithdraws();
  }, [loadWithdraws]);

  /* ==========================================================
     FILTER
  ========================================================== */

  const filteredWithdraws =
    withdraws.filter(
      (w) => {
        if (filter === "all") {
          return true;
        }

        return (
          w?.status === filter
        );
      }
    );

  /* ==========================================================
     STATUS COUNT
  ========================================================== */

  const getStatusCount = (
    status
  ) => {
    return withdraws.filter(
      (w) =>
        w?.status === status
    ).length;
  };

  /* ==========================================================
     REFRESH
  ========================================================== */

  const refreshHistory = () => {
    loadWithdraws();
  };

  /* ==========================================================
     LOADING
  ========================================================== */

  if (loading) {
    return (
      <div className="withdraw-history-page">
        <div className="withdraw-loading-container">
          <div className="withdraw-spinner-large"></div>

          <p>
            🔄 Loading withdraw history...
          </p>
        </div>
      </div>
    );
  }

  /* ==========================================================
     ERROR
  ========================================================== */

  if (error) {
    return (
      <div className="withdraw-history-page">
        <div className="withdraw-empty-state">
          <div className="withdraw-empty-icon">
            ⚠️
          </div>

          <h3>
            {error}
          </h3>

          <button
            onClick={
              refreshHistory
            }
            className="withdraw-refresh-btn"
          >
            🔄 Retry Load
          </button>
        </div>
      </div>
    );
  }

  /* ==========================================================
     UI
  ========================================================== */

  return (
    <div className="withdraw-history-page">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="withdraw-history-header">

        <div className="withdraw-header-title">

          <h1>
            Withdraw History
          </h1>

          <div className="withdraw-total-count">
            Total: {withdraws.length} requests
          </div>

        </div>

      </div>

      {/* ======================================================
          FILTER TABS
      ====================================================== */}

      <div className="withdraw-filter-tabs">

        {/* ALL */}

        <button
          className={`withdraw-filter-tab ${
            filter === "all"
              ? "active"
              : ""
          }`}
          onClick={() =>
            setFilter("all")
          }
        >
          All ({withdraws.length})
        </button>

        {/* PENDING */}

        <button
          className={`withdraw-filter-tab ${
            filter === "pending"
              ? "active"
              : ""
          }`}
          onClick={() =>
            setFilter("pending")
          }
        >
          Pending (
          {getStatusCount(
            "pending"
          )}
          )
        </button>

        {/* APPROVED */}

        <button
          className={`withdraw-filter-tab ${
            filter === "approved"
              ? "active"
              : ""
          }`}
          onClick={() =>
            setFilter("approved")
          }
        >
          Approved (
          {getStatusCount(
            "approved"
          )}
          )
        </button>

        {/* REJECTED */}

        <button
          className={`withdraw-filter-tab ${
            filter === "rejected"
              ? "active"
              : ""
          }`}
          onClick={() =>
            setFilter("rejected")
          }
        >
          Rejected (
          {getStatusCount(
            "rejected"
          )}
          )
        </button>

      </div>

      {/* ======================================================
          EMPTY STATE / LIST
      ====================================================== */}

      {filteredWithdraws.length ===
      0 ? (

        /* ====================================================
           NO WITHDRAW
        ==================================================== */

        <div className="withdraw-empty-state">

          <div className="withdraw-empty-icon">
            💸
          </div>

          <h3>
            No{" "}
            {filter === "all"
              ? "withdraw"
              : filter}{" "}
            requests
          </h3>

          <p className="withdraw-empty-sub">
            {filter === "all"
              ? "Submit your first withdraw request!"
              : `No ${filter} withdraws yet`}
          </p>

          <div className="withdraw-empty-actions">

            <button
              onClick={() =>
                navigate(
                  "/withdraw"
                )
              }
              className="withdraw-add-money-btn"
            >
              ➕ New Withdraw
            </button>

            <button
              onClick={() =>
                navigate(
                  "/wallet"
                )
              }
              className="withdraw-back-btn"
            >
              💰 Wallet
            </button>

          </div>

        </div>

      ) : (

        /* ====================================================
           WITHDRAW LIST
        ==================================================== */

        <div className="withdraw-history-list">

          {filteredWithdraws.map(
            (w, index) => {

              const amount = Number(
                w?.withdraw_amount ??
                  w?.amount ??
                  0
              );

              const status =
                w?.status ||
                "pending";

              const withdrawId =
                w?.withdraw_id ||
                w?.id ||
                "";

              const displayName =
                w?.profile_name ||
                w?.user_name ||
                "You";

              return (
                <div
                  key={
                    w?.id ||
                    w?.withdraw_id ||
                    index
                  }
                  className="withdraw-history-card"
                >

                  {/* ======================================
                      LEFT CONTENT
                  ====================================== */}

                  <div className="withdraw-card-left">

                    {/* AMOUNT */}

                    <div className="withdraw-amount-row">

                      <span className="withdraw-amount">
                        ₹
                        {amount.toLocaleString(
                          "en-IN"
                        )}
                      </span>

                      <span
                        className={`withdraw-status-dot ${status}`}
                      ></span>

                    </div>

                    {/* DATE */}

                    <div className="withdraw-details-row">

                      <span className="withdraw-date">
                        {formatIndianTime(
                          w?.created_at ||
                            w?.date
                        )}
                      </span>

                    </div>

                    {/* USER */}

                    <div className="withdraw-user-info">
                      👤 {displayName}
                    </div>

                    {/* WITHDRAW ID */}

                    <div className="withdraw-id">
                      🆔 ID:{" "}
                      <b>
                        {String(
                          withdrawId
                        ).slice(0, 8)}
                      </b>
                    </div>

                  </div>

                  {/* ======================================
                      STATUS
                  ====================================== */}

                  <div
                    className={`withdraw-status-badge-large ${status}`}
                  >
                    {status ===
                    "approved"
                      ? "✅ Approved"
                      : status ===
                        "pending"
                      ? "⏳ Pending"
                      : status ===
                        "rejected"
                      ? "❌ Rejected"
                      : "⏳ Processing"}
                  </div>

                </div>
              );
            }
          )}

          <div
            style={{
              height: "80px",
            }}
          ></div>

        </div>
      )}

    </div>
  );
};

export default WithdrawHistory;
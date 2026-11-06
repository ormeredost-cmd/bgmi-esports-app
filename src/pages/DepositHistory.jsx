import React, {
  useEffect,
  useState,
  useCallback,
} from "react";

import { useNavigate } from "react-router-dom";

import "./DepositHistory.css";

/* ============================= API ============================= */

const DEPOSIT_API =
  window.location.hostname === "localhost"
    ? "http://localhost:5002"
    : "https://deposit-and-join-tournament-server.onrender.com";

/* ============================= FORMAT DATE ============================= */

const formatIndianTime = (utcDate) => {
  if (!utcDate) return "—";

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

/* ============================= COMPONENT ============================= */

const DepositHistory = () => {
  const navigate = useNavigate();

  /* ============================= STATE ============================= */

  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");

  /* ============================= LOAD DEPOSITS ============================= */

  const loadDeposits = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      /* ============================================================
         GET LOGGED-IN USER
         ============================================================ */

      const storedUser =
        localStorage.getItem("bgmi_user");

      if (!storedUser) {
        setDeposits([]);

        navigate("/login", {
          replace: true,
        });

        return;
      }

      /* ============================================================
         PARSE USER SESSION
         ============================================================ */

      let user;

      try {
        user = JSON.parse(storedUser);
      } catch (parseError) {
        console.error(
          "❌ USER JSON ERROR:",
          parseError
        );

        localStorage.removeItem("bgmi_user");
        setDeposits([]);

        navigate("/login", {
          replace: true,
        });

        return;
      }

      /* ============================================================
         GET PROFILE ID
         ============================================================ */

      const profileId =
        user?.profile_id ||
        user?.user?.profile_id;

      if (!profileId) {
        console.error(
          "❌ PROFILE ID MISSING"
        );

        localStorage.removeItem("bgmi_user");
        setDeposits([]);

        navigate("/login", {
          replace: true,
        });

        return;
      }

      const cleanProfileId =
        String(profileId).trim();

      console.log(
        "👤 Loading deposits for:",
        cleanProfileId
      );

      /* ============================================================
         BACKEND REQUEST

         IMPORTANT:
         Backend sirf isi profile ke deposits return karega.
         Timestamp query ko fresh rakhta hai.
         ============================================================ */

      const url =
        `${DEPOSIT_API}/api/deposits` +
        `?profileId=${encodeURIComponent(
          cleanProfileId
        )}` +
        `&_=${Date.now()}`;

      const response = await fetch(url, {
        method: "GET",
        cache: "no-store",
      });

      /* ============================================================
         RESPONSE CHECK
         ============================================================ */

      if (!response.ok) {
        throw new Error(
          `Server error (${response.status})`
        );
      }

      let data;

      try {
        data = await response.json();
      } catch (jsonError) {
        console.error(
          "❌ INVALID JSON RESPONSE:",
          jsonError
        );

        throw new Error(
          "Invalid server response"
        );
      }

      /* ============================================================
         GET DEPOSITS
         ============================================================ */

      let allDeposits =
        Array.isArray(data?.deposits)
          ? data.deposits
          : [];

      /* ============================================================
         EXTRA FRONTEND SAFETY

         Backend already profile_id filter kar raha hai.
         Ye second check accidental wrong data ko UI me show
         hone se rokta hai.
         ============================================================ */

      allDeposits =
        allDeposits.filter((deposit) => {
          const depositProfileId =
            String(
              deposit?.profile_id ?? ""
            ).trim();

          const sameProfile =
            depositProfileId ===
            cleanProfileId;

          const isVisible =
            deposit?.visible !== false;

          return (
            sameProfile &&
            isVisible
          );
        });

      /* ============================================================
         SORT NEWEST FIRST
         ============================================================ */

      allDeposits.sort((a, b) => {
        const dateA =
          new Date(a?.date).getTime();

        const dateB =
          new Date(b?.date).getTime();

        return dateB - dateA;
      });

      /* ============================================================
         DEBUG
         ============================================================ */

      console.log(
        "📋 Deposits loaded:",
        allDeposits.length
      );

      console.log(
        "📋 Deposit list:",
        allDeposits.map(
          (deposit) => ({
            amount:
              deposit?.amount,

            status:
              deposit?.status,

            profile_id:
              deposit?.profile_id,

            deposit_id:
              deposit?.deposit_id,
          })
        )
      );

      /* ============================================================
         SAVE STATE
         ============================================================ */

      setDeposits(allDeposits);

    } catch (err) {
      console.error(
        "❌ DEPOSIT HISTORY ERROR:",
        err
      );

      setError(
        err?.message ||
          "Failed to load deposit history"
      );
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  /* ============================= INITIAL LOAD ============================= */

  useEffect(() => {
    loadDeposits();
  }, [loadDeposits]);

  /* ============================= FILTER ============================= */

  const filteredDeposits =
    deposits.filter((deposit) => {
      if (filter === "all") {
        return true;
      }

      return (
        deposit?.status ===
        filter
      );
    });

  /* ============================= STATUS COUNT ============================= */

  const getStatusCount = (status) => {
    return deposits.filter(
      (deposit) =>
        deposit?.status === status
    ).length;
  };

  /* ============================= REFRESH ============================= */

  const refreshHistory = () => {
    loadDeposits();
  };

  /* ============================= LOADING STATE ============================= */

  if (loading) {
    return (
      <div className="deposit-history-page">
        <div className="deposit-history-container">

          <div className="deposit-history-header">
            <div className="deposit-header-title">

              <h1>
                🧾 My Deposit History
              </h1>

              <div className="deposit-total-count">
                Loading...
              </div>

            </div>
          </div>

          <div className="deposit-filter-tabs">

            <button className="deposit-filter-tab active">
              All
            </button>

            <button className="deposit-filter-tab">
              Pending
            </button>

            <button className="deposit-filter-tab">
              Approved
            </button>

            <button className="deposit-filter-tab">
              Rejected
            </button>

          </div>

          <div className="deposit-main-content">

            <div className="deposit-empty-state">

              <h3>
                🔄 Loading deposit history...
              </h3>

            </div>

          </div>

        </div>
      </div>
    );
  }

  /* ============================= ERROR STATE ============================= */

  if (error) {
    return (
      <div className="deposit-history-page">
        <div className="deposit-history-container">

          <div className="deposit-history-header">
            <div className="deposit-header-title">

              <h1>
                🧾 My Deposit History
              </h1>

              <div className="deposit-total-count">
                Error loading
              </div>

            </div>
          </div>

          <div className="deposit-filter-tabs">

            <button className="deposit-filter-tab active">
              All
            </button>

            <button className="deposit-filter-tab">
              Pending
            </button>

            <button className="deposit-filter-tab">
              Approved
            </button>

            <button className="deposit-filter-tab">
              Rejected
            </button>

          </div>

          <div className="deposit-main-content">

            <div className="deposit-empty-state">

              <h3>
                ⚠️ {error}
              </h3>

              <button
                onClick={
                  refreshHistory
                }
                className="deposit-add-money-btn"
              >
                🔁 Retry
              </button>

            </div>

          </div>

        </div>
      </div>
    );
  }

  /* ============================= MAIN UI ============================= */

  return (
    <div className="deposit-history-page">

      <div className="deposit-history-container">

        {/* ============================= HEADER ============================= */}

        <div className="deposit-history-header">

          <div className="deposit-header-title">

            <h1>
              🧾 My Deposit History
            </h1>

            <div className="deposit-total-count">
              Total: {deposits.length} deposits
            </div>

          </div>

        </div>

        {/* ============================= FILTER TABS ============================= */}

        <div className="deposit-filter-tabs">

          <button
            className={`deposit-filter-tab ${
              filter === "all"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setFilter("all")
            }
          >
            All ({deposits.length})
          </button>

          <button
            className={`deposit-filter-tab ${
              filter === "pending"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setFilter("pending")
            }
          >
            Pending (
            {getStatusCount("pending")}
            )
          </button>

          <button
            className={`deposit-filter-tab ${
              filter === "approved"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setFilter("approved")
            }
          >
            Approved (
            {getStatusCount("approved")}
            )
          </button>

          <button
            className={`deposit-filter-tab ${
              filter === "rejected"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setFilter("rejected")
            }
          >
            Rejected (
            {getStatusCount("rejected")}
            )
          </button>

        </div>

        {/* ============================= CONTENT ============================= */}

        <div className="deposit-main-content">

          {filteredDeposits.length ===
          0 ? (

            <div className="deposit-empty-state">

              <div className="deposit-empty-wallet">
                💰
              </div>

              <h3>
                No {filter} deposits found
              </h3>

              <p className="deposit-empty-sub">
                💡 Your deposit history is empty for this filter.
              </p>

              <button
                onClick={() =>
                  navigate("/deposit")
                }
                className="deposit-add-money-btn"
              >
                ➕ Add Money
              </button>

            </div>

          ) : (

            <div className="deposit-history-list">

              {filteredDeposits.map(
                (
                  deposit,
                  index
                ) => {

                  const status =
                    deposit?.status ||
                    "pending";

                  return (
                    <div
                      key={
                        deposit?.id ||
                        deposit?.deposit_id ||
                        index
                      }
                      className="deposit-history-card"
                    >

                      <div className="deposit-card-left">

                        {/* ============================= AMOUNT ============================= */}

                        <div className="deposit-amount-row">

                          <span className="deposit-amount">
                            ₹
                            {Number(
                              deposit?.amount ||
                                0
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </span>

                          <span
                            className={`deposit-status-dot ${status}`}
                          />

                        </div>

                        {/* ============================= DATE ============================= */}

                        <div className="deposit-details-row">

                          <span className="deposit-date">
                            {formatIndianTime(
                              deposit?.date
                            )}
                          </span>

                        </div>

                        {/* ============================= USER NAME ============================= */}

                        <div className="deposit-user-info">
                          👤{" "}
                          {deposit?.name ||
                            "Unknown"}
                        </div>

                        {/* ============================= DEPOSIT ID ============================= */}

                        <div className="deposit-deposit-id">

                          🆔 Deposit ID:{" "}

                          <b>
                            {deposit?.deposit_id ||
                              "—"}
                          </b>

                        </div>

                      </div>

                      {/* ============================= STATUS ============================= */}

                      <div
                        className={`deposit-status-badge-large ${status}`}
                      >

                        {status === "approved"
                          ? "✅ Approved"
                          : status === "pending"
                          ? "⏳ Pending"
                          : "❌ Rejected"}

                      </div>

                    </div>
                  );
                }
              )}

            </div>

          )}

        </div>

      </div>

    </div>
  );
};

export default DepositHistory;
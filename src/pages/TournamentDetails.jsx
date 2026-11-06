
import {
  useParams,
  useNavigate,
} from "react-router-dom";

import {
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";

import "./TournamentDetails.css";

/* ============================================================
   API CONFIG
   ============================================================ */

// Tournament Management Server - Port 5005
const TOURNAMENT_API =
  process.env.REACT_APP_TOURNAMENT_API_URL ||
  (window.location.hostname === "localhost"
    ? "http://localhost:5005"
    : "");

// Join Server - Port 5002
const JOIN_API =
  window.location.hostname === "localhost"
    ? "http://localhost:5002"
    : "https://deposit-and-join-tournament-server.onrender.com";

// User / Wallet Server - Port 5001
const USER_API =
  window.location.hostname === "localhost"
    ? "http://localhost:5001"
    : "https://user-register-server.onrender.com";

/* ============================================================
   HELPERS
   ============================================================ */

const getJson = async (response) => {
  let data = {};

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new Error(
      data?.error ||
      data?.message ||
      `HTTP ${response.status}`
    );
  }

  return data;
};

// Backend fields ko frontend ke expected fields mein convert karo.
const normalizeTournament = (item) => {
  if (!item) return null;

  return {
    ...item,

    id:
      item.id ||
      item.tournament_id,

    name:
      item.name ||
      item.tournament_name ||
      "Untitled Tournament",

    mode:
      item.mode ||
      item.game_mode ||
      "Solo",

    type:
      item.type ||
      item.match_type ||
      "Classic",

    rulesShort:
      item.rulesShort ||
      item.description ||
      item.rules ||
      item.match_type ||
      "",

    entryFee: Number(
      item.entryFee ??
      item.entry_fee ??
      0
    ),

    prizePool: Number(
      item.prizePool ??
      item.prize_pool ??
      0
    ),

    perKill: Number(
      item.perKill ??
      item.per_kill ??
      0
    ),

    maxSlots: Number(
      item.maxSlots ??
      item.totalSlots ??
      item.slots ??
      50
    ),

    joinedPlayers: Number(
      item.joinedPlayers ??
      item.registered ??
      0
    ),

    image:
      item.image ||
      item.image_url ||
      "",

    status:
      item.status ||
      item.tournament_status ||
      "Upcoming",
  };
};

/* ============================================================
   COMPONENT
   ============================================================ */

const TournamentDetails = () => {
  const { id } = useParams();

  const navigate = useNavigate();

  /* ============================================================
     STATES
     ============================================================ */

  const [tournament, setTournament] =
    useState(null);

  const [isTournamentLoading, setIsTournamentLoading] =
    useState(true);

  const [isJoined, setIsJoined] =
    useState(false);

  const [isFull, setIsFull] =
    useState(false);

  const [isInitialLoading, setIsInitialLoading] =
    useState(true);

  const [liveSlots, setLiveSlots] =
    useState(0);

  const [maxSlots, setMaxSlots] =
    useState(50);

  const [isLoading, setIsLoading] =
    useState(false);

  const [balance, setBalance] =
    useState(0);

  const [user, setUser] =
    useState(null);

  const [errorMsg, setErrorMsg] =
    useState("");

  const hasLoadedRef =
    useRef(false);

  const isMountedRef =
    useRef(true);

  /* ============================================================
     GET LOGGED-IN USER
     ============================================================ */

  const getStoredUser = useCallback(() => {
    try {
      const stored =
        localStorage.getItem("bgmi_user");

      if (!stored) {
        return null;
      }

      return JSON.parse(stored);
    } catch (error) {
      console.error(
        "Failed to read user data:",
        error
      );

      return null;
    }
  }, []);

  /* ============================================================
     GET PROFILE ID
     ============================================================ */

  const getProfileId = useCallback(() => {
    const storedUser = getStoredUser();

    return (
      storedUser?.profile_id ||
      storedUser?.user?.profile_id ||
      ""
    );
  }, [getStoredUser]);

  /* ============================================================
     LOAD REAL TOURNAMENT FROM BACKEND
     ============================================================ */

  const loadTournament = useCallback(async () => {
    if (!TOURNAMENT_API) {
      throw new Error(
        "Tournament API URL is not configured. Please check REACT_APP_TOURNAMENT_API_URL."
      );
    }

    const encodedId = encodeURIComponent(id);

    // Upcoming, Live aur Completed tournaments ke public endpoints.
    const endpoints = [
      `${TOURNAMENT_API}/api/tournaments`,
      `${TOURNAMENT_API}/api/live-tournaments`,
      `${TOURNAMENT_API}/api/tournament-history`,
    ];

    const responses = await Promise.allSettled(
      endpoints.map(async (url) => {
        const response = await fetch(url, {
          method: "GET",
          cache: "no-store",
        });

        return getJson(response);
      })
    );

    let foundTournament = null;
    let successfulRequests = 0;
    let lastError = null;

    for (const result of responses) {
      if (result.status !== "fulfilled") {
        lastError = result.reason;
        continue;
      }

      successfulRequests++;

      const data = result.value;

      const list = [
        ...(Array.isArray(data?.tournaments)
          ? data.tournaments
          : []),

        ...(Array.isArray(data?.history)
          ? data.history
          : []),

        ...(Array.isArray(data?.matches)
          ? data.matches
          : []),
      ];

      foundTournament = list.find(
        (item) =>
          String(
            item?.id ||
            item?.tournament_id
          ) === String(id)
      );

      if (foundTournament) {
        break;
      }
    }

    if (!foundTournament) {
      if (successfulRequests === 0 && lastError) {
        throw lastError;
      }

      throw new Error(
        "Tournament nahi mila. Check karo tournament published hai ya nahi."
      );
    }

    const normalized =
      normalizeTournament(foundTournament);

    if (
      !normalized ||
      !normalized.id
    ) {
      throw new Error(
        "Invalid tournament data received from server."
      );
    }

    if (isMountedRef.current) {
      setTournament(normalized);

      setMaxSlots(
        normalized.maxSlots > 0
          ? normalized.maxSlots
          : 50
      );

      setLiveSlots(
        normalized.joinedPlayers || 0
      );
    }

    console.log(
      "Tournament loaded from backend:",
      normalized
    );

    return normalized;
  }, [id]);

  /* ============================================================
     LOAD BALANCE FROM BACKEND
     ============================================================ */

  const loadBalance = useCallback(async () => {
    try {
      const storedUser = getStoredUser();

      const profileId =
        storedUser?.profile_id ||
        storedUser?.user?.profile_id ||
        "";

      if (!profileId) {
        if (isMountedRef.current) {
          setBalance(0);
        }

        return;
      }

      const response = await fetch(
        `${USER_API}/api/my-balance?profileId=${encodeURIComponent(
          profileId
        )}`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const data = await getJson(response);

      const currentBalance =
        Number(data?.balance || 0);

      if (isMountedRef.current) {
        setBalance(
          Number.isFinite(currentBalance)
            ? currentBalance
            : 0
        );

        setUser({
          ...storedUser,

          username:
            data?.username ||
            storedUser?.username ||
            storedUser?.user?.username ||
            "",
        });
      }

      console.log(
        "Backend balance loaded:",
        currentBalance
      );
    } catch (error) {
      console.error(
        "Balance load error:",
        error
      );

      if (isMountedRef.current) {
        setBalance(0);
      }
    }
  }, [getStoredUser]);

  /* ============================================================
     CHECK JOIN STATUS + SLOTS
     ============================================================ */

  const checkStatus = useCallback(
    async (showLoader = false) => {
      const profileId = getProfileId();

      if (!profileId || !tournament) {
        return;
      }

      if (showLoader && isMountedRef.current) {
        setIsInitialLoading(true);
      }

      try {
        /* ==============================================
           CHECK JOIN STATUS
        ============================================== */

        const joinRes = await fetch(
          `${JOIN_API}/api/check-join/${encodeURIComponent(
            id
          )}?profileId=${encodeURIComponent(profileId)}`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const joinData = await getJson(joinRes);

        if (isMountedRef.current) {
          setIsJoined(
            Boolean(joinData?.joined)
          );
        }

        /* ==============================================
           CHECK SLOTS
        ============================================== */

        const slotsRes = await fetch(
          `${JOIN_API}/api/tournament-slots-count/${encodeURIComponent(
            id
          )}`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const slotsData = await getJson(slotsRes);

        const count = Number(
          slotsData?.registered ?? 0
        );

        const max = Number(
          slotsData?.max ??
          tournament?.maxSlots ??
          50
        );

        const safeCount =
          Number.isFinite(count) && count >= 0
            ? count
            : 0;

        const safeMax =
          Number.isFinite(max) && max > 0
            ? max
            : 50;

        if (isMountedRef.current) {
          setLiveSlots(safeCount);
          setMaxSlots(safeMax);
          setIsFull(safeCount >= safeMax);
        }
      } catch (error) {
        console.error(
          "Tournament status check failed:",
          error
        );

        // Status endpoint failure par user ko galat
        // joined/full state mat dikhao.
      } finally {
        if (showLoader && isMountedRef.current) {
          setIsInitialLoading(false);
        }
      }
    },
    [id, getProfileId, tournament]
  );

  /* ============================================================
     INITIAL TOURNAMENT LOAD
     ============================================================ */

  useEffect(() => {
    isMountedRef.current = true;

    hasLoadedRef.current = false;

    setTournament(null);
    setIsTournamentLoading(true);
    setIsInitialLoading(true);

    setIsJoined(false);
    setIsFull(false);
    setLiveSlots(0);
    setMaxSlots(50);
    setErrorMsg("");

    const fetchTournament = async () => {
      try {
        await loadTournament();
      } catch (error) {
        console.error(
          "Tournament load failed:",
          error
        );

        if (isMountedRef.current) {
          setTournament(null);
          setErrorMsg(
            error?.message ||
            "Tournament load nahi ho paya."
          );
        }
      } finally {
        if (isMountedRef.current) {
          setIsTournamentLoading(false);
        }
      }
    };

    fetchTournament();

    return () => {
      isMountedRef.current = false;
    };
  }, [id, loadTournament]);

  /* ============================================================
     USER + STATUS INITIAL LOAD
     ============================================================ */

  useEffect(() => {
    if (!tournament || isTournamentLoading) {
      return;
    }

    let active = true;

    const initialLoad = async () => {
      const profileId = getProfileId();

      if (!profileId) {
        setIsInitialLoading(false);
        navigate("/login");
        return;
      }

      await Promise.all([
        loadBalance(),
        checkStatus(true),
      ]);

      if (active) {
        hasLoadedRef.current = true;
        setIsInitialLoading(false);
      }
    };

    initialLoad();

    return () => {
      active = false;
    };
  }, [
    tournament,
    isTournamentLoading,
    getProfileId,
    loadBalance,
    checkStatus,
    navigate,
  ]);

  /* ============================================================
     BACKGROUND STATUS REFRESH
     NO GLOBAL LOADER
     ============================================================ */

  useEffect(() => {
    if (
      !tournament ||
      isTournamentLoading ||
      !hasLoadedRef.current
    ) {
      return;
    }

    const interval = setInterval(() => {
      checkStatus(false);
    }, 10000);

    return () => {
      clearInterval(interval);
    };
  }, [
    tournament,
    isTournamentLoading,
    checkStatus,
  ]);

  /* ============================================================
     TOURNAMENT LOADING UI
     ============================================================ */

  if (isTournamentLoading) {
    return (
      <div className="tdm-page">
        <div className="tdm-container">
          <div className="status-card loading">
            <h3>⏳ Loading Tournament...</h3>
            <p>Please wait, fetching tournament details.</p>
          </div>
        </div>
      </div>
    );
  }

  /* ============================================================
     TOURNAMENT NOT FOUND
     ============================================================ */

  if (!tournament) {
    return (
      <div className="tdm-page">
        <div className="tdm-container">
          <div className="status-card error">
            <h1>Tournament Not Found</h1>

            <p>
              {errorMsg ||
                "Tournament available nahi hai ya publish nahi hua hai."}
            </p>

            <button
              type="button"
              className="submit-btn"
              onClick={() => navigate("/tournaments")}
            >
              Back to Tournaments
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ============================================================
     TOURNAMENT VALUES
     ============================================================ */

  const tournamentEntryFee =
    Number(tournament.entryFee || 0);

  const tournamentPrize =
    Number(tournament.prizePool || 0);

  const tournamentMaxSlots =
    Number(
      tournament.maxSlots ||
      maxSlots ||
      50
    );

  /* ============================================================
     HANDLE TOURNAMENT JOIN
     ============================================================ */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isLoading) {
      return;
    }

    /* ==============================================
       PLAYER INPUT
    ============================================== */

    const playerName = String(
      e.target.bgmiIdName?.value || ""
    ).trim();

    const bgmiId = String(
      e.target.bgmiIdNumber?.value || ""
    ).trim();

    if (!playerName || !bgmiId) {
      setErrorMsg(
        "❌ BGMI Name & ID daalo!"
      );
      return;
    }

    /* ==============================================
       PLAYER NAME VALIDATION
    ============================================== */

    if (playerName.length > 20) {
      setErrorMsg(
        "❌ BGMI Name maximum 20 characters ka hona chahiye!"
      );
      return;
    }

    /* ==============================================
       BGMI ID VALIDATION
    ============================================== */

    if (!/^\d+$/.test(bgmiId)) {
      setErrorMsg(
        "❌ BGMI ID sirf numbers me honi chahiye!"
      );
      return;
    }

    if (
      bgmiId.length < 5 ||
      bgmiId.length > 12
    ) {
      setErrorMsg(
        "❌ Invalid BGMI ID!"
      );
      return;
    }

    /* ==============================================
       USER CHECK
    ============================================== */

    const profileId = getProfileId();

    if (!profileId) {
      setErrorMsg("❌ Login karo pehle!");
      navigate("/login");
      return;
    }

    /* ==============================================
       ENTRY FEE
    ============================================== */

    const entryFee = tournamentEntryFee;

    /* ==============================================
       BALANCE CHECK
    ============================================== */

    if (
      entryFee > 0 &&
      balance < entryFee
    ) {
      setErrorMsg(
        `❌ Balance kam hai!\n💰 Chahiye: ₹${entryFee}\n💳 Hai: ₹${balance}`
      );
      return;
    }

    /* ==============================================
       FULL CHECK
    ============================================== */

    if (liveSlots >= maxSlots) {
      setIsFull(true);
      setErrorMsg("🔴 Tournament Full hai!");
      return;
    }

    if (isJoined) {
      setErrorMsg(
        "❌ Already joined this tournament!"
      );
      return;
    }

    setErrorMsg("");
    setIsLoading(true);

    try {
      /* ==============================================
         JOIN PAYLOAD
      ============================================== */

      const joinedMatch = {
        tournamentId: tournament.id,

        tournamentName: tournament.name,

        playerName,

        bgmiId,

        profileName:
          user?.username ||
          user?.user?.username ||
          "",

        profileId,

        mode:
          tournament.mode ||
          "Classic",

        rulesShort:
          tournament.rulesShort ||
          "",

        map:
          tournament.map ||
          "Erangel",

        date:
          tournament.date ||
          "",

        time:
          tournament.time ||
          "",

        entryFee,

        prizePool: tournamentPrize,

        slots: tournamentMaxSlots,
      };

      console.log(
        "Sending JOIN request:",
        joinedMatch
      );

      /* ==============================================
         BACKEND JOIN
      ============================================== */

      const response = await fetch(
        `${JOIN_API}/api/join-tournament`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(joinedMatch),
        }
      );

      const result = await getJson(response);

      console.log(
        "JOIN RESPONSE:",
        result
      );

      /* ==============================================
         SUCCESS
      ============================================== */

      if (
        response.ok &&
        result?.success === true
      ) {
        console.log(
          "Tournament join successful"
        );

        /* ==========================================
           UPDATE LOCAL CACHE
        ========================================== */

        try {
          const oldJoins = JSON.parse(
            localStorage.getItem(
              "tournamentJoins"
            ) || "[]"
          );

          const newJoin = {
            tournamentId: tournament.id,

            tournamentName: tournament.name,

            bgmiId,

            playerName,

            profileId,

            mode:
              tournament.mode ||
              "Classic",

            map:
              tournament.map ||
              "Erangel",

            date:
              tournament.date ||
              "",

            time:
              tournament.time ||
              "",

            entryFee,

            prizePool: tournamentPrize,

            timestamp: Date.now(),
          };

          const updatedJoins = oldJoins
            .filter(
              (join) =>
                !(
                  String(
                    join?.tournamentId || ""
                  ) === String(tournament.id) &&
                  String(
                    join?.profileId || ""
                  ) === String(profileId)
                )
            )
            .concat(newJoin);

          localStorage.setItem(
            "tournamentJoins",
            JSON.stringify(updatedJoins)
          );
        } catch (storageError) {
          console.warn(
            "Local join cache update skipped:",
            storageError
          );
        }

        /* ==========================================
           REFRESH BALANCE
        ========================================== */

        await loadBalance();

        /* ==========================================
           GO TO MY MATCHES
        ========================================== */

        navigate("/my-matches", {
          replace: true,
        });

        return;
      }

      /* ==============================================
         INSUFFICIENT BALANCE
      ============================================== */

      if (result?.insufficientBalance === true) {
        setErrorMsg(
          result?.message ||
          "❌ Wallet balance insufficient."
        );

        if (
          Number.isFinite(
            Number(result?.balance)
          )
        ) {
          setBalance(Number(result.balance));
        }

        return;
      }

      /* ==============================================
         ALREADY JOINED
      ============================================== */

      if (result?.alreadyJoined === true) {
        setIsJoined(true);

        setErrorMsg(
          result?.message ||
          "❌ Already joined this tournament!"
        );

        return;
      }

      /* ==============================================
         TOURNAMENT FULL
      ============================================== */

      if (
        String(result?.message || "")
          .toLowerCase()
          .includes("full")
      ) {
        setIsFull(true);

        setErrorMsg(
          result?.message ||
          "🔴 Tournament Full!"
        );

        return;
      }

      /* ==============================================
         SERVER REJECTED JOIN
      ============================================== */

      console.error(
        "Server rejected join:",
        result
      );

      setErrorMsg(
        result?.message ||
        result?.error ||
        "Tournament join failed"
      );
    } catch (error) {
      console.error(
        "Complete join failed:",
        error
      );

      setErrorMsg(
        error?.message ||
        "Join failed"
      );
    } finally {
      setIsLoading(false);
    }
  };

  /* ============================================================
     UI
     ============================================================ */

  return (
    <div className="tdm-page">
      <div className="tdm-container">

        {/* HEADER */}

        <div className="tdm-header">
          <h1 className="tdm-title">
            {tournament.name}
          </h1>

          <p className="tdm-subtitle">
            Mode:{" "}
            {tournament.mode}
            {" • "}
            {tournament.rulesShort}
          </p>
        </div>

        {/* TOURNAMENT INFO */}

        <div className="tournament-info">

          {/* ENTRY FEE */}

          <div className="info-card">
            <div className="info-label">
              💰 Entry Fee
            </div>

            <div className="info-value">
              ₹{tournamentEntryFee}
            </div>
          </div>

          {/* WALLET */}

          <div className="info-card">
            <div className="info-label">
              💳 Wallet
            </div>

            <div
              className={`info-value ${
                balance >= tournamentEntryFee
                  ? "success"
                  : "warning"
              }`}
            >
              ₹
              {balance.toLocaleString("en-IN")}

              {balance < tournamentEntryFee && (
                <span className="insufficient">
                  {" "}❌ Add Funds
                </span>
              )}
            </div>
          </div>

          {/* PRIZE */}

          <div className="info-card">
            <div className="info-label">
              🏆 Prize
            </div>

            <div className="info-value prize">
              ₹{tournamentPrize}
            </div>
          </div>

          {/* SLOTS */}

          <div className="info-card">
            <div className="info-label">
              📊 Slots
            </div>

            <div
              className={`info-value slots ${
                isFull ? "full-slots" : ""
              }`}
            >
              {isInitialLoading
                ? "⏳"
                : `${liveSlots}/${maxSlots}`}

              {isFull && !isInitialLoading && (
                <span className="full-badge">
                  FULL
                </span>
              )}
            </div>
          </div>
        </div>

        {/* REGISTER SECTION */}

        <div className="register-section">

          {/* INITIAL LOADING */}

          {isInitialLoading ? (
            <div className="status-card loading">
              <h3>
                ⏳ Checking Status...
              </h3>

              <p>
                Loading tournament data...
              </p>
            </div>
          ) : isFull ? (

            /* FULL */

            <div className="status-card full">
              <h3>
                🔴 Tournament FULL
              </h3>
            </div>
          ) : isJoined ? (

            /* ALREADY JOINED */

            <div className="status-card joined">
              <h3>
                ✅ Already Joined!
              </h3>
            </div>
          ) : (

            /* JOIN FORM */

            <>
              {errorMsg && (
                <div className="status-card error">
                  <h3>
                    {errorMsg}
                  </h3>
                </div>
              )}

              <form
                className="register-form"
                onSubmit={handleSubmit}
              >

                {/* PLAYER NAME */}

                <div className="form-group">
                  <label className="form-label">
                    🎮 BGMI ID NAME
                  </label>

                  <input
                    name="bgmiIdName"
                    type="text"
                    className="form-input"
                    required
                    placeholder="BGMI Player Name"
                    maxLength={20}
                    autoComplete="off"
                    disabled={isLoading}
                  />
                </div>

                {/* PLAYER ID */}

                <div className="form-group">
                  <label className="form-label">
                    📱 BGMI ID NUMBER
                  </label>

                  <input
                    name="bgmiIdNumber"
                    type="text"
                    className="form-input"
                    required
                    placeholder="Enter BGMI ID"
                    maxLength={12}
                    inputMode="numeric"
                    autoComplete="off"
                    onChange={(e) => {
                      e.target.value =
                        e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 12);
                    }}
                    disabled={isLoading}
                  />
                </div>

                {/* JOIN BUTTON */}

                <button
                  type="submit"
                  className={`submit-btn ${
                    isLoading ||
                    balance < tournamentEntryFee
                      ? "disabled"
                      : ""
                  }`}
                  disabled={
                    isLoading ||
                    balance < tournamentEntryFee
                  }
                >
                  {isLoading
                    ? "⏳ Processing..."
                    : `✅ JOIN (₹${tournamentEntryFee})`}
                </button>

              </form>
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default TournamentDetails;

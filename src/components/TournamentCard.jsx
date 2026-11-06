
import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import "./TournamentCard.css";

const TournamentCard = ({ t }) => {
  const [isJoined, setIsJoined] = useState(false);
  const [isFull, setIsFull] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [registeredSlots, setRegisteredSlots] = useState(0);
  const [maxSlots, setMaxSlots] = useState(
    Number(t?.totalSlots ?? t?.slots ?? 50)
  );

  const mountedRef = useRef(false);
  const checkTimeoutRef = useRef(null);
  const checkingRef = useRef(false);

  const API_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:5002"
      : "https://deposit-and-join-tournament-server.onrender.com";

  // ==========================================
  // TOURNAMENT DETAILS
  // ==========================================

  const tournamentId = String(
    t?.id || t?.tournament_id || ""
  );

  const tournamentDate = t?.date || "";

  const tournamentTime = t?.time || "";

  const tournamentName =
    t?.name || t?.tournament_name || "BGMI Tournament";

  const tournamentMode =
    t?.mode || t?.game_mode || "Classic";

  const tournamentType =
    t?.type || t?.match_type || "";

  const entryFee =
    t?.entryFee ?? t?.entry_fee ?? 0;

  const perKill =
    t?.perKill ?? t?.per_kill;

  const winnerPrize =
    t?.winnerPrize ??
    t?.prizePool ??
    t?.prize_pool;

  const teamType =
    t?.teamType || t?.team_type || "";

  // ==========================================
  // GET LOGGED-IN USER PROFILE ID
  // ==========================================

  const getProfileId = useCallback(() => {
    try {
      const storedUser = JSON.parse(
        localStorage.getItem("bgmi_user") || "null"
      );

      return (
        storedUser?.profile_id ||
        storedUser?.user?.profile_id ||
        ""
      );
    } catch (error) {
      console.error("Profile ID read failed:", error);
      return "";
    }
  }, []);

  // ==========================================
  // MAP BACKGROUND
  // ==========================================

  const getTournamentBackground = (id, map) => {
    const backgrounds = {
      GYJHYTU: "/assets/tournaments/livik.webp",
      CVGFDC5: "/assets/tournaments/livik.webp",
      KFHU41R: "/assets/tournaments/erangel.webp",
      LOIUJ77: "/assets/tournaments/Miramar.webp",
      ASDFG65: "/assets/tournaments/erangel.webp",
    };

    if (backgrounds[id]) {
      return backgrounds[id];
    }

    const normalizedMap = String(map || "").toLowerCase();

    if (normalizedMap.includes("livik")) {
      return "/assets/tournaments/livik.webp";
    }

    if (normalizedMap.includes("erangel")) {
      return "/assets/tournaments/erangel.webp";
    }

    if (normalizedMap.includes("miramar")) {
      return "/assets/tournaments/Miramar.webp";
    }

    return "";
  };

  // ==========================================
  // CHECK TOURNAMENT STATUS
  // ==========================================

  const checkStatus = useCallback(
    async (isInitial = false) => {
      if (checkingRef.current || !tournamentId) {
        return;
      }

      checkingRef.current = true;

      if (isInitial && mountedRef.current) {
        setIsInitialLoading(true);
      }

      try {
        // Date and time are required by backend.
        const params = new URLSearchParams();

        params.set("date", tournamentDate);
        params.set("time", tournamentTime);

        // ======================================
        // GET REGISTERED SLOTS
        // ======================================

        const slotsRes = await fetch(
          `${API_URL}/api/tournament-slots-count/${encodeURIComponent(
            tournamentId
          )}?${params.toString()}`
        );

        const slotsData = await slotsRes.json().catch(() => ({}));

        if (!slotsRes.ok) {
          throw new Error(
            slotsData.message ||
              slotsData.error ||
              "Slots API failed"
          );
        }

        if (!mountedRef.current) return;

        const registered = Number(
          slotsData.registered ?? 0
        );

        const actualMaxSlots = Number(
          slotsData.max ??
            t?.totalSlots ??
            t?.slots ??
            50
        );

        const safeMaxSlots =
          Number.isFinite(actualMaxSlots) && actualMaxSlots > 0
            ? actualMaxSlots
            : 50;

        setRegisteredSlots(registered);
        setMaxSlots(safeMaxSlots);
        setIsFull(registered >= safeMaxSlots);

        // ======================================
        // CHECK WHETHER USER ALREADY JOINED
        // ======================================

        const profileId = getProfileId();

        if (profileId) {
          const joinParams = new URLSearchParams();

          joinParams.set("profileId", profileId);
          joinParams.set("date", tournamentDate);
          joinParams.set("time", tournamentTime);

          const joinRes = await fetch(
            `${API_URL}/api/check-join/${encodeURIComponent(
              tournamentId
            )}?${joinParams.toString()}`
          );

          const joinData = await joinRes.json().catch(() => ({}));

          if (!joinRes.ok) {
            throw new Error(
              joinData.message ||
                joinData.error ||
                "Join status API failed"
            );
          }

          if (!mountedRef.current) return;

          setIsJoined(Boolean(joinData.joined));
        } else {
          setIsJoined(false);
        }
      } catch (error) {
        console.error(
          `Tournament status check failed (${tournamentId}):`,
          error
        );
      } finally {
        checkingRef.current = false;

        if (mountedRef.current) {
          setIsInitialLoading(false);
        }
      }
    },
    [
      API_URL,
      tournamentId,
      tournamentDate,
      tournamentTime,
      getProfileId,
      t?.totalSlots,
      t?.slots,
    ]
  );

  // ==========================================
  // INITIAL LOAD + AUTO REFRESH
  // ==========================================

  useEffect(() => {
    mountedRef.current = true;

    checkStatus(true);

    const scheduleNextCheck = () => {
      if (!mountedRef.current) return;

      checkTimeoutRef.current = setTimeout(async () => {
        if (!mountedRef.current) return;

        await checkStatus(false);

        scheduleNextCheck();
      }, 10000);
    };

    scheduleNextCheck();

    return () => {
      mountedRef.current = false;

      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current);
      }
    };
  }, [checkStatus]);

  // ==========================================
  // SLOTS PROGRESS
  // ==========================================

  const filledPercent =
    maxSlots > 0
      ? Math.min(
          100,
          Math.round((registeredSlots / maxSlots) * 100)
        )
      : 0;

  // ==========================================
  // MAP BACKGROUND
  // ==========================================

  const mapBackground = getTournamentBackground(
    tournamentId,
    t?.map
  );

  // ==========================================
  // UI
  // ==========================================

  return (
    <div
      className={`tour-card ${
        String(tournamentType).toLowerCase() === "tdm"
          ? "tdm-card"
          : ""
      }`}
      style={{
        "--map-bg": mapBackground
          ? `url("${mapBackground}")`
          : "none",
      }}
    >
      {/* TOURNAMENT TITLE */}

      <h3 className="tour-title">
        {tournamentName}
      </h3>

      {/* TOURNAMENT ID */}

      {(t?.tournamentId || t?.tournament_id) && (
        <p className="tour-meta tour-meta-id">
          <span className="meta-label">
            Tournament ID
          </span>

          <span className="meta-value">
            {t.tournamentId || t.tournament_id}
          </span>
        </p>
      )}

      {/* TEAM TYPE */}

      {teamType && (
        <p className="tour-meta">
          <span className="meta-label">
            Team Type
          </span>

          <span className="meta-value">
            {teamType}
          </span>
        </p>
      )}

      {/* MAP */}

      {t?.map && (
        <p className="tour-meta map-line">
          <span className="meta-label">
            Map
          </span>

          <span className="meta-value map-highlight">
            {t.map}
          </span>
        </p>
      )}

      {/* MODE */}

      <p className="tour-meta">
        <span className="meta-label">
          Mode
        </span>

        <span className="meta-value">
          {tournamentMode}
        </span>
      </p>

      {/* DATE */}

      {tournamentDate && (
        <p className="tour-meta">
          <span className="meta-label">
            Date
          </span>

          <span className="meta-value">
            {tournamentDate}
          </span>
        </p>
      )}

      {/* TIME */}

      <p className="tour-meta time-line">
        <span className="meta-label">
          Time
        </span>

        <span className="meta-value time-highlight">
          {tournamentTime || "Not specified"}
        </span>
      </p>

      {/* ENTRY */}

      <p className="tour-meta">
        <span className="meta-label">
          Entry
        </span>

        <span className="meta-value highlight-money">
          ₹{entryFee}
        </span>
      </p>

      {/* PER KILL */}

      {perKill !== undefined && perKill !== null && (
        <p className="tour-meta">
          <span className="meta-label">
            Per Kill
          </span>

          <span className="meta-value highlight-money">
            ₹{perKill}
          </span>
        </p>
      )}

      {/* WINNER PRIZE */}

      {winnerPrize !== undefined && winnerPrize !== null && (
        <p className="tour-meta">
          <span className="meta-label">
            Winner Prize
          </span>

          <span className="meta-value highlight-prize">
            ₹{winnerPrize}
          </span>
        </p>
      )}

      {/* FOOTER */}

      <div className="tour-footer">
        <div className="tour-slots-wrap">
          <span
            className={`tour-slots ${
              isFull ? "slots-full" : ""
            }`}
          >
            <span className="meta-label">
              Slots
            </span>

            <span className="meta-value live-slots">
              {isInitialLoading
                ? "⏳"
                : `${registeredSlots}/${maxSlots}`}

              {isFull && !isInitialLoading && (
                <span className="full-badge">
                  🔴 FULL
                </span>
              )}
            </span>
          </span>

          <div className="slots-progress-wrap">
            <div
              className="slots-progress-track"
              role="progressbar"
              aria-valuenow={filledPercent}
              aria-valuemin="0"
              aria-valuemax="100"
              aria-label="Tournament slots progress"
            >
              <div
                className={`slots-progress-fill ${
                  isFull ? "full" : ""
                }`}
                style={{
                  width: isInitialLoading
                    ? "0%"
                    : `${filledPercent}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* BUTTON STATE */}

        {isInitialLoading ? (
          <button
            type="button"
            className="btn-tour btn-loading"
            disabled
          >
            Checking...
          </button>
        ) : isFull ? (
          <button
            type="button"
            className="btn-tour btn-full"
            disabled
          >
            Tournament Full
          </button>
        ) : isJoined ? (
          <button
            type="button"
            className="btn-tour btn-joined"
            disabled
          >
            ✅ JOINED
          </button>
        ) : (
          <Link
            to={`/tournaments/${tournamentId}`}
            className="btn-tour btn-active"
          >
            Join Now
          </Link>
        )}
      </div>
    </div>
  );
};

export default TournamentCard;

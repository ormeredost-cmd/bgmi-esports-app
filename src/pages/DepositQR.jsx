import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./DepositQR.css";
import { useLoading } from "../context/LoadingContext";

/* ============================= API ============================= */

const DEPOSIT_API =
  window.location.hostname === "localhost"
    ? "http://localhost:5002"
    : "https://deposit-and-join-tournament-server.onrender.com";

/* ============================= ALLOWED AMOUNTS ============================= */
/*
  Frontend validation only.
  Real validation backend par bhi ho rahi hai.
*/

const ALLOWED_DEPOSIT_AMOUNTS = [
  50,
  100,
  200,
  300,
  400,
  500,
  1000,
  5000,
];

/* ============================= COMPONENT ============================= */

export default function DepositQR() {
  const location = useLocation();
  const navigate = useNavigate();

  // 🔥 GLOBAL LOADER
  const { setLoading: setGlobalLoading } = useLoading();

  /* ============================= STATE ============================= */

  const [amount, setAmount] = useState(0);
  const [profileId, setProfileId] = useState("");
  const [utr, setUtr] = useState("");

  // 🔹 Local loading for button state
  const [loading, setLoading] = useState(false);

  const [success, setSuccess] = useState(false);

  /* ============================= LOAD PAGE DATA ============================= */

  useEffect(() => {
    /* -------------------------------------------------------------
       GET SELECTED AMOUNT
       ------------------------------------------------------------- */

    const selectedAmount = Number(
      location.state?.amount
    );

    /*
      Agar user directly /deposit/qr open kare
      ya invalid amount aaye to deposit page par bhej denge.
    */

    if (
      !Number.isInteger(selectedAmount) ||
      !ALLOWED_DEPOSIT_AMOUNTS.includes(
        selectedAmount
      )
    ) {
      navigate("/deposit", {
        replace: true,
      });

      return;
    }

    setAmount(selectedAmount);

    /* -------------------------------------------------------------
       GET LOGGED-IN USER
       ------------------------------------------------------------- */

    try {
      const storedUser =
        localStorage.getItem(
          "bgmi_user"
        );

      if (!storedUser) {
        alert(
          "Please login first"
        );

        navigate("/login", {
          replace: true,
        });

        return;
      }

      const parsedUser =
        JSON.parse(storedUser);

      /*
        Current structure:
        parsedUser.profile_id

        Compatibility:
        parsedUser.user.profile_id
      */

      const realProfileId =
        parsedUser?.profile_id ||
        parsedUser?.user?.profile_id;

      if (!realProfileId) {
        alert(
          "User session is invalid. Please login again."
        );

        localStorage.removeItem(
          "bgmi_user"
        );

        navigate("/login", {
          replace: true,
        });

        return;
      }

      setProfileId(
        String(
          realProfileId
        ).trim()
      );

      console.log(
        "👤 Deposit profile:",
        realProfileId
      );

    } catch (error) {
      console.error(
        "❌ SESSION PARSE ERROR:",
        error
      );

      localStorage.removeItem(
        "bgmi_user"
      );

      navigate("/login", {
        replace: true,
      });
    }
  }, [
    location.state,
    navigate,
  ]);

  /* ============================= UTR VALIDATION ============================= */

  const isValidUtr =
    /^\d{12}$/.test(
      utr
    );

  /* ============================= SUBMIT DEPOSIT ============================= */

  const handleSubmit = async () => {
    /* -------------------------------------------------------------
       PROFILE VALIDATION
       ------------------------------------------------------------- */

    if (!profileId) {
      alert(
        "Invalid user session. Please login again."
      );

      localStorage.removeItem(
        "bgmi_user"
      );

      navigate("/login");

      return;
    }

    /* -------------------------------------------------------------
       AMOUNT VALIDATION
       ------------------------------------------------------------- */

    if (
      !Number.isInteger(amount) ||
      !ALLOWED_DEPOSIT_AMOUNTS.includes(
        amount
      )
    ) {
      alert(
        "Invalid deposit amount."
      );

      navigate("/deposit");

      return;
    }

    /* -------------------------------------------------------------
       UTR VALIDATION
       ------------------------------------------------------------- */

    const cleanUtr =
      utr.trim();

    if (
      !/^\d{12}$/.test(
        cleanUtr
      )
    ) {
      alert(
        "Enter valid 12 digit UTR"
      );

      return;
    }

    /* -------------------------------------------------------------
       PREVENT DOUBLE CLICK
       ------------------------------------------------------------- */

    if (loading) {
      return;
    }

    setLoading(true);

    // 🔥 GLOBAL LOADER START
    setGlobalLoading(true);

    try {
      /* ============================================================
         ONLY TRUSTED FIELDS FROM FRONTEND
         ============================================================ */

      const payload = {
        profileId:
          profileId,

        amount:
          amount,

        utr:
          cleanUtr,
      };

      console.log(
        "📤 DEPOSIT REQUEST:",
        {
          profileId:
            profileId,

          amount:
            amount,

          utr:
            "********" +
            cleanUtr.slice(-4),
        }
      );

      /* -------------------------------------------------------------
         API REQUEST
         ------------------------------------------------------------- */

      const response =
        await fetch(
          `${DEPOSIT_API}/api/deposit`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                payload
              ),
          }
        );

      /* -------------------------------------------------------------
         RESPONSE PARSE
         ------------------------------------------------------------- */

      let data = null;

      try {
        data =
          await response.json();
      } catch (jsonError) {
        console.error(
          "❌ INVALID SERVER RESPONSE:",
          jsonError
        );

        throw new Error(
          "Invalid server response"
        );
      }

      console.log(
        "📥 DEPOSIT RESPONSE:",
        data
      );

      /* -------------------------------------------------------------
         SERVER VALIDATION
         ------------------------------------------------------------- */

      if (
        !response.ok ||
        data?.success !== true
      ) {
        throw new Error(
          data?.message ||
            "Deposit request failed"
        );
      }

      /* -------------------------------------------------------------
         SUCCESS
         ------------------------------------------------------------- */

      setSuccess(true);

      /*
        Success screen show karne ke baad
        global loader hata do.
      */

      setGlobalLoading(false);

      /*
        History page par bhejne se pehle
        short success message show hoga.
      */

      setTimeout(() => {
        navigate(
          "/deposit-history",
          {
            replace: true,
          }
        );
      }, 2000);

    } catch (error) {
      console.error(
        "❌ DEPOSIT ERROR:",
        error
      );

      alert(
        error?.message ||
          "Deposit failed. Please try again."
      );

    } finally {
      setLoading(false);

      // 🔥 GLOBAL LOADER STOP
      setGlobalLoading(false);
    }
  };

  /* ============================= SUCCESS SCREEN ============================= */

  if (success) {
    return (
      <div className="qr-success">
        <div className="success-icon">
          ✅
        </div>

        <h2>
          Deposit Request Created
        </h2>

        <p>
          ₹{amount} — Pending approval
        </p>

        <p>
          UTR: {utr}
        </p>
      </div>
    );
  }

  /* ============================= MAIN PAGE ============================= */

  return (
    <div className="qr-page">
      {/* ============================= TITLE ============================= */}

      <h2 className="qr-title">
        Pay ₹{amount}
      </h2>

      <p className="qr-subtitle">
        Enter UTR after UPI payment
      </p>

      {/* ============================= UTR ============================= */}

      <div className="utr-section">
        <label htmlFor="utr-input">
          Enter UTR (12 digits)
        </label>

        <input
          id="utr-input"
          type="text"
          value={utr}
          maxLength={12}
          inputMode="numeric"
          autoComplete="off"
          placeholder="123456789012"
          onChange={(e) => {
            const value =
              e.target.value
                .replace(/\D/g, "")
                .slice(0, 12);

            setUtr(value);
          }}
          disabled={loading}
        />

        {/* ============================= UTR STATUS ============================= */}

        {utr.length > 0 &&
          utr.length < 12 && (
            <p className="utr-hint">
              Enter all 12 digits
            </p>
          )}

        {utr.length === 12 &&
          !isValidUtr && (
            <p className="utr-hint">
              Invalid UTR
            </p>
          )}
      </div>

      {/* ============================= SUBMIT ============================= */}

      <button
        type="button"
        className="submit-btn"
        disabled={
          loading ||
          !profileId ||
          !isValidUtr ||
          !ALLOWED_DEPOSIT_AMOUNTS.includes(
            amount
          )
        }
        onClick={
          handleSubmit
        }
      >
        {loading
          ? "Processing..."
          : "Confirm & Submit"}
      </button>
    </div>
  );
}
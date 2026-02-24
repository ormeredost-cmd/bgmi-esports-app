// src/pages/BankDetails.jsx - FIXED & PRODUCTION READY ✅
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "./BankDetails.css";

const BankDetails = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [bankData, setBankData] = useState({
    account_holder: "",
    account_number: "",
    bank_name: "",
    upi_id: "",
    ifsc_code: "",
  });

  const [userId, setUserId] = useState("");
  const [realProfileName, setRealProfileName] = useState("");

  // ✅ Helper: get bgmi_user from localStorage OR sessionStorage
  const getStoredUser = () => {
    try {
      let userData = localStorage.getItem("bgmi_user");
      if (!userData) userData = sessionStorage.getItem("bgmi_user");
      if (!userData) return null;
      return JSON.parse(userData);
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const initBankDetails = async () => {
      try {
        const user = getStoredUser();

        if (!user?.profile_id) {
          navigate("/login");
          return;
        }

        setUserId(user.profile_id);

        // 🔥 FIXED: सिर्फ username select करें (name column हटाया)
        const { data: profile, error: profileErr } = await supabase
          .from("registeruser")
          .select("username, profile_id")  // ✅ FIXED: name हटाया
          .eq("profile_id", user.profile_id)
          .maybeSingle();

        if (profileErr) {
          console.log("Profile fetch error:", profileErr.message);
        }

        // ✅ FINAL NAME (priority wise)
        const finalName =
          profile?.username?.trim() ||
          user?.username?.trim() ||
          user?.name?.trim() ||
          "Unknown Player";

        setRealProfileName(finalName);

        // ✅ 2) Fetch existing bank details
        const { data: existing, error } = await supabase
          .from("user_bank_details")
          .select("*")
          .eq("user_id", user.profile_id)
          .maybeSingle();

        if (error) {
          console.log("Bank fetch error:", error.message);
          return;
        }

        if (existing) {
          setBankData({
            account_holder: existing.account_holder || "",
            account_number: existing.account_number || "",
            bank_name: existing.bank_name || "",
            upi_id: existing.upi_id || "",
            ifsc_code: existing.ifsc_code || "",
          });

          setSuccess(existing.is_verified === true);

          // ✅ If old bank record has BGMI Player, auto fix in UI
          if (
            existing.profile_name === "BGMI Player" ||
            existing.profile_name === "" ||
            existing.profile_name === null
          ) {
            console.log("Old profile_name found, will update on next save.");
          }
        }
      } catch (err) {
        console.log("Init error:", err.message);
      }
    };

    initBankDetails();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userId) return alert("❌ User ID missing!");
    if (success) return alert("✅ Already verified, edit not allowed!");

    setLoading(true);

    try {
      // ✅ ALWAYS REAL NAME - REQUIRED FIELD
      const profileName = realProfileName?.trim() || "Unknown Player";

      const cleanAccountHolder = bankData.account_holder.trim();
      const cleanAccountNumber = bankData.account_number.trim();
      const cleanBankName = bankData.bank_name?.trim();
      const cleanUpi = bankData.upi_id?.trim() ? bankData.upi_id.trim() : null;
      const cleanIfsc = bankData.ifsc_code.trim().toUpperCase();

      // ✅ Validation
      if (!cleanAccountHolder || !cleanAccountNumber || !cleanBankName || !cleanIfsc) {
        return alert("❌ Fill all required fields!");
      }

      // ✅ search tags safe
      const firstName = cleanAccountHolder.split(" ")[0] || "";
      const searchTags = [cleanBankName, firstName, profileName].filter(Boolean);

      const payload = {
        user_id: userId,
        profile_name: profileName, // ✅ REQUIRED - ये fix हो गया
        account_holder: cleanAccountHolder,
        account_number: cleanAccountNumber,
        bank_name: cleanBankName,
        upi_id: cleanUpi,
        ifsc_code: cleanIfsc,
        is_active: true,
        is_verified: false,
        search_tags: searchTags,
      };

      console.log("💾 SAVING PAYLOAD:", payload);

      // ✅ Check existing record
      const { data: existing, error: existErr } = await supabase
        .from("user_bank_details")
        .select("id, is_verified")
        .eq("user_id", userId)
        .maybeSingle();

      if (existErr) throw new Error(existErr.message);

      if (existing?.is_verified === true) {
        setSuccess(true);
        alert("✅ Already verified, edit not allowed!");
        return;
      }

      let result;

      if (existing?.id) {
        // UPDATE existing
        result = await supabase
          .from("user_bank_details")
          .update(payload)
          .eq("user_id", userId)
          .select()
          .maybeSingle();
      } else {
        // INSERT new
        result = await supabase
          .from("user_bank_details")
          .insert([payload])
          .select()
          .maybeSingle();
      }

      if (result.error) throw new Error(result.error.message);

      console.log("✅ BANK SAVED:", result.data);
      alert("✅ Bank Details Saved! Admin will verify 💰");

      setTimeout(() => {
        navigate("/profile");
      }, 1000);

    } catch (error) {
      console.error("❌ SAVE ERROR:", error);
      alert("❌ Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bank-container">
      <div className="bank-card">
        <div className="bank-inner-card">
          <div className="card-header">
            <div className="icon-circle">
              <span className="bank-icon">🏦</span>
            </div>

            <h1 className="card-title">Bank Details</h1>

            {/* ✅ SHOW REAL NAME & USER ID */}
            <p className="card-subtitle">
              Profile: <b>{realProfileName || "Loading..."}</b> 
              <span style={{ fontSize: '0.9em', opacity: 0.8 }}>
                (ID: {userId})
              </span>
            </p>
          </div>

          <form className="bank-form" onSubmit={handleSubmit}>
            {/* ACCOUNT HOLDER */}
            <div className="form-group">
              <label className="form-label">
                <span className="label-icon">👤</span>
                Account Holder
              </label>
              <input
                type="text"
                value={bankData.account_holder}
                onChange={(e) =>
                  setBankData({ ...bankData, account_holder: e.target.value })
                }
                className="form-input"
                placeholder="Full name as per bank"
                required={!success}
                disabled={success || loading}
              />
            </div>

            {/* ACCOUNT NUMBER */}
            <div className="form-group">
              <label className="form-label">
                <span className="label-icon">🔢</span>
                Account Number
              </label>
              <input
                type="text"
                value={bankData.account_number}
                onChange={(e) =>
                  setBankData({
                    ...bankData,
                    account_number: e.target.value.replace(/[^0-9]/g, ""),
                  })
                }
                className="form-input"
                placeholder="123456789012"
                maxLength={18}
                required={!success}
                disabled={success || loading}
              />
            </div>

            {/* BANK NAME */}
            <div className="form-group">
              <label className="form-label">
                <span className="label-icon">🏦</span>
                Bank Name
              </label>
              <select
                value={bankData.bank_name}
                onChange={(e) =>
                  setBankData({ ...bankData, bank_name: e.target.value })
                }
                className="form-input"
                required={!success}
                disabled={success || loading}
              >
                <option value="">Select Bank</option>
                <option value="SBI">SBI</option>
                <option value="HDFC">HDFC</option>
                <option value="ICICI">ICICI</option>
                <option value="Axis Bank">Axis Bank</option>
                <option value="PNB">PNB</option>
                <option value="Bank of Baroda">Bank of Baroda</option>
              </select>
            </div>

            {/* UPI */}
            <div className="form-group">
              <label className="form-label">
                <span className="label-icon">📱</span>
                UPI ID (Optional)
              </label>
              <input
                type="text"
                value={bankData.upi_id}
                onChange={(e) =>
                  setBankData({ ...bankData, upi_id: e.target.value })
                }
                className="form-input"
                placeholder="username@ybl"
                disabled={success || loading}
              />
            </div>

            {/* IFSC */}
            <div className="form-group">
              <label className="form-label">
                <span className="label-icon">🔑</span>
                IFSC Code
              </label>
              <input
                type="text"
                value={bankData.ifsc_code}
                onChange={(e) =>
                  setBankData({
                    ...bankData,
                    ifsc_code: e.target.value
                      .toUpperCase()
                      .replace(/[^A-Z0-9]/g, ""),
                  })
                }
                className="form-input"
                placeholder="SBIN0001234"
                maxLength={11}
                required={!success}
                disabled={success || loading}
              />
            </div>

            <div className="form-footer">
              <p>
                {success
                  ? "✅ Verified! Withdrawal ready 💰"
                  : "🔒 Admin approval needed (24hr)"}
              </p>
            </div>

            <button
              type="submit"
              className={`submit-btn ${loading ? "loading" : ""}`}
              disabled={success || loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Saving Bank Details...
                </>
              ) : success ? (
                "✅ Verified!"
              ) : (
                "💰 Save & Continue"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BankDetails;

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

  useEffect(() => {
    const initBankDetails = async () => {
      try {
        let userData = localStorage.getItem("bgmi_user");
        if (!userData) userData = sessionStorage.getItem("bgmi_user");

        if (!userData) {
          navigate("/login");
          return;
        }

        const parsedUser = JSON.parse(userData);
        setUserId(parsedUser.profile_id);

        const { data: existing, error } = await supabase
          .from("user_bank_details")
          .select("*")
          .eq("user_id", parsedUser.profile_id)
          .maybeSingle();

        if (!error && existing) {
          setBankData({
            account_holder: existing.account_holder || "",
            account_number: existing.account_number || "",
            bank_name: existing.bank_name || "",
            upi_id: existing.upi_id || "",
            ifsc_code: existing.ifsc_code || "",
          });

          setSuccess(existing.is_verified || false);
        }
      } catch (err) {
        console.log("No bank data found");
      }
    };

    initBankDetails();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) return;

    setLoading(true);

    try {
      const payload = {
        ...bankData,
        user_id: userId,

        // ⭐ important: verify false on update/insert
        is_verified: false,
      };

      const { data: existing } = await supabase
        .from("user_bank_details")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      let result;

      if (existing?.id) {
        result = await supabase
          .from("user_bank_details")
          .update(payload)
          .eq("user_id", userId);
      } else {
        result = await supabase.from("user_bank_details").insert([payload]);
      }

      if (result.error) {
        alert("❌ " + result.error.message);
      } else {
        alert("✅ Saved! Admin 24hr me verify karega");
        setSuccess(true);
      }
    } catch (error) {
      alert("❌ " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bank-container">
      {/* HEADER */}

      {/* SCROLL AREA */}
      <div className="bank-card">
        {/* ⭐ REAL CARD */}
        <div className="bank-inner-card">
          <div className="card-header">
            <div className="icon-circle">
              <span className="bank-icon">🏦</span>
            </div>

            <h1 className="card-title">Bank Details</h1>
            <p className="card-subtitle">Complete withdrawal setup</p>
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
                disabled={success}
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
                placeholder="Enter account number"
                maxLength={18}
                required={!success}
                disabled={success}
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
                disabled={success}
              >
                <option value="">Select Bank</option>
                <option value="SBI">SBI</option>
                <option value="HDFC">HDFC</option>
                <option value="ICICI">ICICI</option>
                <option value="Axis">Axis</option>
                <option value="PNB">PNB</option>
                <option value="BOB">BOB</option>
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
                disabled={success}
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
                disabled={success}
              />
            </div>

            {/* INFO */}
            <div className="form-footer">
              <p>
                {success
                  ? "✅ Ready for withdrawal"
                  : "🔒 Admin verification needed (24hr)"}
              </p>
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              className="submit-btn"
              disabled={loading || success}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Saving...
                </>
              ) : success ? (
                "✅ Saved!"
              ) : (
                "💰 Save Details"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BankDetails;

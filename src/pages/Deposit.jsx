import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Deposit.css";

const AMOUNTS = [50, 100, 200, 300, 400, 500, 1000, 5000];

export default function Deposit() {
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();

  const handleProceed = () => {
    const stored = localStorage.getItem("bgmi_user");

    // ❌ Not logged in
    if (!stored) {
      alert("Please login to deposit money");
      navigate("/login");
      return;
    }

    const parsed = JSON.parse(stored);

    // ❌ User data missing
    if (!parsed.user || !parsed.token) {
      alert("Invalid login session, please login again");
      localStorage.removeItem("bgmi_user");
      navigate("/login");
      return;
    }

    // ❌ Amount not selected
    if (!selected) {
      alert("Please select amount");
      return;
    }

    // ✅ All good → go to QR page
    navigate("/deposit/qr", {
      state: {
        amount: selected,
        user: parsed.user,
      },
    });
  };

  return (
    <div className="deposit-page">
      <h2 className="deposit-title">Deposit</h2>
      <p className="deposit-subtitle">Select amount to add in wallet</p>

      <div className="amount-grid">
        {AMOUNTS.map((amt) => (
          <button
            key={amt}
            type="button"
            className={`amount-btn ${selected === amt ? "active" : ""}`}
            onClick={() => setSelected(amt)}
          >
            ₹{amt}
          </button>
        ))}
      </div>

      <button
        className="deposit-action"
        disabled={!selected}
        onClick={handleProceed}
      >
        Proceed to Pay
      </button>
    </div>
  );
}

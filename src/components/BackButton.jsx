// src/components/BackButton.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "./BackButton.css";

const BackButton = ({ fallbackPath = "/" }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) {
      // Browser history me previous entry hai to usi pe jao
      navigate(-1);
    } else {
      // Direct open kiya hoga (ya history nahi hai) to fallback route pe bhej do
      navigate(fallbackPath);
    }
  };

  return (
    <button className="back-btn" onClick={handleBack}>
      Back
    </button>
  );
};

export default BackButton;

import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, redirectPath = "/login" }) => {
  try {
    const storedUser = localStorage.getItem("bgmi_user");

    if (!storedUser) {
      console.log("❌ No user found in localStorage");
      return <Navigate to={redirectPath} replace />;
    }

    const parsedUser = JSON.parse(storedUser);

    if (!parsedUser || !parsedUser.email || !parsedUser.profile_id) {
      console.log("❌ Invalid user data in localStorage");
      localStorage.removeItem("bgmi_user");
      return <Navigate to={redirectPath} replace />;
    }

    console.log("✅ ProtectedRoute PASSED");
    return children;
  } catch (error) {
    console.log("❌ Auth parse error:", error);
    localStorage.removeItem("bgmi_user");
    return <Navigate to={redirectPath} replace />;
  }
};

export default ProtectedRoute;
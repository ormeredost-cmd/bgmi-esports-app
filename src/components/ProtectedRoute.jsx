// src/components/ProtectedRoute.jsx
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

const ProtectedRoute = ({ children, redirectPath = "/login" }) => {
  const [user, setUser] = useState(undefined); // undefined = loading, null = no user

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser || null);
    }); // [web:410]

    return () => unsubscribe();
  }, []);

  // Jab tak Firebase se response nahi aata, kuch bhi mat dikhao (ya loader dikha sakte ho)
  if (user === undefined) {
    return null;
  }

  // Agar user nahi hai ya email verify nahi hai to login pe bhejo
  if (!user || !user.emailVerified) {
    return <Navigate to={redirectPath} replace />;
  }

  // Authenticated + verified user ko children render karo
  return children;
};

export default ProtectedRoute;

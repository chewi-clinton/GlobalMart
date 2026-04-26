import React from "react";
import { Navigate } from "react-router-dom";

const getRole = () => {
  try {
    const token = localStorage.getItem("access_token");
    if (!token) return null;
    return JSON.parse(atob(token.split(".")[1]))?.role || null;
  } catch {
    return null;
  }
};

/** Only users with role="admin" can access the wrapped route. */
export const AdminRoute = ({ children }) => {
  const role = getRole();
  if (!role) return <Navigate to="/login" replace />;
  if (role !== "admin") return <Navigate to="/" replace />;
  return children;
};

/** Only users with role="seller" or role="admin" can access the wrapped route. */
export const SellerRoute = ({ children }) => {
  const role = getRole();
  if (!role) return <Navigate to="/login" replace />;
  if (role !== "seller" && role !== "admin") return <Navigate to="/" replace />;
  return children;
};

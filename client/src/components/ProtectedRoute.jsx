import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// ─── ProtectedRoute ───────────────────────────────────────────────────────────
// This component wraps pages that require login
// If user is not logged in → redirect to /login
// If user doesn't have the right role → redirect to their home page
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  // While we're checking if user is logged in, show a loading screen
  // This prevents a flash of the login page on refresh
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <p>Loading...</p>
      </div>
    );
  }

  // If no user is logged in, redirect to login page
  // replace={true} means the current page is replaced in history (can't go back)
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If allowedRoles is provided, check if user's role is allowed
  // Example: allowedRoles={['admin']} means only admins can access
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect cashiers to POS, admins to dashboard
    return (
      <Navigate to={user.role === "admin" ? "/dashboard" : "/pos"} replace />
    );
  }

  // User is logged in and has the right role — render the page
  return children;
};

export default ProtectedRoute;

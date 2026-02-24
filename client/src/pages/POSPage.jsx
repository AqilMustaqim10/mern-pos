import React from "react";
import { useAuth } from "../context/AuthContext";

const POSPage = () => {
  const { user, logout } = useAuth();

  return (
    <div style={{ padding: "40px" }}>
      <h1>POS Screen</h1>
      <p>
        Welcome, {user?.name}! You are logged in as{" "}
        <strong>{user?.role}</strong>.
      </p>
      <br />
      <button
        onClick={logout}
        style={{
          padding: "10px 20px",
          backgroundColor: "#e53e3e",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        Logout
      </button>
    </div>
  );
};

export default POSPage;

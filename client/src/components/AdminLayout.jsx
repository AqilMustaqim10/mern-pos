import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success("Logged out");
    navigate("/login");
  };

  // Nav items for the sidebar
  const navItems = [
    { path: "/dashboard", label: "📊 Dashboard" },
    { path: "/admin/categories", label: "🏷️ Categories" },
    { path: "/admin/products", label: "📦 Products" },
    { path: "/admin/orders", label: "🧾 Orders" },
    { path: "/admin/users", label: "👥 Users" },
    { path: "/pos", label: "🛒 POS Screen" },
  ];

  return (
    <div style={styles.wrapper}>
      {/* ── Sidebar ── */}
      <aside style={styles.sidebar}>
        {/* Logo */}
        <div style={styles.logo}>
          <h2 style={styles.logoText}>🛒 MERN POS</h2>
        </div>

        {/* Navigation links */}
        <nav>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({
                ...styles.navLink,
                backgroundColor: isActive ? "#4f46e5" : "transparent",
                color: isActive ? "white" : "#cbd5e0",
              })}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User info and logout at bottom */}
        <div style={styles.userSection}>
          <p style={styles.userName}>{user?.name}</p>
          <p style={styles.userRole}>{user?.role}</p>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            Logout
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main style={styles.main}>{children}</main>
    </div>
  );
};

const styles = {
  wrapper: { display: "flex", minHeight: "100vh" },
  sidebar: {
    width: "240px",
    backgroundColor: "#1a202c",
    display: "flex",
    flexDirection: "column",
    padding: "0",
    position: "fixed",
    top: 0,
    left: 0,
    bottom: 0,
  },
  logo: { padding: "24px 20px", borderBottom: "1px solid #2d3748" },
  logoText: { color: "white", fontSize: "20px", fontWeight: "700" },
  navLink: {
    display: "block",
    padding: "12px 20px",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.2s",
    margin: "2px 8px",
    borderRadius: "8px",
  },
  userSection: {
    marginTop: "auto",
    padding: "20px",
    borderTop: "1px solid #2d3748",
  },
  userName: { color: "white", fontWeight: "600", fontSize: "14px" },
  userRole: {
    color: "#718096",
    fontSize: "12px",
    marginTop: "2px",
    marginBottom: "12px",
    textTransform: "capitalize",
  },
  logoutBtn: {
    width: "100%",
    padding: "8px",
    backgroundColor: "#e53e3e",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
  },
  main: {
    marginLeft: "240px",
    flex: 1,
    backgroundColor: "#f0f2f5",
    minHeight: "100vh",
  },
};

export default AdminLayout;

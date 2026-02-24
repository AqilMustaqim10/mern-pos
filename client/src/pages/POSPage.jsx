import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { CartProvider } from "../context/CartContext";
import ProductGrid from "../components/pos/ProductGrid";
import CartPanel from "../components/pos/CartPanel";
import ReceiptModal from "../components/pos/ReceiptModal";

const POSPage = () => {
  const { user, logout } = useAuth();

  // Store the last completed order so we can show the receipt
  const [completedOrder, setCompletedOrder] = useState(null);

  // Called when CartPanel successfully creates an order
  const handleOrderComplete = (order) => {
    setCompletedOrder(order); // this opens the receipt modal
  };

  // Called when cashier closes the receipt modal
  const handleCloseReceipt = () => {
    setCompletedOrder(null); // hide receipt, ready for next order
  };

  return (
    // CartProvider wraps the POS page so both ProductGrid and CartPanel
    // can share the same cart state
    <CartProvider>
      <div style={styles.wrapper}>
        {/* ── Top Navigation Bar ── */}
        <header style={styles.navbar}>
          <div style={styles.navLeft}>
            <h1 style={styles.navTitle}>🛒 MERN POS</h1>
          </div>

          <div style={styles.navRight}>
            {/* Show dashboard link for admins */}
            {user?.role === "admin" && (
              <Link to="/dashboard" style={styles.navLink}>
                Dashboard
              </Link>
            )}
            <span style={styles.navUser}>👤 {user?.name}</span>
            <button onClick={logout} style={styles.navLogout}>
              Logout
            </button>
          </div>
        </header>

        {/* ── Main POS Layout ── */}
        {/* Left side: Product grid | Right side: Cart */}
        <div style={styles.posLayout}>
          {/* Product Grid — takes up all remaining space */}
          <ProductGrid />

          {/* Cart Panel — fixed width on the right */}
          <CartPanel onOrderComplete={handleOrderComplete} />
        </div>

        {/* ── Receipt Modal (shown after checkout) ── */}
        {completedOrder && (
          <ReceiptModal order={completedOrder} onClose={handleCloseReceipt} />
        )}
      </div>
    </CartProvider>
  );
};

const styles = {
  wrapper: {
    display: "flex",
    flexDirection: "column",
    height: "100vh", // fill full screen height
    overflow: "hidden", // no page scroll — internal sections scroll
    backgroundColor: "#f0f2f5",
  },
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 24px",
    height: "56px",
    backgroundColor: "#1a202c",
    flexShrink: 0, // don't shrink — always full height
  },
  navLeft: { display: "flex", alignItems: "center" },
  navTitle: { color: "white", fontSize: "20px", fontWeight: "700" },
  navRight: { display: "flex", alignItems: "center", gap: "16px" },
  navLink: { color: "#a0aec0", textDecoration: "none", fontSize: "14px" },
  navUser: { color: "#e2e8f0", fontSize: "14px" },
  navLogout: {
    padding: "6px 14px",
    backgroundColor: "#e53e3e",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
  },
  posLayout: {
    display: "flex",
    flex: 1, // take all space below the navbar
    overflow: "hidden", // important! lets children scroll independently
  },
};

export default POSPage;

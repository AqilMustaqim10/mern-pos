import React, { useState } from "react";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { createOrder } from "../../api/orderAPI";
import toast from "react-hot-toast";
import { useClickFeedback } from "../../hooks/useAnimation";

const CartPanel = ({ onOrderComplete }) => {
  const {
    cartItems,
    discountPercent,
    setDiscountPercent,
    taxBreakdown,
    totalTaxAmount,
    taxRate,
    removeFromCart,
    updateQuantity,
    clearCart,
    subtotal,
    discountAmount,
    taxAmount,
    totalAmount,
    totalItems,
  } = useCart();

  const { ref: chargeBtnRef, triggerFeedback } = useClickFeedback();
  const [tableNumber, setTableNumber] = useState("");

  const { user } = useAuth();

  // Payment method selected by cashier
  const [paymentMethod, setPaymentMethod] = useState("cash");

  // Amount of cash given by customer
  const [amountPaid, setAmountPaid] = useState("");

  // Customer name (optional)
  const [customerName, setCustomerName] = useState("");

  // Whether the checkout confirmation is showing
  const [showCheckout, setShowCheckout] = useState(false);

  // Loading state during order submission
  const [processing, setProcessing] = useState(false);

  // ─── Calculate Change ──────────────────────────────────────────────────────
  const change =
    paymentMethod === "cash"
      ? Math.max(0, Number(amountPaid) - totalAmount)
      : 0;

  // ─── Handle Checkout ───────────────────────────────────────────────────────
  const handleCheckout = async () => {
    // Validate cash payment has enough
    if (paymentMethod === "cash" && Number(amountPaid) < totalAmount) {
      toast.error("Amount paid is less than total");
      return;
    }

    setProcessing(true);

    try {
      // Build order payload to send to backend
      const orderData = {
        items: cartItems.map((item) => ({
          productId: item._id,
          quantity: item.quantity,
          note: item.note || "",
        })),
        discountPercent: Number(discountPercent),
        paymentMethod,
        amountPaid: paymentMethod === "cash" ? Number(amountPaid) : totalAmount,
        customerName: customerName || "Walk-in Customer",
        tableNumber,
      };
      setTableNumber("");

      const res = await createOrder(orderData);

      toast.success(`Order ${res.data.order.orderNumber} completed!`);

      // Clear cart after successful order
      clearCart();
      setShowCheckout(false);
      setAmountPaid("");
      setCustomerName("");

      // Notify parent component (POSPage) that order is done
      // This can be used to show a receipt
      if (onOrderComplete) {
        onOrderComplete(res.data.order);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Checkout failed");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* ── Header ── */}
      <div style={styles.header}>
        <h2 style={styles.title}>🛒 Cart</h2>
        {cartItems.length > 0 && (
          <button onClick={clearCart} style={styles.clearBtn}>
            Clear All
          </button>
        )}
      </div>

      {/* ── Customer Name ── */}
      <div style={styles.customerRow}>
        <div style={{ display: "flex", gap: "8px" }}>
          {/* Customer name */}
          <input
            type="text"
            placeholder="Customer name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            style={{ ...styles.customerInput, flex: 2 }}
          />
          {/* Table number */}
          <input
            type="text"
            placeholder="Table #"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            style={{ ...styles.customerInput, flex: 1 }}
          />
        </div>
      </div>

      {/* ── Cart Items ── */}
      <div style={styles.itemsList}>
        {cartItems.length === 0 ? (
          <div style={styles.emptyCart}>
            <p style={{ fontSize: "40px" }}>🛒</p>
            <p style={{ color: "#a0aec0" }}>Cart is empty</p>
            <p style={{ color: "#cbd5e0", fontSize: "13px" }}>
              Click products to add them
            </p>
          </div>
        ) : (
          cartItems.map((item, index) => (
            <div
              key={item._id}
              className="cart-item-enter"
              style={{
                ...styles.cartItem,
                // Each new item animates in with slight delay based on position
                animation: `slideInRight 0.18s ease-out ${index * 20}ms both`,
              }}
            >
              {/* Item name and price */}
              <div style={styles.itemInfo}>
                <p style={styles.itemName}>{item.name}</p>
                <p style={styles.itemPrice}>RM {item.price.toFixed(2)} each</p>
              </div>

              {/* Quantity controls */}
              <div style={styles.qtyControls}>
                <button
                  onClick={() => updateQuantity(item._id, item.quantity - 1)}
                  style={styles.qtyBtn}
                  className="btn-press"
                >
                  −
                </button>
                <span style={styles.qty}>{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item._id, item.quantity + 1)}
                  style={styles.qtyBtn}
                  className="btn-press"
                >
                  +
                </button>
              </div>

              <div style={styles.itemRight}>
                <p style={styles.itemSubtotal}>RM {item.subtotal.toFixed(2)}</p>
                <button
                  onClick={() => removeFromCart(item._id)}
                  style={styles.removeBtn}
                  className="btn-press"
                >
                  ✕
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── Order Summary ── */}
      {cartItems.length > 0 && (
        <div style={styles.summary}>
          {/* Discount Input */}
          <div style={styles.summaryRow}>
            <span style={styles.summaryLabel}>Discount (%)</span>
            <input
              type="number"
              min="0"
              max="100"
              value={discountPercent}
              onChange={(e) => setDiscountPercent(Number(e.target.value))}
              style={styles.discountInput}
            />
          </div>

          {/* Subtotal */}
          <div style={styles.summaryRow}>
            <span style={styles.summaryLabel}>Subtotal</span>
            <span>RM {subtotal.toFixed(2)}</span>
          </div>

          {/* Discount */}
          {discountAmount > 0 && (
            <div style={styles.summaryRow}>
              <span style={{ ...styles.summaryLabel, color: "#48bb78" }}>
                Discount ({discountPercent}%)
              </span>
              <span style={{ color: "#48bb78" }}>
                − RM {discountAmount.toFixed(2)}
              </span>
            </div>
          )}

          {/* Compound tax lines — one row per active tax */}
          {taxBreakdown.map((tax, i) => (
            <div key={i} style={styles.summaryRow}>
              <span style={styles.summaryLabel}>
                {tax.name} ({tax.rate}%)
              </span>
              <span>RM {tax.amount.toFixed(2)}</span>
            </div>
          ))}

          {/* Divider */}
          <div style={styles.divider} />

          {/* Total */}
          <div style={{ ...styles.summaryRow, marginBottom: "16px" }}>
            <span style={styles.totalLabel}>TOTAL</span>
            <span style={styles.totalAmount}>RM {totalAmount.toFixed(2)}</span>
          </div>

          {/* Payment Method */}
          <div style={styles.paymentMethods}>
            {["cash", "card", "ewallet"].map((method) => (
              <button
                key={method}
                onClick={() => setPaymentMethod(method)}
                style={{
                  ...styles.paymentBtn,
                  backgroundColor:
                    paymentMethod === method ? "#4f46e5" : "#e2e8f0",
                  color: paymentMethod === method ? "white" : "#4a5568",
                }}
              >
                {method === "cash"
                  ? "💵 Cash"
                  : method === "card"
                    ? "💳 Card"
                    : "📱 eWallet"}
              </button>
            ))}
          </div>

          {/* Cash Amount Input (only for cash payment) */}
          {paymentMethod === "cash" && (
            <div style={styles.cashRow}>
              <input
                type="number"
                placeholder="Amount received"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                style={styles.cashInput}
              />
              {/* Quick amount buttons */}
              <div style={styles.quickAmounts}>
                {[1, 5, 10, 20, 50, 100].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setAmountPaid(amount)}
                    style={styles.quickAmountBtn}
                  >
                    {amount}
                  </button>
                ))}
              </div>

              {/* Change display */}
              {amountPaid && Number(amountPaid) >= totalAmount && (
                <div style={styles.changeDisplay}>
                  <span>Change:</span>
                  <span style={{ fontWeight: "700", color: "#48bb78" }}>
                    RM {change.toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Charge Button */}
          <button
            ref={chargeBtnRef}
            onClick={handleCheckout}
            disabled={
              processing ||
              (paymentMethod === "cash" &&
                (!amountPaid || Number(amountPaid) < totalAmount))
            }
            // Add pulse animation when charge is ready
            className={`btn-press ${
              !processing &&
              (paymentMethod !== "cash" ||
                (amountPaid && Number(amountPaid) >= totalAmount))
                ? "charge-btn-ready"
                : ""
            }`}
            style={{
              ...styles.chargeBtn,
              opacity: processing ? 0.7 : 1,
            }}
          >
            {processing
              ? "Processing..."
              : `Charge RM ${totalAmount.toFixed(2)}`}
          </button>
        </div>
      )}
    </div>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = {
  container: {
    width: "360px",
    minWidth: "360px",
    backgroundColor: "white",
    display: "flex",
    flexDirection: "column",
    height: "100%",
    borderLeft: "1px solid #e2e8f0",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 20px",
    borderBottom: "1px solid #e2e8f0",
  },
  title: { fontSize: "18px", fontWeight: "700", color: "#1a202c" },
  clearBtn: {
    fontSize: "12px",
    color: "#e53e3e",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontWeight: "600",
  },
  customerRow: { padding: "12px 16px", borderBottom: "1px solid #e2e8f0" },
  customerInput: {
    width: "100%",
    padding: "8px 12px",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "13px",
    boxSizing: "border-box",
  },
  itemsList: {
    flex: 1,
    overflowY: "auto",
    padding: "8px 0",
  },
  emptyCart: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "200px",
    gap: "8px",
  },
  cartItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 16px",
    borderBottom: "1px solid #f7fafc",
  },
  itemInfo: { flex: 1, minWidth: 0 },
  itemName: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#2d3748",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  itemPrice: { fontSize: "11px", color: "#a0aec0", marginTop: "2px" },
  qtyControls: { display: "flex", alignItems: "center", gap: "6px" },
  qtyBtn: {
    width: "26px",
    height: "26px",
    backgroundColor: "#e2e8f0",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
  },
  qty: {
    fontSize: "14px",
    fontWeight: "700",
    minWidth: "24px",
    textAlign: "center",
  },
  itemRight: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "4px",
  },
  itemSubtotal: { fontSize: "14px", fontWeight: "700", color: "#2d3748" },
  removeBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#fc8181",
    fontSize: "12px",
    padding: "2px",
  },
  summary: {
    padding: "16px",
    borderTop: "1px solid #e2e8f0",
    backgroundColor: "#f7fafc",
  },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
    fontSize: "14px",
    color: "#4a5568",
  },
  summaryLabel: { color: "#718096" },
  discountInput: {
    width: "70px",
    padding: "4px 8px",
    border: "1px solid #e2e8f0",
    borderRadius: "6px",
    fontSize: "14px",
    textAlign: "right",
  },
  divider: { height: "1px", backgroundColor: "#e2e8f0", margin: "10px 0" },
  totalLabel: { fontSize: "16px", fontWeight: "700", color: "#1a202c" },
  totalAmount: { fontSize: "20px", fontWeight: "800", color: "#4f46e5" },
  paymentMethods: { display: "flex", gap: "8px", marginBottom: "12px" },
  paymentBtn: {
    flex: 1,
    padding: "8px 4px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "600",
  },
  cashRow: { marginBottom: "12px" },
  cashInput: {
    width: "100%",
    padding: "10px 14px",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "16px",
    boxSizing: "border-box",
    marginBottom: "8px",
  },
  quickAmounts: { display: "flex", gap: "6px", flexWrap: "wrap" },
  quickAmountBtn: {
    padding: "4px 10px",
    backgroundColor: "#ebf4ff",
    color: "#3182ce",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
  },
  changeDisplay: {
    display: "flex",
    justifyContent: "space-between",
    padding: "8px 12px",
    backgroundColor: "#f0fff4",
    borderRadius: "8px",
    marginTop: "8px",
    fontSize: "14px",
    color: "#276749",
  },
  chargeBtn: {
    width: "100%",
    padding: "16px",
    backgroundColor: "#4f46e5",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontSize: "16px",
    fontWeight: "700",
    cursor: "pointer",
  },
};

export default CartPanel;

import React, { useState, useEffect } from "react";
import { fetchOrders } from "../../api/orderAPI";
import toast from "react-hot-toast";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Date filters
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async (filters = {}) => {
    setLoading(true);
    try {
      const res = await fetchOrders(filters);
      setOrders(res.data.orders);
    } catch (error) {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  // Apply date filter
  const handleFilter = () => {
    loadOrders({ startDate, endDate });
  };

  // Reset filter
  const handleReset = () => {
    setStartDate("");
    setEndDate("");
    loadOrders();
  };

  // Payment method badge color
  const paymentColor = {
    cash: { bg: "#f0fff4", color: "#276749" },
    card: { bg: "#ebf4ff", color: "#2b6cb0" },
    ewallet: { bg: "#fffaf0", color: "#c05621" },
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Orders History</h1>

      {/* ── Date Filter ── */}
      <div style={styles.filterRow}>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          style={styles.dateInput}
        />
        <span style={{ color: "#718096" }}>to</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          style={styles.dateInput}
        />
        <button onClick={handleFilter} style={styles.filterBtn}>
          Filter
        </button>
        <button onClick={handleReset} style={styles.resetBtn}>
          Reset
        </button>

        {/* Summary of filtered results */}
        <span style={styles.resultCount}>
          {orders.length} orders · RM{" "}
          {orders.reduce((sum, o) => sum + o.totalAmount, 0).toFixed(2)} total
        </span>
      </div>

      {/* ── Orders Table ── */}
      {loading ? (
        <div style={styles.loading}>Loading orders...</div>
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeader}>
                <th style={styles.th}>Order No</th>
                <th style={styles.th}>Date & Time</th>
                <th style={styles.th}>Customer</th>
                <th style={styles.th}>Cashier</th>
                <th style={styles.th}>Items</th>
                <th style={styles.th}>Payment</th>
                <th style={styles.th}>Total</th>
                <th style={styles.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    style={{
                      textAlign: "center",
                      padding: "40px",
                      color: "#a0aec0",
                    }}
                  >
                    No orders found
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id} style={styles.tableRow}>
                    <td style={styles.td}>
                      <strong style={{ color: "#4f46e5" }}>
                        {order.orderNumber}
                      </strong>
                    </td>
                    <td style={styles.td}>
                      <p style={{ fontSize: "13px" }}>
                        {new Date(order.createdAt).toLocaleDateString("en-MY")}
                      </p>
                      <p style={{ fontSize: "11px", color: "#a0aec0" }}>
                        {new Date(order.createdAt).toLocaleTimeString("en-MY", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </td>
                    <td style={styles.td}>{order.customerName}</td>
                    <td style={styles.td}>{order.cashier?.name}</td>
                    <td style={styles.td}>
                      <span style={styles.itemBadge}>
                        {order.items.length} items
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.paymentBadge,
                          backgroundColor:
                            paymentColor[order.paymentMethod]?.bg,
                          color: paymentColor[order.paymentMethod]?.color,
                        }}
                      >
                        {order.paymentMethod}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <strong>RM {order.totalAmount.toFixed(2)}</strong>
                    </td>
                    <td style={styles.td}>
                      <button
                        onClick={() => setSelectedOrder(order)}
                        style={styles.viewBtn}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Order Detail Modal ── */}
      {selectedOrder && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>{selectedOrder.orderNumber}</h2>
              <button
                onClick={() => setSelectedOrder(null)}
                style={styles.closeBtn}
              >
                ✕
              </button>
            </div>

            {/* Order meta info */}
            <div style={styles.metaGrid}>
              <div style={styles.metaItem}>
                <p style={styles.metaLabel}>Date</p>
                <p style={styles.metaValue}>
                  {new Date(selectedOrder.createdAt).toLocaleString()}
                </p>
              </div>
              <div style={styles.metaItem}>
                <p style={styles.metaLabel}>Customer</p>
                <p style={styles.metaValue}>{selectedOrder.customerName}</p>
              </div>
              <div style={styles.metaItem}>
                <p style={styles.metaLabel}>Cashier</p>
                <p style={styles.metaValue}>{selectedOrder.cashier?.name}</p>
              </div>
              <div style={styles.metaItem}>
                <p style={styles.metaLabel}>Payment</p>
                <p style={styles.metaValue}>{selectedOrder.paymentMethod}</p>
              </div>
            </div>

            {/* Items list */}
            <h4 style={{ marginBottom: "12px", color: "#4a5568" }}>
              Items Ordered
            </h4>
            <div style={styles.itemsList}>
              {selectedOrder.items.map((item, i) => (
                <div key={i} style={styles.orderItem}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: "600", fontSize: "14px" }}>
                      {item.name}
                    </p>
                    <p style={{ color: "#a0aec0", fontSize: "12px" }}>
                      RM {item.price.toFixed(2)} × {item.quantity}
                    </p>
                  </div>
                  <strong>RM {item.subtotal.toFixed(2)}</strong>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div style={styles.totalsBox}>
              <div style={styles.totalRow}>
                <span>Subtotal</span>
                <span>RM {selectedOrder.subtotal.toFixed(2)}</span>
              </div>
              {selectedOrder.discountAmount > 0 && (
                <div style={{ ...styles.totalRow, color: "#48bb78" }}>
                  <span>Discount ({selectedOrder.discountPercent}%)</span>
                  <span>− RM {selectedOrder.discountAmount.toFixed(2)}</span>
                </div>
              )}
              {selectedOrder.taxAmount > 0 && (
                <div style={styles.totalRow}>
                  <span>Tax ({selectedOrder.taxRate}%)</span>
                  <span>RM {selectedOrder.taxAmount.toFixed(2)}</span>
                </div>
              )}
              <div
                style={{
                  ...styles.totalRow,
                  fontSize: "18px",
                  fontWeight: "800",
                  color: "#4f46e5",
                  marginTop: "8px",
                  paddingTop: "8px",
                  borderTop: "2px solid #e2e8f0",
                }}
              >
                <span>TOTAL</span>
                <span>RM {selectedOrder.totalAmount.toFixed(2)}</span>
              </div>
              <div style={{ ...styles.totalRow, color: "#718096" }}>
                <span>Amount Paid</span>
                <span>RM {selectedOrder.amountPaid.toFixed(2)}</span>
              </div>
              {selectedOrder.changeAmount > 0 && (
                <div
                  style={{
                    ...styles.totalRow,
                    color: "#48bb78",
                    fontWeight: "700",
                  }}
                >
                  <span>Change</span>
                  <span>RM {selectedOrder.changeAmount.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { padding: "32px", maxWidth: "1200px", margin: "0 auto" },
  title: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#1a202c",
    marginBottom: "24px",
  },
  filterRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "20px",
    flexWrap: "wrap",
  },
  dateInput: {
    padding: "8px 12px",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "14px",
  },
  filterBtn: {
    padding: "8px 20px",
    backgroundColor: "#4f46e5",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },
  resetBtn: {
    padding: "8px 20px",
    backgroundColor: "#e2e8f0",
    color: "#4a5568",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },
  resultCount: {
    marginLeft: "auto",
    color: "#718096",
    fontSize: "14px",
    fontWeight: "600",
  },
  loading: { textAlign: "center", padding: "60px", color: "#a0aec0" },
  tableContainer: {
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    overflow: "hidden",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  tableHeader: { backgroundColor: "#f7fafc" },
  th: {
    padding: "14px 16px",
    textAlign: "left",
    fontSize: "13px",
    fontWeight: "600",
    color: "#4a5568",
    borderBottom: "1px solid #e2e8f0",
  },
  tableRow: { borderBottom: "1px solid #e2e8f0" },
  td: { padding: "14px 16px", fontSize: "14px", color: "#2d3748" },
  itemBadge: {
    backgroundColor: "#ebf4ff",
    color: "#3182ce",
    padding: "2px 8px",
    borderRadius: "10px",
    fontSize: "12px",
    fontWeight: "600",
  },
  paymentBadge: {
    padding: "3px 10px",
    borderRadius: "10px",
    fontSize: "12px",
    fontWeight: "600",
    textTransform: "capitalize",
  },
  viewBtn: {
    padding: "6px 16px",
    backgroundColor: "#f7fafc",
    color: "#4a5568",
    border: "1px solid #e2e8f0",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
  },
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "white",
    borderRadius: "16px",
    padding: "32px",
    width: "100%",
    maxWidth: "560px",
    maxHeight: "90vh",
    overflowY: "auto",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
  },
  modalTitle: { fontSize: "20px", fontWeight: "700", color: "#4f46e5" },
  closeBtn: {
    background: "none",
    border: "none",
    fontSize: "18px",
    cursor: "pointer",
    color: "#a0aec0",
  },
  metaGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
    marginBottom: "24px",
    backgroundColor: "#f7fafc",
    padding: "16px",
    borderRadius: "10px",
  },
  metaItem: {},
  metaLabel: {
    fontSize: "11px",
    color: "#a0aec0",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginBottom: "2px",
  },
  metaValue: { fontSize: "14px", fontWeight: "600", color: "#2d3748" },
  itemsList: { marginBottom: "20px" },
  orderItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 0",
    borderBottom: "1px solid #f7fafc",
  },
  totalsBox: {
    backgroundColor: "#f7fafc",
    borderRadius: "10px",
    padding: "16px",
  },
  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px",
    fontSize: "14px",
  },
};

export default OrdersPage;

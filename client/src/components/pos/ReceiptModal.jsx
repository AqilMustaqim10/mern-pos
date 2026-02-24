// client/src/components/pos/ReceiptModal.jsx

import React, { useRef, useState } from "react";
import { useSettings } from "../../context/SettingsContext";
import KitchenTicket from "./KitchenTicket";

const ReceiptModal = ({ order, onClose }) => {
  const receiptRef = useRef();
  const { settings } = useSettings();

  // Controls whether kitchen ticket modal is showing
  const [showKitchen, setShowKitchen] = useState(false);

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt - ${order.orderNumber}</title>
          <style>
            body { font-family: monospace; font-size: 12px; padding: 20px; max-width: 300px; }
            .center { text-align: center; }
            .divider { border-top: 1px dashed #000; margin: 8px 0; }
            .row { display: flex; justify-content: space-between; margin: 4px 0; }
            .bold { font-weight: bold; }
          </style>
        </head>
        <body>${receiptRef.current.innerHTML}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  if (!order) return null;

  return (
    <>
      <div style={styles.overlay} className="modal-overlay">
        <div style={styles.modal} className="modal-content">
          {/* Receipt Content */}
          <div ref={receiptRef} style={styles.receipt}>
            {/* Store Header */}
            <div style={{ textAlign: "center", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "20px", fontWeight: "800" }}>
                {settings?.storeName || "MERN POS"}
              </h2>
              {settings?.storeAddress && (
                <p style={{ color: "#718096", fontSize: "11px" }}>
                  {settings.storeAddress}
                </p>
              )}
              {settings?.storePhone && (
                <p style={{ color: "#718096", fontSize: "11px" }}>
                  {settings.storePhone}
                </p>
              )}
            </div>

            {/* Order Info */}
            {[
              { label: "Order No", value: order.orderNumber },
              {
                label: "Date",
                value: new Date(order.createdAt).toLocaleString(),
              },
              { label: "Cashier", value: order.cashier?.name },
              { label: "Customer", value: order.customerName },
              order.tableNumber && { label: "Table", value: order.tableNumber },
            ]
              .filter(Boolean)
              .map((row) => (
                <div key={row.label} style={styles.receiptRow}>
                  <span style={styles.receiptLabel}>{row.label}:</span>
                  <span style={styles.receiptValue}>{row.value}</span>
                </div>
              ))}

            <div style={styles.divider} />

            {/* Items */}
            {order.items.map((item, i) => (
              <div key={i} style={styles.itemRow}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: "600", fontSize: "13px" }}>
                    {item.name}
                  </p>
                  {item.note && (
                    <p
                      style={{
                        color: "#a0aec0",
                        fontSize: "11px",
                        fontStyle: "italic",
                      }}
                    >
                      Note: {item.note}
                    </p>
                  )}
                  <p style={{ color: "#718096", fontSize: "12px" }}>
                    RM {item.price.toFixed(2)} × {item.quantity}
                  </p>
                </div>
                <span style={{ fontWeight: "700", fontSize: "13px" }}>
                  RM {item.subtotal.toFixed(2)}
                </span>
              </div>
            ))}

            <div style={styles.divider} />

            {/* Totals */}
            <div style={styles.receiptRow}>
              <span>Subtotal</span>
              <span>RM {order.subtotal.toFixed(2)}</span>
            </div>

            {order.discountAmount > 0 && (
              <div style={{ ...styles.receiptRow, color: "#48bb78" }}>
                <span>Discount ({order.discountPercent}%)</span>
                <span>− RM {order.discountAmount.toFixed(2)}</span>
              </div>
            )}

            {/* ── Compound tax lines — one row per tax ── */}
            {(order.taxBreakdown || []).map((tax, i) => (
              <div key={i} style={styles.receiptRow}>
                <span>
                  {tax.name} ({tax.rate}%)
                </span>
                <span>RM {tax.amount.toFixed(2)}</span>
              </div>
            ))}

            <div style={styles.divider} />

            <div
              style={{
                ...styles.receiptRow,
                fontSize: "18px",
                fontWeight: "800",
              }}
            >
              <span>TOTAL</span>
              <span>RM {order.totalAmount.toFixed(2)}</span>
            </div>
            <div
              style={{
                ...styles.receiptRow,
                color: "#718096",
                fontSize: "13px",
              }}
            >
              <span>Payment ({order.paymentMethod})</span>
              <span>RM {order.amountPaid.toFixed(2)}</span>
            </div>
            {order.changeAmount > 0 && (
              <div
                style={{
                  ...styles.receiptRow,
                  color: "#48bb78",
                  fontWeight: "700",
                }}
              >
                <span>Change</span>
                <span>RM {order.changeAmount.toFixed(2)}</span>
              </div>
            )}

            <div
              style={{
                textAlign: "center",
                marginTop: "20px",
                color: "#a0aec0",
                fontSize: "12px",
              }}
            >
              <p>
                *** {settings?.receiptFooter || "Thank you, come again!"} ***
              </p>
            </div>
          </div>

          {/* ── Action Buttons — 3 buttons now ── */}
          <div style={styles.btnRow}>
            <button
              onClick={handlePrint}
              style={styles.printBtn}
              className="btn-press"
            >
              🖨️ Customer Receipt
            </button>
            <button
              onClick={() => setShowKitchen(true)}
              style={styles.kitchenBtn}
              className="btn-press"
            >
              🍳 Kitchen Ticket
            </button>
            <button
              onClick={onClose}
              style={styles.closeBtn}
              className="btn-press"
            >
              New Order
            </button>
          </div>
        </div>
      </div>

      {/* Kitchen Ticket Modal — renders on top of receipt modal */}
      {showKitchen && (
        <KitchenTicket order={order} onClose={() => setShowKitchen(false)} />
      )}
    </>
  );
};

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2000,
  },
  modal: {
    backgroundColor: "white",
    borderRadius: "16px",
    padding: "32px",
    width: "100%",
    maxWidth: "400px",
    maxHeight: "90vh",
    overflowY: "auto",
  },
  receipt: { fontFamily: "monospace" },
  receiptRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px",
    fontSize: "13px",
  },
  receiptLabel: { color: "#718096" },
  receiptValue: { fontWeight: "600" },
  divider: { borderTop: "1px dashed #e2e8f0", margin: "12px 0" },
  itemRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "10px",
  },
  btnRow: { display: "flex", gap: "8px", marginTop: "24px" },
  printBtn: {
    flex: 1,
    padding: "12px",
    backgroundColor: "#2d3748",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "13px",
  },
  kitchenBtn: {
    flex: 1,
    padding: "12px",
    backgroundColor: "#c05621",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "13px",
  },
  closeBtn: {
    flex: 1,
    padding: "12px",
    backgroundColor: "#4f46e5",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "13px",
  },
};

export default ReceiptModal;

import React, { useRef } from "react";
import { useSettings } from "../../context/SettingsContext";

const ReceiptModal = ({ order, onClose }) => {
  // ref to the receipt div so we can print it
  const receiptRef = useRef();
  const { settings } = useSettings();

  // ─── Handle Print ──────────────────────────────────────────────────────────
  const handlePrint = () => {
    // Open a new browser window just for printing
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
            .total { font-size: 16px; font-weight: bold; }
          </style>
        </head>
        <body>
          ${receiptRef.current.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print(); // trigger print dialog
    printWindow.close();
  };

  if (!order) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* Receipt Content */}
        <div ref={receiptRef} style={styles.receipt}>
          {/* Store Header */}
          <div style={{ textAlign: "center", marginBottom: "16px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "800" }}>
              {settings?.storeName || "MERN POS"}
            </h2>
            <p style={{ fontSize: "12px", color: "#718096" }}>
              {settings?.storeAddress}
            </p>
          </div>

          {/* Order Info */}
          <div style={styles.receiptRow}>
            <span style={styles.receiptLabel}>Order No:</span>
            <span style={styles.receiptValue}>{order.orderNumber}</span>
          </div>
          <div style={styles.receiptRow}>
            <span style={styles.receiptLabel}>Date:</span>
            <span style={styles.receiptValue}>
              {new Date(order.createdAt).toLocaleString()}
            </span>
          </div>
          <div style={styles.receiptRow}>
            <span style={styles.receiptLabel}>Cashier:</span>
            <span style={styles.receiptValue}>{order.cashier?.name}</span>
          </div>
          <div style={styles.receiptRow}>
            <span style={styles.receiptLabel}>Customer:</span>
            <span style={styles.receiptValue}>{order.customerName}</span>
          </div>

          {/* Divider */}
          <div style={styles.divider} />

          {/* Items */}
          {order.items.map((item, index) => (
            <div key={index} style={styles.itemRow}>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: "600", fontSize: "13px" }}>
                  {item.name}
                </p>
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

          {order.taxAmount > 0 && (
            <div style={styles.receiptRow}>
              <span>Tax ({order.taxRate}%)</span>
              <span>RM {order.taxAmount.toFixed(2)}</span>
            </div>
          )}

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
            style={{ ...styles.receiptRow, color: "#718096", fontSize: "13px" }}
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

          {/* Footer */}
          <div
            style={{
              textAlign: "center",
              marginTop: "20px",
              color: "#a0aec0",
              fontSize: "12px",
            }}
          >
            <p>*** {settings?.receiptFooter || "Thank you, come again!"} ***</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={styles.btnRow}>
          <button onClick={handlePrint} style={styles.printBtn}>
            🖨️ Print Receipt
          </button>
          <button onClick={onClose} style={styles.closeBtn}>
            New Order
          </button>
        </div>
      </div>
    </div>
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
  btnRow: { display: "flex", gap: "12px", marginTop: "24px" },
  printBtn: {
    flex: 1,
    padding: "12px",
    backgroundColor: "#2d3748",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
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
  },
};

export default ReceiptModal;

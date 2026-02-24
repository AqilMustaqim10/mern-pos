// Kitchen ticket is printed separately from customer receipt
// It shows ONLY what the kitchen needs — no prices, big text

import React, { useRef } from "react";

const KitchenTicket = ({ order, onClose }) => {
  const ticketRef = useRef();

  // ─── Print Kitchen Ticket ──────────────────────────────────────────────────
  const handlePrint = () => {
    const printWindow = window.open("", "_blank");

    printWindow.document.write(`
      <html>
        <head>
          <title>Kitchen Ticket - ${order.orderNumber}</title>
          <style>
            /* Kitchen ticket styles — large text, no frills */
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: monospace;
              padding: 16px;
              max-width: 300px;
              font-size: 14px;
            }
            .header {
              text-align: center;
              border-bottom: 3px solid #000;
              padding-bottom: 10px;
              margin-bottom: 10px;
            }
            .order-num {
              font-size: 28px;
              font-weight: 900;
              letter-spacing: 2px;
            }
            .table-name {
              font-size: 18px;
              font-weight: 700;
              margin-top: 4px;
            }
            .timestamp {
              font-size: 12px;
              margin-top: 4px;
            }
            .divider {
              border-top: 2px dashed #000;
              margin: 10px 0;
            }
            .item {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              padding: 8px 0;
              border-bottom: 1px solid #ccc;
            }
            .item-qty {
              font-size: 22px;
              font-weight: 900;
              min-width: 40px;
              color: #000;
            }
            .item-name {
              flex: 1;
              font-size: 16px;
              font-weight: 700;
              padding-left: 8px;
            }
            .item-note {
              font-size: 12px;
              color: #555;
              font-style: italic;
              padding-left: 48px;
              margin-top: 2px;
            }
            .footer {
              text-align: center;
              margin-top: 12px;
              font-size: 12px;
              font-weight: 700;
              letter-spacing: 1px;
            }
          </style>
        </head>
        <body>
          ${ticketRef.current.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  if (!order) return null;

  // Format time as HH:MM
  const orderTime = new Date(order.createdAt).toLocaleTimeString("en-MY", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const orderDate = new Date(order.createdAt).toLocaleDateString("en-MY");

  return (
    <div style={styles.overlay} className="modal-overlay">
      <div style={styles.modal} className="modal-content">
        {/* ── Preview of the kitchen ticket ── */}
        <div ref={ticketRef} style={styles.ticket}>
          {/* Header — big order number */}
          <div style={styles.ticketHeader}>
            {/* KITCHEN label at top */}
            <div style={styles.kitchenLabel}>🍳 KITCHEN</div>

            {/* Big order number */}
            <div style={styles.orderNum}>{order.orderNumber}</div>

            {/* Table / customer */}
            <div style={styles.tableName}>
              {order.tableNumber
                ? `Table: ${order.tableNumber}`
                : order.customerName}
            </div>

            {/* Timestamp */}
            <div style={styles.timestamp}>
              {orderDate} &nbsp;|&nbsp; {orderTime}
            </div>
          </div>

          <div style={styles.divider} />

          {/* ── Items — big and clear ── */}
          <div style={styles.itemsList}>
            {order.items.map((item, index) => (
              <div key={index}>
                <div style={styles.item}>
                  {/* Large quantity number */}
                  <span style={styles.itemQty}>{item.quantity}×</span>

                  {/* Item name */}
                  <span style={styles.itemName}>{item.name}</span>
                </div>

                {/* Special note for this item if any */}
                {item.note && <div style={styles.itemNote}>⚠️ {item.note}</div>}
              </div>
            ))}
          </div>

          <div style={styles.divider} />

          {/* Footer */}
          <div style={styles.ticketFooter}>
            TOTAL ITEMS: {order.items.reduce((sum, i) => sum + i.quantity, 0)}
          </div>
        </div>

        {/* ── Buttons ── */}
        <div style={styles.btnRow}>
          <button
            onClick={handlePrint}
            style={styles.printBtn}
            className="btn-press"
          >
            🖨️ Print Kitchen Ticket
          </button>
          <button
            onClick={onClose}
            style={styles.closeBtn}
            className="btn-press"
          >
            Close
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
    backgroundColor: "rgba(0,0,0,0.7)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2100,
  },
  modal: {
    backgroundColor: "white",
    borderRadius: "16px",
    padding: "28px",
    width: "100%",
    maxWidth: "380px",
  },
  ticket: {
    fontFamily: "monospace",
    border: "2px dashed #333",
    borderRadius: "8px",
    padding: "16px",
    marginBottom: "20px",
    backgroundColor: "#fffef0", // slightly yellow like real thermal paper
  },
  ticketHeader: { textAlign: "center", marginBottom: "4px" },
  kitchenLabel: {
    fontSize: "13px",
    fontWeight: "700",
    backgroundColor: "#1a202c",
    color: "white",
    padding: "2px 12px",
    borderRadius: "4px",
    display: "inline-block",
    marginBottom: "8px",
    letterSpacing: "2px",
  },
  orderNum: {
    fontSize: "32px",
    fontWeight: "900",
    letterSpacing: "3px",
    color: "#1a202c",
  },
  tableName: {
    fontSize: "18px",
    fontWeight: "700",
    marginTop: "4px",
    color: "#2d3748",
  },
  timestamp: {
    fontSize: "12px",
    color: "#718096",
    marginTop: "4px",
  },
  divider: {
    borderTop: "2px dashed #333",
    margin: "12px 0",
  },
  itemsList: { display: "flex", flexDirection: "column", gap: "0" },
  item: {
    display: "flex",
    alignItems: "center",
    padding: "8px 0",
    borderBottom: "1px solid #e2e8f0",
  },
  itemQty: {
    fontSize: "24px",
    fontWeight: "900",
    minWidth: "52px",
    color: "#4f46e5",
  },
  itemName: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#1a202c",
    flex: 1,
  },
  itemNote: {
    fontSize: "12px",
    color: "#c05621",
    fontStyle: "italic",
    paddingLeft: "52px",
    paddingBottom: "6px",
  },
  ticketFooter: {
    textAlign: "center",
    fontWeight: "800",
    fontSize: "13px",
    letterSpacing: "1px",
    color: "#4a5568",
  },
  btnRow: { display: "flex", gap: "10px" },
  printBtn: {
    flex: 1,
    padding: "12px",
    backgroundColor: "#1a202c",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "14px",
  },
  closeBtn: {
    padding: "12px 20px",
    backgroundColor: "#e2e8f0",
    color: "#4a5568",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },
};

export default KitchenTicket;

const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  subtotal: { type: Number, required: true },
  // ── NEW: optional note per item (e.g. "no onion", "extra spicy") ──
  note: { type: String, default: "" },
});

// ─── Tax Snapshot Sub-Schema ───────────────────────────────────────────────────
// We snapshot the taxes at the time of the order
// So future tax changes don't affect old receipts
const taxSnapshotSchema = new mongoose.Schema({
  name: { type: String }, // e.g. "Service Charge"
  rate: { type: Number }, // e.g. 10
  amount: { type: Number }, // actual RM amount charged
  // The running total this tax was calculated ON
  // For compound: service charge base = subtotal
  //               SST base = subtotal + service charge amount
  baseAmount: { type: Number },
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true },
    items: [orderItemSchema],

    // ── Financial breakdown ──
    subtotal: { type: Number, required: true },
    discountAmount: { type: Number, default: 0 },
    discountPercent: { type: Number, default: 0 },

    // NEW: array of applied taxes with their amounts
    taxBreakdown: { type: [taxSnapshotSchema], default: [] },

    // Total of all tax amounts combined
    totalTaxAmount: { type: Number, default: 0 },

    // Final total = subtotal - discount + all taxes
    totalAmount: { type: Number, required: true },

    paymentMethod: {
      type: String,
      enum: ["cash", "card", "ewallet"],
      default: "cash",
    },
    amountPaid: { type: Number, default: 0 },
    changeAmount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["completed", "cancelled", "refunded"],
      default: "completed",
    },
    cashier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    customerName: { type: String, default: "Walk-in Customer" },

    // NEW: table number for FnB
    tableNumber: { type: String, default: "" },

    notes: { type: String, default: "" },
  },
  { timestamps: true },
);

// Auto-generate order number
orderSchema.pre("save", async function () {
  if (!this.isNew) return;
  const count = await mongoose.model("Order").countDocuments();
  this.orderNumber = `ORD-${String(count + 1).padStart(5, "0")}`;
});

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;

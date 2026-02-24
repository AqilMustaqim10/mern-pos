const mongoose = require("mongoose");

// ─── Order Item Sub-Schema ─────────────────────────────────────────────────────
// Each item in an order is stored as a sub-document
// Sub-documents are embedded inside the parent document (Order)
const orderItemSchema = new mongoose.Schema({
  // Reference to the product
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },

  // Store product name at time of purchase
  // Important! Product name might change later, but order history should be preserved
  name: {
    type: String,
    required: true,
  },

  // Store price at time of purchase (price might change later)
  price: {
    type: Number,
    required: true,
  },

  // How many of this product was ordered
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },

  // price × quantity
  subtotal: {
    type: Number,
    required: true,
  },
});

// ─── Main Order Schema ─────────────────────────────────────────────────────────
const orderSchema = new mongoose.Schema(
  {
    // Auto-generated order number e.g. "ORD-001", "ORD-002"
    orderNumber: {
      type: String,
      unique: true,
    },

    // Array of items in this order
    items: [orderItemSchema],

    // Financial breakdown
    subtotal: {
      type: Number,
      required: true, // sum of all item subtotals before discount and tax
    },

    // Discount amount in RM (not percentage)
    discountAmount: {
      type: Number,
      default: 0,
    },

    // Discount percentage applied (stored for receipt display)
    discountPercent: {
      type: Number,
      default: 0,
    },

    // Tax amount (calculated from taxRate in settings)
    taxAmount: {
      type: Number,
      default: 0,
    },

    // Tax rate percentage used (e.g. 6 for 6% SST)
    taxRate: {
      type: Number,
      default: 0,
    },

    // Final amount customer needs to pay
    // subtotal - discountAmount + taxAmount
    totalAmount: {
      type: Number,
      required: true,
    },

    // How customer paid
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "ewallet"],
      default: "cash",
    },

    // How much cash customer gave (for cash payments)
    amountPaid: {
      type: Number,
      default: 0,
    },

    // Change to give back to customer
    // amountPaid - totalAmount
    changeAmount: {
      type: Number,
      default: 0,
    },

    // Order status
    status: {
      type: String,
      enum: ["completed", "cancelled", "refunded"],
      default: "completed",
    },

    // Which cashier processed this order
    cashier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Optional customer name for the receipt
    customerName: {
      type: String,
      default: "Walk-in Customer",
    },

    // Optional notes
    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

// ─── Auto-generate Order Number ────────────────────────────────────────────────
// Before saving, automatically create a unique order number
// Format: ORD-00001, ORD-00002, etc.
orderSchema.pre("save", async function (next) {
  // Only generate order number for NEW orders (not updates)
  if (!this.isNew) return;

  // Count how many orders exist and add 1
  const count = await mongoose.model("Order").countDocuments();

  // Pad the number to 5 digits: 1 becomes "00001"
  this.orderNumber = `ORD-${String(count + 1).padStart(5, "0")}`;
});

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;

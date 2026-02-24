// server/models/Settings.js

const mongoose = require("mongoose");

// ─── Tax Entry Sub-Schema ──────────────────────────────────────────────────────
// Each tax is its own document inside the taxes array
// Example: { name: 'Service Charge', rate: 10, enabled: true, order: 1 }
const taxEntrySchema = new mongoose.Schema({
  // Display name on receipt e.g. "Service Charge", "SST"
  name: {
    type: String,
    required: true,
    trim: true,
  },

  // Percentage rate e.g. 10 for 10%
  rate: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },

  // Whether this tax is currently active
  enabled: {
    type: Boolean,
    default: true,
  },

  // Order of application for compound tax
  // Lower number = applied first
  // e.g. Service Charge order:1, SST order:2
  // SST is then calculated on (subtotal + service charge)
  order: {
    type: Number,
    default: 1,
  },
});

const settingsSchema = new mongoose.Schema(
  {
    storeName: { type: String, default: "My POS Store", trim: true },
    storeAddress: { type: String, default: "", trim: true },
    storePhone: { type: String, default: "", trim: true },
    storeEmail: { type: String, default: "", trim: true },

    // ── NEW: Array of tax entries instead of single tax ──
    // Replaces old taxEnabled, taxRate, taxName fields
    taxes: {
      type: [taxEntrySchema],
      default: [], // no taxes by default
    },

    receiptFooter: { type: String, default: "Thank you for your purchase!" },
    currency: { type: String, default: "RM" },
    currencySymbol: { type: String, default: "RM" },
  },
  { timestamps: true },
);

const Settings = mongoose.model("Settings", settingsSchema);
module.exports = Settings;

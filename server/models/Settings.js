const mongoose = require("mongoose");

// Settings is a SINGLETON document — only one document ever exists
// We always find it with Settings.findOne() and update it
const settingsSchema = new mongoose.Schema(
  {
    // Store information
    storeName: {
      type: String,
      default: "My POS Store",
      trim: true,
    },
    storeAddress: {
      type: String,
      default: "",
      trim: true,
    },
    storePhone: {
      type: String,
      default: "",
      trim: true,
    },
    storeEmail: {
      type: String,
      default: "",
      trim: true,
    },

    // Tax configuration
    taxEnabled: {
      type: Boolean,
      default: false, // tax is off by default
    },
    taxRate: {
      type: Number,
      default: 0, // percentage e.g. 6 for 6% SST
      min: 0,
      max: 100,
    },
    taxName: {
      type: String,
      default: "SST", // tax label shown on receipt
    },

    // Receipt configuration
    receiptFooter: {
      type: String,
      default: "Thank you for your purchase!",
    },

    // Currency
    currency: {
      type: String,
      default: "RM",
    },
    currencySymbol: {
      type: String,
      default: "RM",
    },
  },
  {
    timestamps: true,
  },
);

const Settings = mongoose.model("Settings", settingsSchema);
module.exports = Settings;

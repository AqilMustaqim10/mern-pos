const Settings = require("../models/Settings");

// ─── Get Settings ──────────────────────────────────────────────────────────────
// GET /api/settings
// Any logged in user can read settings (needed for tax rate in POS)
const getSettings = async (req, res) => {
  try {
    // Try to find the one settings document
    let settings = await Settings.findOne();

    // If no settings document exists yet, create one with defaults
    // This runs on first ever request to this endpoint
    if (!settings) {
      settings = await Settings.create({});
    }

    res.status(200).json({ settings });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── Update Settings ───────────────────────────────────────────────────────────
// PUT /api/settings
// Admin only
const updateSettings = async (req, res) => {
  try {
    const {
      storeName,
      storeAddress,
      storePhone,
      storeEmail,
      taxEnabled,
      taxRate,
      taxName,
      receiptFooter,
      currency,
      currencySymbol,
    } = req.body;

    // Find existing settings or create if not exists
    let settings = await Settings.findOne();

    if (!settings) {
      settings = new Settings();
    }

    // Update only the fields that were sent
    // This lets us send partial updates without wiping other fields
    if (storeName !== undefined) settings.storeName = storeName;
    if (storeAddress !== undefined) settings.storeAddress = storeAddress;
    if (storePhone !== undefined) settings.storePhone = storePhone;
    if (storeEmail !== undefined) settings.storeEmail = storeEmail;
    if (taxEnabled !== undefined) settings.taxEnabled = taxEnabled;
    if (taxRate !== undefined) settings.taxRate = taxRate;
    if (taxName !== undefined) settings.taxName = taxName;
    if (receiptFooter !== undefined) settings.receiptFooter = receiptFooter;
    if (currency !== undefined) settings.currency = currency;
    if (currencySymbol !== undefined) settings.currencySymbol = currencySymbol;

    await settings.save();

    res.status(200).json({
      message: "Settings updated successfully",
      settings,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { getSettings, updateSettings };

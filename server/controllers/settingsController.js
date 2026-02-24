const Settings = require("../models/Settings");

// ─── Get Settings ──────────────────────────────────────────────────────────────
const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    res.status(200).json({ settings });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── Update Settings ───────────────────────────────────────────────────────────
const updateSettings = async (req, res) => {
  try {
    const {
      storeName,
      storeAddress,
      storePhone,
      storeEmail,
      taxes,
      receiptFooter,
      currency,
      currencySymbol,
    } = req.body;

    let settings = await Settings.findOne();
    if (!settings) settings = new Settings();

    if (storeName !== undefined) settings.storeName = storeName;
    if (storeAddress !== undefined) settings.storeAddress = storeAddress;
    if (storePhone !== undefined) settings.storePhone = storePhone;
    if (storeEmail !== undefined) settings.storeEmail = storeEmail;
    if (receiptFooter !== undefined) settings.receiptFooter = receiptFooter;
    if (currency !== undefined) settings.currency = currency;
    if (currencySymbol !== undefined) settings.currencySymbol = currencySymbol;

    // Replace entire taxes array when provided
    if (taxes !== undefined) settings.taxes = taxes;

    await settings.save();

    res.status(200).json({ message: "Settings updated", settings });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { getSettings, updateSettings };

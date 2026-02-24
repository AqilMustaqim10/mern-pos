const express = require("express");
const router = express.Router();
const {
  getSettings,
  updateSettings,
} = require("../controllers/settingsController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// Any logged in user can read settings
router.get("/", protect, getSettings);

// Only admin can update settings
router.put("/", protect, adminOnly, updateSettings);

module.exports = router;

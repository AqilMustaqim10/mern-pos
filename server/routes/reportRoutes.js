const express = require("express");
const router = express.Router();
const {
  getDashboardStats,
  getSalesChart,
  getTopProducts,
  getPaymentBreakdown,
} = require("../controllers/reportController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// All report routes are admin only
router.get("/dashboard", protect, adminOnly, getDashboardStats);
router.get("/sales-chart", protect, adminOnly, getSalesChart);
router.get("/top-products", protect, adminOnly, getTopProducts);
router.get("/payment-methods", protect, adminOnly, getPaymentBreakdown);

module.exports = router;

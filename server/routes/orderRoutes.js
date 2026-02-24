const express = require("express");
const router = express.Router();
const {
  createOrder,
  getOrders,
  getOrder,
  getTodaySummary,
} = require("../controllers/orderController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// Summary route must be defined BEFORE /:id route
// Otherwise Express thinks "summary" is an :id parameter
router.get("/summary/today", protect, getTodaySummary);

// Any logged in user can create an order (cashier or admin)
router.post("/", protect, createOrder);

// Only admins can view all orders
router.get("/", protect, adminOnly, getOrders);
router.get("/:id", protect, getOrder);

module.exports = router;

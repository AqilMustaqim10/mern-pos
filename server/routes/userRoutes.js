const express = require("express");
const router = express.Router();
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  resetPassword,
  changePassword,
  deleteUser,
} = require("../controllers/userController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// Change own password — any logged in user
// Must be defined BEFORE /:id routes to avoid conflict
router.put("/change-password", protect, changePassword);

// Admin only routes
router.get("/", protect, adminOnly, getUsers);
router.post("/", protect, adminOnly, createUser);
router.get("/:id", protect, adminOnly, getUser);
router.put("/:id", protect, adminOnly, updateUser);
router.put("/:id/reset-password", protect, adminOnly, resetPassword);
router.delete("/:id", protect, adminOnly, deleteUser);

module.exports = router;

// Import Express and create a router
// Router is like a mini Express app for grouping related routes
const express = require("express");
const router = express.Router();

// Import the controller functions we created
const { register, login, getMe } = require("../controllers/authController");

// Import the protect middleware for the /me route
const { protect } = require("../middleware/authMiddleware");

// ─── Auth Routes ──────────────────────────────────────────────────────────────
// POST /api/auth/register — create new user
router.post("/register", register);

// POST /api/auth/login — login and get token
router.post("/login", login);

// GET /api/auth/me — get current user info (protected — must be logged in)
router.get("/me", protect, getMe);
// protect runs first, then getMe only runs if protect calls next()

// Export the router
module.exports = router;

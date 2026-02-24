require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

// Import auth routes
const authRoutes = require("./routes/authRoutes");

const app = express();

// Connect to MongoDB
connectDB();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── Routes ───────────────────────────────────────────────────────────────────
// Test route
app.get("/", (req, res) => {
  res.json({ message: "MERN POS API is running!" });
});

// Mount auth routes at /api/auth
// So: /api/auth/login, /api/auth/register, /api/auth/me
app.use("/api/auth", authRoutes);

// ─── Global Error Handler ─────────────────────────────────────────────────────
// Catches any errors that weren't handled in routes
// Must have 4 parameters: err, req, res, next
app.use((err, req, res, next) => {
  console.error(err.stack); // log the full error in terminal
  res
    .status(500)
    .json({ message: "Something went wrong!", error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

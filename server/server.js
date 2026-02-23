// server/server.js

// Load environment variables from .env file
// This must be at the very top before anything else
require("dotenv").config();

// Import Express framework
const express = require("express");

// Import CORS so our React app can communicate with this server
const cors = require("cors");

// Import our database connection function (we'll create this next)
const connectDB = require("./config/db");

// Create the Express application
const app = express();

// ─── Connect to MongoDB ───────────────────────────────────────────────────────
// Call the function that connects to our database
connectDB();

// ─── Middleware ───────────────────────────────────────────────────────────────
// Enable CORS — allows requests from our React frontend (different port)
app.use(cors());

// Enable Express to read JSON from request bodies
// Without this, req.body would be undefined
app.use(express.json());

// ─── Routes ───────────────────────────────────────────────────────────────────
// A simple test route to confirm the server is running
app.get("/", (req, res) => {
  res.json({ message: "MERN POS API is running!" });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
// Use the PORT from .env file, or fallback to 5000
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

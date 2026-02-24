require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const reportRoutes = require("./routes/reportRoutes");
const userRoutes = require("./routes/userRoutes");
const settingsRoutes = require("./routes/settingsRoutes");

const app = express();
connectDB();

// ─── CORS Configuration ────────────────────────────────────────────────────────
// In production we need to explicitly allow our Vercel frontend URL
// process.env.CLIENT_URL will be set in Render's environment variables
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, curl)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      "http://localhost:5173", // local Vite dev server
      "http://localhost:4173", // local Vite preview
      process.env.CLIENT_URL, // your Vercel URL (set in Render env vars)
    ].filter(Boolean); // remove undefined values

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: ${origin}`));
    }
  },
  credentials: true, // allow cookies and auth headers
};

app.use(cors(corsOptions));
app.use(express.json());

// ─── Routes ───────────────────────────────────────────────────────────────────
app.get("/", (req, res) => res.json({ message: "MERN POS API is running!" }));
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/users", userRoutes);
app.use("/api/settings", settingsRoutes);

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(500)
    .json({ message: "Something went wrong!", error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

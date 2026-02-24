require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

// Import all routes
const authRoutes = require("./routes/authRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/orders", orderRoutes);

// ─── Mount Routes ─────────────────────────────────────────────────────────────
app.get("/", (req, res) => res.json({ message: "MERN POS API is running!" }));

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes); // new
app.use("/api/products", productRoutes); // new

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(500)
    .json({ message: "Something went wrong!", error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`),
);

const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");

// ─── Get Dashboard Stats ───────────────────────────────────────────────────────
// GET /api/reports/dashboard
// Returns all the numbers needed for the dashboard cards
const getDashboardStats = async (req, res) => {
  try {
    // ── Today's date range ──
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    // ── This month's date range ──
    const startOfMonth = new Date();
    startOfMonth.setDate(1); // first day of current month
    startOfMonth.setHours(0, 0, 0, 0);

    // ── Fetch today's completed orders ──
    const todayOrders = await Order.find({
      createdAt: { $gte: startOfToday, $lte: endOfToday },
      status: "completed",
    });

    // ── Fetch this month's completed orders ──
    const monthOrders = await Order.find({
      createdAt: { $gte: startOfMonth },
      status: "completed",
    });

    // ── Calculate today's stats ──
    const todaySales = todayOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const todayTransactions = todayOrders.length;

    // ── Calculate month's stats ──
    const monthSales = monthOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const monthTransactions = monthOrders.length;

    // ── Count total products and low stock items ──
    const totalProducts = await Product.countDocuments({ isActive: true });
    const lowStockProducts = await Product.countDocuments({
      isActive: true,
      // MongoDB comparison: stock <= lowStockAlert
      $expr: { $lte: ["$stock", "$lowStockAlert"] },
    });

    // ── Total users ──
    const totalUsers = await User.countDocuments({ isActive: true });

    res.status(200).json({
      today: {
        sales: todaySales,
        transactions: todayTransactions,
      },
      month: {
        sales: monthSales,
        transactions: monthTransactions,
      },
      totalProducts,
      lowStockProducts,
      totalUsers,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── Get Sales Chart Data ──────────────────────────────────────────────────────
// GET /api/reports/sales-chart?period=7  (7 days, 30 days, 12 months)
// Returns data formatted for Recharts
const getSalesChart = async (req, res) => {
  try {
    // Default to last 7 days if no period specified
    const period = parseInt(req.query.period) || 7;

    const chartData = [];

    if (period <= 30) {
      // ── Daily data for last N days ──
      for (let i = period - 1; i >= 0; i--) {
        // Calculate start and end of each day
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);

        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);

        // Find orders for this day
        const orders = await Order.find({
          createdAt: { $gte: date, $lte: endDate },
          status: "completed",
        });

        const sales = orders.reduce((sum, o) => sum + o.totalAmount, 0);
        const transactions = orders.length;

        // Format the date label for the chart x-axis
        const label = date.toLocaleDateString("en-MY", {
          month: "short",
          day: "numeric",
        });

        chartData.push({ date: label, sales, transactions });
      }
    } else {
      // ── Monthly data for last 12 months ──
      for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        date.setDate(1); // first day of month
        date.setHours(0, 0, 0, 0);

        const endDate = new Date(date);
        endDate.setMonth(endDate.getMonth() + 1); // first day of next month
        endDate.setDate(0); // last day of current month
        endDate.setHours(23, 59, 59, 999);

        const orders = await Order.find({
          createdAt: { $gte: date, $lte: endDate },
          status: "completed",
        });

        const sales = orders.reduce((sum, o) => sum + o.totalAmount, 0);
        const transactions = orders.length;

        const label = date.toLocaleDateString("en-MY", {
          month: "short",
          year: "numeric",
        });

        chartData.push({ date: label, sales, transactions });
      }
    }

    res.status(200).json({ chartData });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── Get Top Selling Products ──────────────────────────────────────────────────
// GET /api/reports/top-products?limit=5
const getTopProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    // MongoDB aggregation pipeline
    // Aggregation lets us process and transform data inside MongoDB
    const topProducts = await Order.aggregate([
      // Stage 1: Only include completed orders
      { $match: { status: "completed" } },

      // Stage 2: "Unwind" the items array
      // This turns one order document with 3 items
      // into 3 separate documents (one per item)
      { $unwind: "$items" },

      // Stage 3: Group by product and calculate totals
      {
        $group: {
          _id: "$items.product", // group by product ID
          name: { $first: "$items.name" }, // take the product name
          totalQuantity: { $sum: "$items.quantity" }, // total units sold
          totalRevenue: { $sum: "$items.subtotal" }, // total revenue
          orderCount: { $sum: 1 }, // how many orders included this product
        },
      },

      // Stage 4: Sort by total quantity sold (highest first)
      { $sort: { totalQuantity: -1 } },

      // Stage 5: Limit to top N products
      { $limit: limit },
    ]);

    res.status(200).json({ topProducts });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── Get Payment Method Breakdown ─────────────────────────────────────────────
// GET /api/reports/payment-methods
const getPaymentBreakdown = async (req, res) => {
  try {
    const breakdown = await Order.aggregate([
      // Only completed orders
      { $match: { status: "completed" } },

      // Group by payment method and sum totals
      {
        $group: {
          _id: "$paymentMethod",
          count: { $sum: 1 },
          total: { $sum: "$totalAmount" },
        },
      },

      // Sort alphabetically
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({ breakdown });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getSalesChart,
  getTopProducts,
  getPaymentBreakdown,
};

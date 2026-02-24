const Order = require("../models/Order");
const Product = require("../models/Product");

// ─── Create Order (Checkout) ───────────────────────────────────────────────────
// POST /api/orders
// This is called when cashier clicks "Confirm Payment"
const createOrder = async (req, res) => {
  try {
    const {
      items, // array of { productId, quantity }
      discountPercent, // discount percentage e.g. 10 for 10%
      taxRate, // tax percentage e.g. 6 for 6%
      paymentMethod, // 'cash', 'card', 'ewallet'
      amountPaid, // how much customer gave
      customerName,
      notes,
    } = req.body;

    // Validate: must have items
    if (!items || items.length === 0) {
      return res
        .status(400)
        .json({ message: "Order must have at least one item" });
    }

    // ─── Process Each Item ──────────────────────────────────────────────────
    const orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      // Fetch product from database to get current price and check stock
      const product = await Product.findById(item.productId);

      if (!product) {
        return res
          .status(404)
          .json({ message: `Product not found: ${item.productId}` });
      }

      if (!product.isActive) {
        return res
          .status(400)
          .json({ message: `Product is no longer available: ${product.name}` });
      }

      // Check if enough stock is available
      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}`,
        });
      }

      const itemSubtotal = product.price * item.quantity;
      subtotal += itemSubtotal;

      orderItems.push({
        product: product._id,
        name: product.name, // snapshot of name at purchase time
        price: product.price, // snapshot of price at purchase time
        quantity: item.quantity,
        subtotal: itemSubtotal,
      });

      // Deduct stock — reduce stock count for this product
      product.stock -= item.quantity;
      await product.save();
    }

    // ─── Calculate Totals ───────────────────────────────────────────────────
    // Discount amount in RM
    const discountAmount = subtotal * ((discountPercent || 0) / 100);

    // Amount after discount
    const afterDiscount = subtotal - discountAmount;

    // Tax amount
    const taxAmount = afterDiscount * ((taxRate || 0) / 100);

    // Final total
    const totalAmount = afterDiscount + taxAmount;

    // Change to return to customer
    const changeAmount = (amountPaid || 0) - totalAmount;

    // ─── Create Order Document ──────────────────────────────────────────────
    const order = await Order.create({
      items: orderItems,
      subtotal,
      discountPercent: discountPercent || 0,
      discountAmount,
      taxRate: taxRate || 0,
      taxAmount,
      totalAmount,
      paymentMethod,
      amountPaid: amountPaid || totalAmount,
      changeAmount: changeAmount > 0 ? changeAmount : 0,
      cashier: req.user._id, // from protect middleware
      customerName: customerName || "Walk-in Customer",
      notes,
    });

    // Populate cashier info for the response
    await order.populate("cashier", "name");

    res.status(201).json({
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── Get All Orders ────────────────────────────────────────────────────────────
// GET /api/orders
const getOrders = async (req, res) => {
  try {
    // Get optional date filter from query params
    const { startDate, endDate, cashier } = req.query;

    let filter = {};

    // Filter by date range if provided
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Filter by cashier if provided
    if (cashier) filter.cashier = cashier;

    const orders = await Order.find(filter)
      .populate("cashier", "name")
      .sort({ createdAt: -1 }); // newest first

    res.status(200).json({ count: orders.length, orders });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── Get Single Order ──────────────────────────────────────────────────────────
// GET /api/orders/:id
const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("cashier", "name")
      .populate("items.product", "name image");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({ order });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── Get Today's Summary ───────────────────────────────────────────────────────
// GET /api/orders/summary/today
// Used for the dashboard stats
const getTodaySummary = async (req, res) => {
  try {
    // Get start and end of today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0); // midnight

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999); // end of day

    // Find all completed orders from today
    const orders = await Order.find({
      createdAt: { $gte: startOfDay, $lte: endOfDay },
      status: "completed",
    });

    // Calculate summary stats
    const totalSales = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalOrders = orders.length;
    const totalItems = orders.reduce(
      (sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0),
      0,
    );

    res.status(200).json({
      totalSales,
      totalOrders,
      totalItems,
      orders,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { createOrder, getOrders, getOrder, getTodaySummary };

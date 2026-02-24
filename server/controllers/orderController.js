// server/controllers/orderController.js

const Order = require("../models/Order");
const Product = require("../models/Product");
const Settings = require("../models/Settings");

// ─── Compound Tax Calculator ───────────────────────────────────────────────────
// Compound means each tax is applied ON TOP of the previous running total
// Example:
//   Subtotal after discount = RM 100
//   Service Charge 10% → 100 × 10% = RM 10   → running total = RM 110
//   SST 6%           → 110 × 6%  = RM 6.60  → running total = RM 116.60
const calculateCompoundTaxes = (afterDiscount, taxes) => {
  // Sort taxes by their order field (lowest first = applied first)
  const sortedTaxes = [...taxes]
    .filter((t) => t.enabled) // only use enabled taxes
    .sort((a, b) => a.order - b.order); // sort by application order

  let runningTotal = afterDiscount; // start with the discounted subtotal
  const taxBreakdown = [];

  for (const tax of sortedTaxes) {
    const baseAmount = runningTotal; // THIS tax is calculated on running total
    const taxAmount = baseAmount * (tax.rate / 100);

    taxBreakdown.push({
      name: tax.name,
      rate: tax.rate,
      amount: parseFloat(taxAmount.toFixed(2)),
      baseAmount: parseFloat(baseAmount.toFixed(2)),
    });

    // Add this tax amount to running total
    // So the NEXT tax compounds on top of it
    runningTotal += taxAmount;
  }

  const totalTaxAmount = taxBreakdown.reduce((sum, t) => sum + t.amount, 0);

  return { taxBreakdown, totalTaxAmount, finalTotal: runningTotal };
};

// ─── Create Order ──────────────────────────────────────────────────────────────
const createOrder = async (req, res) => {
  try {
    const {
      items,
      discountPercent,
      paymentMethod,
      amountPaid,
      customerName,
      tableNumber, // NEW: table number for FnB
      notes,
    } = req.body;

    if (!items || items.length === 0) {
      return res
        .status(400)
        .json({ message: "Order must have at least one item" });
    }

    // ── Process items ──
    const orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return res
          .status(404)
          .json({ message: `Product not found: ${item.productId}` });
      }
      if (!product.isActive) {
        return res
          .status(400)
          .json({ message: `${product.name} is no longer available` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}`,
        });
      }

      const itemSubtotal = product.price * item.quantity;
      subtotal += itemSubtotal;

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        subtotal: itemSubtotal,
        note: item.note || "", // NEW: pass item note through
      });

      product.stock -= item.quantity;
      await product.save();
    }

    // ── Calculate discount ──
    const discountAmount = subtotal * ((discountPercent || 0) / 100);
    const afterDiscount = subtotal - discountAmount;

    // ── Load current tax settings from database ──
    const settings = await Settings.findOne();
    const activeTaxes = settings?.taxes || [];

    // ── Calculate compound taxes ──
    const { taxBreakdown, totalTaxAmount, finalTotal } = calculateCompoundTaxes(
      afterDiscount,
      activeTaxes,
    );

    // ── Change calculation ──
    const changeAmount = Math.max(0, (amountPaid || 0) - finalTotal);

    // ── Create order ──
    const order = await Order.create({
      items: orderItems,
      subtotal,
      discountPercent: discountPercent || 0,
      discountAmount,
      taxBreakdown,
      totalTaxAmount: parseFloat(totalTaxAmount.toFixed(2)),
      totalAmount: parseFloat(finalTotal.toFixed(2)),
      paymentMethod,
      amountPaid: amountPaid || finalTotal,
      changeAmount,
      cashier: req.user._id,
      customerName: customerName || "Walk-in Customer",
      tableNumber: tableNumber || "",
      notes,
    });

    await order.populate("cashier", "name");

    res.status(201).json({ message: "Order created successfully", order });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── Get All Orders ────────────────────────────────────────────────────────────
const getOrders = async (req, res) => {
  try {
    const { startDate, endDate, cashier } = req.query;
    let filter = {};

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    if (cashier) filter.cashier = cashier;

    const orders = await Order.find(filter)
      .populate("cashier", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({ count: orders.length, orders });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── Get Single Order ──────────────────────────────────────────────────────────
const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("cashier", "name")
      .populate("items.product", "name image");

    if (!order) return res.status(404).json({ message: "Order not found" });
    res.status(200).json({ order });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── Get Today's Summary ───────────────────────────────────────────────────────
const getTodaySummary = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const orders = await Order.find({
      createdAt: { $gte: startOfDay, $lte: endOfDay },
      status: "completed",
    });

    const totalSales = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalOrders = orders.length;
    const totalItems = orders.reduce(
      (sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0),
      0,
    );

    res.status(200).json({ totalSales, totalOrders, totalItems, orders });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { createOrder, getOrders, getOrder, getTodaySummary };

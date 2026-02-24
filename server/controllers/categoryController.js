const Category = require("../models/Category");

// ─── Get All Categories ───────────────────────────────────────────────────────
// GET /api/categories
const getCategories = async (req, res) => {
  try {
    // Find all active categories, sorted by name alphabetically
    const categories = await Category.find({ isActive: true }).sort({
      name: 1,
    });

    res.status(200).json({
      count: categories.length,
      categories,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── Get Single Category ──────────────────────────────────────────────────────
// GET /api/categories/:id
const getCategory = async (req, res) => {
  try {
    // req.params.id is the :id from the URL
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json({ category });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── Create Category ──────────────────────────────────────────────────────────
// POST /api/categories
// Admin only
const createCategory = async (req, res) => {
  try {
    const { name, description, color } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Category name is required" });
    }

    // Check if category with same name already exists
    const existing = await Category.findOne({ name: name.trim() });
    if (existing) {
      return res
        .status(400)
        .json({ message: "Category with this name already exists" });
    }

    const category = await Category.create({ name, description, color });

    res.status(201).json({
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── Update Category ──────────────────────────────────────────────────────────
// PUT /api/categories/:id
// Admin only
const updateCategory = async (req, res) => {
  try {
    const { name, description, color, isActive } = req.body;

    // Find category by ID and update it
    // { new: true } returns the UPDATED document, not the old one
    // { runValidators: true } runs schema validations on update too
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, description, color, isActive },
      { new: true, runValidators: true },
    );

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json({
      message: "Category updated successfully",
      category,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── Delete Category ──────────────────────────────────────────────────────────
// DELETE /api/categories/:id
// Admin only — soft delete (just sets isActive to false)
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { isActive: false }, // soft delete — don't actually remove from database
      { new: true },
    );

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
};

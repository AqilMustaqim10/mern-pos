const Product = require("../models/Product");
const { cloudinary } = require("../config/cloudinary");

// ─── Get All Products ─────────────────────────────────────────────────────────
// GET /api/products
// Supports filtering by category and searching by name
const getProducts = async (req, res) => {
  try {
    // req.query contains URL query parameters
    // e.g. /api/products?category=abc&search=nasi
    const { category, search, isActive } = req.query;

    // Build a filter object dynamically
    let filter = {};

    // Filter by active status (default: only show active products)
    filter.isActive = isActive === "false" ? false : true;

    // Filter by category if provided
    if (category) {
      filter.category = category;
    }

    // Search by name if provided
    // $regex does a partial text match, $options: 'i' makes it case-insensitive
    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    // Find products matching the filter
    // .populate('category') replaces the category ID with the full category object
    const products = await Product.find(filter)
      .populate("category", "name color") // only get name and color from category
      .sort({ createdAt: -1 }); // newest first

    res.status(200).json({
      count: products.length,
      products,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── Get Single Product ───────────────────────────────────────────────────────
// GET /api/products/:id
const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("category");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ product });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── Create Product ───────────────────────────────────────────────────────────
// POST /api/products
// Admin only — accepts multipart/form-data because of image upload
const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      costPrice,
      stock,
      lowStockAlert,
      category,
      barcode,
    } = req.body;

    // Validate required fields
    if (!name || !price || !category) {
      return res
        .status(400)
        .json({ message: "Name, price and category are required" });
    }

    // Build the product object
    const productData = {
      name,
      description,
      price: Number(price), // convert string to number (form data sends strings)
      costPrice: Number(costPrice) || 0,
      stock: Number(stock) || 0,
      lowStockAlert: Number(lowStockAlert) || 10,
      category,
      barcode,
    };

    // If an image was uploaded (multer + cloudinary handles this)
    // req.file is populated by the upload middleware
    if (req.file) {
      productData.image = req.file.path; // Cloudinary URL
      productData.imagePublicId = req.file.filename; // Cloudinary public_id for deletion
    }

    const product = await Product.create(productData);

    // Populate category info before sending response
    await product.populate("category", "name color");

    res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── Update Product ───────────────────────────────────────────────────────────
// PUT /api/products/:id
// Admin only
const updateProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      costPrice,
      stock,
      lowStockAlert,
      category,
      barcode,
      isActive,
    } = req.body;

    // Find the existing product first
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // If a new image was uploaded, delete the old one from Cloudinary
    if (req.file && product.imagePublicId) {
      // Delete old image from Cloudinary using its public_id
      await cloudinary.uploader.destroy(product.imagePublicId);
    }

    // Build updated data object
    const updateData = {
      name,
      description,
      price: Number(price),
      costPrice: Number(costPrice) || 0,
      stock: Number(stock),
      lowStockAlert: Number(lowStockAlert) || 10,
      category,
      barcode,
      isActive,
    };

    // Update image fields if new image was uploaded
    if (req.file) {
      updateData.image = req.file.path;
      updateData.imagePublicId = req.file.filename;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true },
    ).populate("category", "name color");

    res.status(200).json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── Delete Product ───────────────────────────────────────────────────────────
// DELETE /api/products/:id
// Admin only
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Delete image from Cloudinary if it exists
    if (product.imagePublicId) {
      await cloudinary.uploader.destroy(product.imagePublicId);
    }

    // Soft delete — just mark as inactive
    product.isActive = false;
    await product.save();

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};

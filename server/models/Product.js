// server/models/Product.js

const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    // Product name e.g. "Nasi Lemak", "Teh Tarik"
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },

    // Short description of the product
    description: {
      type: String,
      trim: true,
      default: "",
    },

    // Selling price (what customer pays)
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },

    // Cost price (what we paid to get the product)
    // Used for profit calculation in reports later
    costPrice: {
      type: Number,
      default: 0,
      min: [0, "Cost price cannot be negative"],
    },

    // How many items are in stock
    stock: {
      type: Number,
      required: [true, "Stock is required"],
      min: [0, "Stock cannot be negative"],
      default: 0,
    },

    // Minimum stock level — below this triggers low stock alert
    lowStockAlert: {
      type: Number,
      default: 10,
    },

    // Product image — stores Cloudinary URL
    image: {
      type: String,
      default: "", // empty string means no image uploaded yet
    },

    // Cloudinary public_id — needed to delete the image later
    imagePublicId: {
      type: String,
      default: "",
    },

    // Reference to Category model
    // This links the product to a category document
    category: {
      type: mongoose.Schema.Types.ObjectId, // stores the category's _id
      ref: "Category", // tells mongoose which model to use
      required: [true, "Category is required"],
    },

    // Barcode for scanning (optional)
    barcode: {
      type: String,
      default: "",
      trim: true,
    },

    // Whether this product is available for sale
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

const Product = mongoose.model("Product", productSchema);
module.exports = Product;

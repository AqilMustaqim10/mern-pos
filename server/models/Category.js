// server/models/Category.js

const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    // Category name e.g. "Food", "Drinks", "Electronics"
    name: {
      type: String,
      required: [true, "Category name is required"],
      unique: true, // no duplicate category names
      trim: true,
    },

    // Optional description of the category
    description: {
      type: String,
      trim: true,
      default: "",
    },

    // Color for the category badge in the UI (hex color code)
    color: {
      type: String,
      default: "#4f46e5", // default indigo color
    },

    // Whether this category is active/visible
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    // Auto adds createdAt and updatedAt
    timestamps: true,
  },
);

const Category = mongoose.model("Category", categorySchema);
module.exports = Category;

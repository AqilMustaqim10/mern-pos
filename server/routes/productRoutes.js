const express = require("express");
const router = express.Router();
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// Import upload middleware for handling image uploads
const { upload } = require("../config/cloudinary");

// Public routes (any logged in user)
router.get("/", protect, getProducts);
router.get("/:id", protect, getProduct);

// Admin only routes
// upload.single('image') processes the image BEFORE the controller runs
router.post("/", protect, adminOnly, upload.single("image"), createProduct);
router.put("/:id", protect, adminOnly, upload.single("image"), updateProduct);
router.delete("/:id", protect, adminOnly, deleteProduct);

module.exports = router;

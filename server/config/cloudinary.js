// Import cloudinary v2
const cloudinary = require("cloudinary").v2;

// Import multer — handles multipart/form-data (file uploads)
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// Import multer itself
const multer = require("multer");

// ─── Configure Cloudinary ─────────────────────────────────────────────────────
// Connect cloudinary with our account credentials from .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ─── Configure Storage ────────────────────────────────────────────────────────
// Tell multer to store uploaded files directly in Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary, // use our configured cloudinary instance

  params: {
    folder: "mern-pos/products", // folder name in your Cloudinary account
    allowed_formats: ["jpg", "jpeg", "png", "webp"], // only allow images
    transformation: [
      {
        width: 500, // resize image to max 500px wide
        height: 500, // resize image to max 500px tall
        crop: "limit", // only shrink if larger, never stretch
      },
    ],
  },
});

// ─── Create Upload Middleware ─────────────────────────────────────────────────
// upload.single('image') means accept ONE file with the field name "image"
const upload = multer({ storage });

// Export both upload middleware and cloudinary instance
// We need cloudinary instance later to delete images
module.exports = { upload, cloudinary };

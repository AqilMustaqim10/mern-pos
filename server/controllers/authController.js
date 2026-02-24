// Import the User model so we can query the database
const User = require("../models/User");

// Import jsonwebtoken to create login tokens
const jwt = require("jsonwebtoken");

// ─── Helper: Generate JWT Token ───────────────────────────────────────────────
// A JWT token is like a temporary ID card
// It proves who the user is without needing to check the database every request
const generateToken = (userId, role) => {
  // jwt.sign() creates a token with a "payload" (data inside the token)
  // The payload contains the user's ID and role
  // JWT_SECRET is our secret key used to sign and verify tokens
  // expiresIn: '7d' means the token expires after 7 days
  return jwt.sign(
    { id: userId, role: role }, // payload — data stored in the token
    process.env.JWT_SECRET, // secret key from .env file
    { expiresIn: "7d" }, // token expiry
  );
};

// ─── Register User ────────────────────────────────────────────────────────────
// POST /api/auth/register
// Creates a new user account
const register = async (req, res) => {
  try {
    // Destructure the fields sent in the request body
    const { name, email, password, role } = req.body;

    // Validate — make sure required fields are provided
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide name, email and password" });
    }

    // Check if a user with this email already exists in the database
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    // Create a new user document in the database
    // Password gets hashed automatically by our pre-save hook in the model
    const user = await User.create({
      name,
      email,
      password,
      role: role || "cashier", // default to cashier if no role provided
    });

    // Generate a JWT token for this new user
    const token = generateToken(user._id, user.role);

    // Send back a success response with user info and token
    res.status(201).json({
      message: "User registered successfully",
      token, // send token so user is logged in immediately
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    // Catch any unexpected errors and send a 500 (server error) response
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── Login User ───────────────────────────────────────────────────────────────
// POST /api/auth/login
// Logs in an existing user and returns a token
const login = async (req, res) => {
  try {
    // Get email and password from request body
    const { email, password } = req.body;

    // Validate inputs
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide email and password" });
    }

    // Find the user in the database by email
    // If not found, return error — don't tell them which field is wrong (security)
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check if the account is active
    if (!user.isActive) {
      return res
        .status(401)
        .json({ message: "Your account has been disabled. Contact admin." });
    }

    // Compare entered password with hashed password in database
    // Uses the comparePassword method we defined in the model
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate JWT token for this user
    const token = generateToken(user._id, user.role);

    // Send success response
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── Get Current User ─────────────────────────────────────────────────────────
// GET /api/auth/me
// Returns the currently logged in user's info
// This route is protected — requires a valid token
const getMe = async (req, res) => {
  try {
    // req.user is attached by our auth middleware (we'll create this next)
    // Find user by their ID, but exclude the password field for security
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Export all functions so routes can use them
module.exports = { register, login, getMe };

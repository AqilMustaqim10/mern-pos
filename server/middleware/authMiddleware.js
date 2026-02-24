// Import jsonwebtoken to verify tokens
const jwt = require("jsonwebtoken");

// Import User model to fetch user from database
const User = require("../models/User");

// ─── Protect Middleware ───────────────────────────────────────────────────────
// This function runs BEFORE protected route handlers
// It checks if the incoming request has a valid JWT token
const protect = async (req, res, next) => {
  try {
    let token;

    // Tokens are sent in the Authorization header like:
    // Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6...
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      // Extract just the token part (remove "Bearer " prefix)
      token = req.headers.authorization.split(" ")[1];
    }

    // If no token was found in the header, deny access
    if (!token) {
      return res
        .status(401)
        .json({ message: "Not authorized. No token provided." });
    }

    // Verify the token using our secret key
    // jwt.verify() decodes the token and checks it hasn't been tampered with
    // If expired or invalid, it throws an error caught by catch below
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // decoded = { id: 'user123', role: 'admin', iat: ..., exp: ... }

    // Fetch the user from the database using the ID from the token
    // .select('-password') means "get everything EXCEPT the password"
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User no longer exists." });
    }

    if (!user.isActive) {
      return res
        .status(401)
        .json({ message: "Your account has been disabled." });
    }

    // Attach the user object to the request so the next handler can use it
    // This is how getMe() knows who is asking: req.user
    req.user = user;

    // Call next() to move to the actual route handler
    next();
  } catch (error) {
    // Token is invalid or expired
    res.status(401).json({ message: "Not authorized. Invalid token." });
  }
};

// ─── Admin Only Middleware ────────────────────────────────────────────────────
// This runs AFTER protect middleware
// It checks if the logged in user is an admin
// Usage: router.get('/admin-route', protect, adminOnly, handler)
const adminOnly = (req, res, next) => {
  // req.user was attached by the protect middleware above
  if (req.user && req.user.role === "admin") {
    next(); // user is admin, allow access
  } else {
    res.status(403).json({ message: "Access denied. Admins only." });
  }
};

// Export both middleware functions
module.exports = { protect, adminOnly };

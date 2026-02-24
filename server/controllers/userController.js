const User = require("../models/User");
const bcrypt = require("bcryptjs");

// ─── Get All Users ─────────────────────────────────────────────────────────────
// GET /api/users
// Admin only
const getUsers = async (req, res) => {
  try {
    // Get all users but exclude their passwords
    // Sort by newest first
    const users = await User.find().select("-password").sort({ createdAt: -1 });

    res.status(200).json({ count: users.length, users });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── Get Single User ───────────────────────────────────────────────────────────
// GET /api/users/:id
const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── Create User ───────────────────────────────────────────────────────────────
// POST /api/users
// Admin only — admin creates accounts for cashiers
const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email and password are required" });
    }

    // Check if email already taken
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // Create the user — password gets hashed by the pre-save hook
    const user = await User.create({
      name,
      email,
      password,
      role: role || "cashier",
    });

    // Return user without password
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };

    res.status(201).json({
      message: "User created successfully",
      user: userResponse,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── Update User ───────────────────────────────────────────────────────────────
// PUT /api/users/:id
// Admin only
const updateUser = async (req, res) => {
  try {
    const { name, email, role, isActive } = req.body;

    // Find the user to update
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent admin from disabling their own account
    // req.user is the currently logged in admin
    if (req.params.id === req.user._id.toString() && isActive === false) {
      return res
        .status(400)
        .json({ message: "You cannot disable your own account" });
    }

    // Update fields
    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;

    // Only update isActive if explicitly provided
    if (typeof isActive === "boolean") {
      user.isActive = isActive;
    }

    await user.save();

    res.status(200).json({
      message: "User updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── Reset User Password ───────────────────────────────────────────────────────
// PUT /api/users/:id/reset-password
// Admin only — admin can reset any user's password
const resetPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Set new password — pre-save hook will hash it automatically
    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── Change Own Password ───────────────────────────────────────────────────────
// PUT /api/users/change-password
// Any logged in user can change their own password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Both current and new password are required" });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "New password must be at least 6 characters" });
    }

    // Get user WITH password for comparison
    const user = await User.findById(req.user._id);

    // Verify current password is correct
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Set new password
    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── Delete User ───────────────────────────────────────────────────────────────
// DELETE /api/users/:id
// Admin only — soft delete
const deleteUser = async (req, res) => {
  try {
    // Prevent self-deletion
    if (req.params.id === req.user._id.toString()) {
      return res
        .status(400)
        .json({ message: "You cannot delete your own account" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true },
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deactivated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  resetPassword,
  changePassword,
  deleteUser,
};

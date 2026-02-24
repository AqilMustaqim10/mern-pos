// Import mongoose to create a database schema
const mongoose = require("mongoose");

// Import bcryptjs to hash passwords before saving
const bcrypt = require("bcryptjs");

// ─── User Schema ──────────────────────────────────────────────────────────────
// A schema defines the SHAPE of documents stored in MongoDB
// Think of it like a form template — every user must follow this structure
const userSchema = new mongoose.Schema(
  {
    // User's full name
    name: {
      type: String, // must be text
      required: [true, "Name is required"], // can't be empty
      trim: true, // removes accidental spaces at start/end
    },

    // User's email — used for login
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true, // no two users can have the same email
      lowercase: true, // always store as lowercase
      trim: true,
    },

    // User's password — will be hashed before saving
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },

    // Role determines what the user can access
    // 'admin' can manage products, see reports, manage users
    // 'cashier' can only use the POS screen
    role: {
      type: String,
      enum: ["admin", "cashier"], // only these two values are allowed
      default: "cashier", // new users are cashiers by default
    },

    // Whether the account is active or disabled
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    // Automatically adds createdAt and updatedAt timestamps
    timestamps: true,
  },
);

//Remove next entirely and use async/await properly
userSchema.pre("save", async function () {
  // Only hash if password was changed
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  // No need to call next() when using async function — mongoose handles it
});

// ─── Instance Method: Compare Password ───────────────────────────────────────
// This is a custom method we add to every user document
// We'll call this during login to check if entered password is correct
userSchema.methods.comparePassword = async function (enteredPassword) {
  // bcrypt.compare hashes enteredPassword and checks if it matches stored hash
  // Returns true or false
  return await bcrypt.compare(enteredPassword, this.password);
};

// Create the User model from the schema
// mongoose.model('User', schema) creates a 'users' collection in MongoDB
const User = mongoose.model("User", userSchema);

// Export so we can use it in controllers
module.exports = User;

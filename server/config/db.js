// server/config/db.js

// Import Mongoose — the library that connects Node.js to MongoDB
const mongoose = require("mongoose");

// This function connects our app to MongoDB
// We use async/await because connecting to a database takes time
const connectDB = async () => {
  try {
    // Try to connect using the connection string stored in our .env file
    // MONGO_URI will look like: mongodb+srv://username:password@cluster.mongodb.net/posdb
    const conn = await mongoose.connect(process.env.MONGO_URI);

    // If successful, log which host we connected to
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    // If connection fails, log the error message
    console.error(`MongoDB Connection Error: ${error.message}`);

    // Exit the Node process with failure code 1
    // This stops the server from running without a database
    process.exit(1);
  }
};

// Export so server.js can import and use it
module.exports = connectDB;

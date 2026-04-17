require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const profileRoutes = require("./routes/profiles");

const app = express();

// --- Cached MongoDB connection (required for Vercel serverless) ---
let isConnected = false;

async function connectDB() {
  if (isConnected && mongoose.connection.readyState === 1) return;
  await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 10000,
  });
  isConnected = true;
  console.log("Connected to MongoDB");
}

// --- Middleware ---
// --- CORS headers on every response ---
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});
app.use(express.json());

// Handle OPTIONS preflight
app.options("*", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.status(204).send();
});

// --- DB connection middleware (runs before every request) ---
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("DB connection failed:", err);
    return res.status(500).json({ status: "error", message: "Database connection failed" });
  }
});

// --- Routes ---
app.use("/api/profiles", profileRoutes);

// --- Health check ---
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Profile Intelligence API is running" });
});

// --- 404 handler ---
app.use((req, res) => {
  res.status(404).json({ status: "error", message: "Route not found" });
});

// For local development
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000;
  connectDB().then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  });
}

module.exports = app;

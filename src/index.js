require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const profileRoutes = require("./routes/profiles");

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middleware ---
app.use(cors({ origin: "*" })); // Required: Access-Control-Allow-Origin: *
app.use(express.json());

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

// --- Connect to MongoDB then start server ---
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

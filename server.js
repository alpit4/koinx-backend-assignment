const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const connectDB = require("./db/db");
const cryptoRoutes = require("./routes/crypto");
const fetchCryptoData = require("./jobs/jobs");
require("dotenv").config();

// Initialize express app
const app = express();

app.use((req, res, next) => {
  console.log(`Request received: ${req.method} ${req.url}`);
  next();
});

// Connect to MongoDB
connectDB();

// Manually trigger data fetch to populate database
fetchCryptoData(); // Trigger fetching and saving data

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/crypto", cryptoRoutes);

// Start the server
app.get("/", (req, res) => {
  res.send("Backend is Running!!!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

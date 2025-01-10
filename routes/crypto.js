const express = require("express");
const CryptoData = require("../db/cryptoData");
const router = express.Router();

// API for getting the latest data of a cryptocurrency
router.get("/stats", async (req, res) => {
  const { coin } = req.query;

  if (!coin) {
    return res.status(400).json({
      error:
        "Please provide a valid coin name (bitcoin, matic-network, ethereum).",
    });
  }

  try {
    console.log(`Querying for coin: ${coin}`);
    const latestData = await CryptoData.find({ coin })
      .sort({ date: -1 })
      .limit(1);

    console.log("Data found:", latestData);

    if (!latestData.length) {
      return res.status(404).json({ error: "No data found for this coin." });
    }

    const { price, marketCap, change24h } = latestData[0];

    return res.json({
      price,
      marketCap,
      "24hChange": change24h,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

// API for calculating the standard deviation of price
router.get("/deviation", async (req, res) => {
  const { coin } = req.query;

  if (!coin) {
    return res.status(400).json({
      error:
        "Please provide a valid coin name (bitcoin, matic-network, ethereum).",
    });
  }

  try {
    const cryptoData = await CryptoData.find({ coin })
      .sort({ date: -1 })
      .limit(100);

    if (cryptoData.length < 2) {
      return res.status(400).json({
        error:
          "Not enough data to calculate standard deviation. We need at least 2 data points.",
      });
    }

    const prices = cryptoData.map((item) => item.price);

    // Calculate standard deviation
    const mean = prices.reduce((acc, price) => acc + price, 0) / prices.length;
    const squaredDifferences = prices.map((price) => Math.pow(price - mean, 2));
    const stdDev = Math.sqrt(
      squaredDifferences.reduce((acc, sqr) => acc + sqr, 0) / prices.length
    );

    return res.json({
      deviation: stdDev.toFixed(2),
    });
  } catch (error) {
    console.error("Error calculating deviation:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

module.exports = router;

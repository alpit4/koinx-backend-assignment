const axios = require("axios");
const cron = require("node-cron");
const CryptoData = require("../db/cryptoData");
require("dotenv").config();

const coinGeckoAPIUrl = process.env.COINGECKO_API_URL;
const apiKey = process.env.COINGECKO_API_KEY;

// Function to fetch cryptocurrency data and store in DB
const fetchCryptoData = async () => {
  try {
    const coins = ["bitcoin", "matic-network", "ethereum"];

    for (const coin of coins) {
      const response = await axios.get(`${coinGeckoAPIUrl}/coins/${coin}`, {
        params: {
          x_cg_demo_api_key: apiKey,
        },
      });

      const { current_price, market_cap, price_change_percentage_24h } =
        response.data.market_data;

      // Save the fetched data in the database
      const newCryptoData = new CryptoData({
        coin,
        price: current_price.usd,
        marketCap: market_cap.usd,
        change24h: price_change_percentage_24h,
      });

      await newCryptoData.save();
      console.log(`${coin} data saved!`);
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

// Run the job every 2 hours (at minute 0)
cron.schedule("0 */2 * * *", fetchCryptoData);

module.exports = fetchCryptoData;

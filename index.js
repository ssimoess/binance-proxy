import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

// rota raiz só para teste
app.get("/", (req, res) => {
  res.json({ status: "Binance Proxy running" });
});

// rota para candles de futuros
app.get("/futures", async (req, res) => {
  try {
    const { symbol, interval = "15m", limit = 100 } = req.query;
    if (!symbol) {
      return res.status(400).json({ error: "Missing symbol parameter" });
    }

    const url = https://fapi.binance.com/fapi/v1/klines?symbol=${symbol}&interval=${interval}&limit=${limit};
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(Proxy running on port ${PORT});
});

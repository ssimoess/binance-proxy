// index.js — Railway Proxy (CommonJS, compatível com Node 18/22)

const express = require("express");
const app = express();

// CORS + headers básicos
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  next();
});

// Health
app.get("/", (req, res) => {
  res.type("text/plain").send("✅ Binance Proxy ativo!");
});

// Ping
app.get("/api/ping", (req, res) => {
  res.json({ ok: true, msg: "pong" });
});

// ------- HELPERS -------
async function forwardJson(url, res) {
  try {
    const r = await fetch(url);
    if (!r.ok) {
      return res
        .status(r.status)
        .json({ error: "HTTP " + r.status }); // evita template string
    }
    const data = await r.json();
    return res.json(data);
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
}

// ------- ENDPOINTS -------

// SPOT klines (se precisares)
app.get("/api/api/v3/klines", async (req, res) => {
  const { symbol, interval, limit = 500 } = req.query;
  const url =
    "https://api.binance.com/api/v3/klines" +
    "?symbol=" + encodeURIComponent(symbol) +
    "&interval=" + encodeURIComponent(interval) +
    "&limit=" + encodeURIComponent(limit);
  return forwardJson(url, res);
});

// FUTURES USDT/USDC — o que o teu Worker usa
app.get("/api/fapi/v1/klines", async (req, res) => {
  const { symbol, interval, limit = 500 } = req.query;
  const url =
    "https://fapi.binance.com/fapi/v1/klines" +
    "?symbol=" + encodeURIComponent(symbol) +
    "&interval=" + encodeURIComponent(interval) +
    "&limit=" + encodeURIComponent(limit);
  return forwardJson(url, res);
});

// Porta Railway/Render/Heroku
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log("🚀 Proxy a escutar na porta " + PORT);
});

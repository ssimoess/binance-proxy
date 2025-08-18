// index.js (Railway proxy) - CommonJS

const express = require("express");
const app = express();

// Cabeçalhos úteis (CORS + JSON por defeito)
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  next();
});

// Health / confirmação
app.get("/", (req, res) => {
  res.type("text/plain").send("✅ Binance Proxy ativo!");
});

// Ping simples
app.get("/api/ping", (req, res) => {
  res.json({ ok: true, msg: "pong" });
});

// ---------- ENDPOINTS ----------

// SPOT klines (se precisares)
app.get("/api/api/v3/klines", async (req, res) => {
  try {
    const { symbol, interval, limit = 500 } = req.query;
    const url = `https://api.binance.com/api/v3/klines?symbol=${encodeURIComponent(
      symbol
    )}&interval=${encodeURIComponent(interval)}&limit=${encodeURIComponent(
      limit
    )}`;
    const r = await fetch(url);
    if (!r.ok) return res.status(r.status).json({ error: HTTP ${r.status} });
    const data = await r.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// FUTURES (USDT/USDC) klines — ESTE É O QUE O TEU WORKER USA
app.get("/api/fapi/v1/klines", async (req, res) => {
  try {
    const { symbol, interval, limit = 500 } = req.query;
    const url = `https://fapi.binance.com/fapi/v1/klines?symbol=${encodeURIComponent(
      symbol
    )}&interval=${encodeURIComponent(interval)}&limit=${encodeURIComponent(
      limit
    )}`;
    const r = await fetch(url);
    if (!r.ok) return res.status(r.status).json({ error: HTTP ${r.status} });
    const data = await r.json();
    res.json(data);
  } catch (f) {
    res.status(500).json({ error: String(f) });
  }
});

// -------------------------------

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(🚀 Proxy a escutar na porta ${PORT});
});

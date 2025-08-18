// CommonJS + fetch nativo do Node (Node >= 18)
const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

// Raiz para teste rápido
app.get("/", (_req, res) => {
  res.json({ ok: true, service: "binance-proxy", msg: "running" });
});

// helper para montar query strings
function withQuery(base, params) {
  const qs = new URLSearchParams(params);
  return ${base}?${qs.toString()};
}

// =======================
//  SPOT klines (api.binance)
//  GET /spot?symbol=BTCUSDC&interval=15m&limit=100
// =======================
app.get("/spot", async (req, res) => {
  try {
    const { symbol, interval = "15m", limit = "100" } = req.query;
    if (!symbol) return res.status(400).json({ error: "Missing symbol" });

    const url = withQuery("https://api.binance.com/api/v3/klines", {
      symbol,
      interval,
      limit
    });

    const r = await fetch(url, { headers: { accept: "application/json" } });
    if (!r.ok) {
      const text = await r.text();
      return res.status(r.status).json({ error: "Binance error", status: r.status, detail: text });
    }
    const data = await r.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// =======================
//  FUTURES klines (fapi.binance)
//  GET /futures?symbol=BTCUSDC&interval=15m&limit=100
// =======================
app.get("/futures", async (req, res) => {
  try {
    const { symbol, interval = "15m", limit = "100" } = req.query;
    if (!symbol) return res.status(400).json({ error: "Missing symbol" });

    const url = withQuery("https://fapi.binance.com/fapi/v1/klines", {
      symbol,
      interval,
      limit
    });

    const r = await fetch(url, { headers: { accept: "application/json" } });
    if (!r.ok) {
      const text = await r.text();
      return res.status(r.status).json({ error: "Binance error", status: r.status, detail: text });
    }
    const data = await r.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

app.listen(PORT, () => {
  console.log(Proxy running on port ${PORT});
});

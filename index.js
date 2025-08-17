const express = require("express");
const fetch = require("node-fetch");
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (_req, res) => {
  res.send("✅ Proxy Binance ativo!");
});

// /proxy?symbol=BTCUSDT&interval=15m&limit=300
app.get("/proxy", async (req, res) => {
  try {
    const { symbol, interval, limit } = req.query;
    if (!symbol || !interval) {
      return res.status(400).json({ error: "Faltam parâmetros ?symbol=BTCUSDT&interval=15m" });
    }
    const lim = Number(limit || 300);
    const url = https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${lim};
    const r = await fetch(url, {
      headers: { "user-agent": "railway-proxy", "accept": "application/json" }
    });
    const data = await r.json();
    res.status(r.status).json(data);
  } catch (e) {
    res.status(500).json({ error: "Erro no proxy", details: String(e) });
  }
});

app.listen(PORT, () => console.log("Proxy ativo na porta " + PORT));

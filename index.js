// index.js — Proxy simples para Binance (sem backticks)
const express = require("express");
const https = require("https");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", function (_req, res) {
  res.status(200).send("✅ Binance Proxy ativo!");
});

// /proxy?symbol=BTCUSDT&interval=15m&limit=300
app.get("/proxy", function (req, res) {
  const symbol = String(req.query.symbol || "BTCUSDT").toUpperCase();
  const interval = String(req.query.interval || "15m");
  const limit = String(req.query.limit || "300");

  const url =
    "https://api.binance.com/api/v3/klines?symbol=" + encodeURIComponent(symbol) +
    "&interval=" + encodeURIComponent(interval) +
    "&limit=" + encodeURIComponent(limit);

  https.get(url, function (r) {
    let data = "";
    r.on("data", function (ch) { data += ch; });
    r.on("end", function () {
      res.setHeader("Content-Type", "application/json");
      res.status(r.statusCode || 200).send(data);
    });
  }).on("error", function (err) {
    res.status(502).json({ error: "Erro ao contactar Binance", details: String(err) });
  });
});

app.listen(PORT, function () {
  console.log("Proxy ativo na porta " + PORT);
});

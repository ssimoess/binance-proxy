// index.js
const express = require("express");
const https = require("https");

const app = express();
const PORT = process.env.PORT || 3000;

// Endpoint principal só para confirmar que está online
app.get("/", (req, res) => {
  res.send("✅ Binance Proxy ativo!");
});

// Endpoint de proxy para Binance Klines
app.get("/proxy", (req, res) => {
  const symbol = req.query.symbol || "BTCUSDT";
  const interval = req.query.interval || "15m";
  const limit = req.query.limit || 10;

  // CORRIGIDO: usar template string com backticks
  const path = /api/v3/klines?symbol=${encodeURIComponent(symbol)}&interval=${encodeURIComponent(interval)}&limit=${limit};

  const options = {
    hostname: "api.binance.com",
    port: 443,
    path: path,
    method: "GET"
  };

  const request = https.request(options, (response) => {
    let data = "";

    response.on("data", (chunk) => {
      data += chunk;
    });

    response.on("end", () => {
      try {
        res.json(JSON.parse(data));
      } catch (e) {
        res.status(500).json({ error: "Erro ao processar resposta da Binance" });
      }
    });
  });

  request.on("error", (error) => {
    res.status(500).json({ error: "Erro no proxy", details: error.message });
  });

  request.end();
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(🚀 Servidor a correr na porta ${PORT});
});

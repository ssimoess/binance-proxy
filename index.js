const express = require("express");
const https = require("https");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("✅ Binance Proxy ativo!");
});

app.get("/proxy", (req, res) => {
  const { symbol = "BTCUSDT", interval = "15m", limit = 5 } = req.query;

  const url = https://api.binance.com/api/v3/klines?symbol=${encodeURIComponent(symbol)}&interval=${encodeURIComponent(interval)}&limit=${encodeURIComponent(limit)};

  https.get(url, (response) => {
    let data = "";

    response.on("data", (chunk) => {
      data += chunk;
    });

    response.on("end", () => {
      try {
        res.json(JSON.parse(data));
      } catch (error) {
        res.status(500).send("Erro ao processar resposta da Binance");
      }
    });
  }).on("error", (err) => {
    res.status(500).send("Erro ao conectar com Binance");
  });
});

app.listen(PORT, () => {
  console.log(🚀 Proxy ativo na porta ${PORT});
});

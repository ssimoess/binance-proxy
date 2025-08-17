const express = require("express");
const fetch = require("node-fetch");

const app = express();
const PORT = process.env.PORT || 3000;

// Rota simples para confirmar que o proxy está ativo
app.get("/", (req, res) => {
  res.send("✅ Binance Proxy ativo!");
});

// Rota de proxy para Binance
app.get("/proxy", async (req, res) => {
  try {
    const { symbol, interval, limit } = req.query;

    if (!symbol || !interval) {
      return res.status(400).json({
        error: "Parâmetros obrigatórios: symbol e interval"
      });
    }

    const url = `https://api.binance.com/api/v3/klines?symbol=${encodeURIComponent(
      symbol
    )}&interval=${encodeURIComponent(interval)}&limit=${encodeURIComponent(
      limit || 10
    )}`;

    const response = await fetch(url);
    const data = await response.json();

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Erro ao contactar Binance", details: err.message });
  }
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(🚀 Proxy ativo na porta ${PORT});
});

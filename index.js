// index.js  — Proxy simples para Binance (Railway)
// CommonJS + node-fetch v2 (garante compatibilidade no Railway)

const express = require("express");
const fetch = require("node-fetch");

const app = express();
const PORT = process.env.PORT || 3000;

// CORS aberto (o teu Worker no Cloudflare pode chamar sem bloqueio)
app.use((_, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

// Healthcheck
app.get("/", (_req, res) => {
  res.status(200).send("✅ Proxy Binance ativo!");
});

// GET /proxy?symbol=BTCUSDT&interval=15m&limit=300
app.get("/proxy", async (req, res) => {
  try {
    const symbol   = String(req.query.symbol || "").toUpperCase();
    const interval = String(req.query.interval || "");
    const lim      = Number(req.query.limit || 300);

    if (!symbol || !interval) {
      return res.status(400).json({ error: "Faltam parâmetros: ?symbol=BTCUSDT&interval=15m&limit=300" });
    }

    const path = /api/v3/klines?symbol=${encodeURIComponent(symbol)}&interval=${encodeURIComponent(interval)}&limit=${lim};

    // Endpoints de fallback (ordem de tentativa)
    const BASES = [
      "https://api.binance.com",
      "https://api1.binance.com",
      "https://api2.binance.com",
      "https://api3.binance.com"
    ];

    // headers simples; não uses user-agents estranhos
    const headers = {
      "accept": "application/json",
      "cache-control": "no-cache"
    };

    let lastErr = null;
    for (const base of BASES) {
      const url = ${base}${path};
      try {
        const r = await fetch(url, { headers, timeout: 15000 });
        const text = await r.text(); // lê como texto para preservar o erro da Binance
        let data;
        try { data = JSON.parse(text); } catch { data = text; }

        if (r.ok) {
          return res.status(200).json(data);
        } else {
          lastErr = new Error(Binance HTTP ${r.status} @ ${base});
          // tenta próximo base se 403/429/5xx
          if ([403,429,451,500,502,503,520,525].includes(r.status)) continue;
          return res.status(r.status).json({ error: lastErr.message, details: data });
        }
      } catch (e) {
        lastErr = e;
        // tenta próximo BASE
        continue;
      }
    }

    // se todas falharem
    return res.status(502).json({ error: "All Binance bases failed", details: String(lastErr) });

  } catch (e) {
    return res.status(500).json({ error: "Erro no proxy", details: String(e) });
  }
});

app.listen(PORT, () => {
  console.log(🚀 Proxy ativo na porta ${PORT});
});

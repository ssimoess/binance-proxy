// server.js  —  Proxy simples para Binance (Futures e Spot)
// Funciona em dois modos:
//  (A) query:  /proxy?url=/fapi/v1/klines?symbol=BTCUSDT&interval=15m&limit=5
//  (B) path :  /fapi/v1/klines?symbol=BTCUSDT&interval=15m&limit=5

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const app = express();
app.use(cors());
app.use(morgan("tiny"));

const UA = "railway-binance-proxy";

// Página de estado simples
app.get("/", (req, res) => {
  res.type("text/plain").send("✅ Binance Proxy ativo!");
});

// Helper para construir URL alvo
function targetUrl(pathOrUrl) {
  if (!pathOrUrl) return null;
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
    return pathOrUrl;
  }
  const p = pathOrUrl.startsWith("/") ? pathOrUrl : "/" + pathOrUrl;
  // Por padrão usa FUTURES (fapi). Se precisares de spot, usa /api/… no pedido.
  const base = p.startsWith("/api/") ? "https://api.binance.com" : "https://fapi.binance.com";
  return base + p;
}

// Modo (A) — via query ?url=
app.get("/proxy", async (req, res) => {
  const u = targetUrl(req.query.url);
  if (!u) return res.status(400).json({ ok: false, err: "missing url" });
  try {
    const r = await fetch(u, { headers: { "user-agent": UA } });
    const text = await r.text();
    res.status(r.status);
    res.set("Content-Type", r.headers.get("content-type") || "application/json");
    return res.send(text);
  } catch (e) {
    return res.status(500).json({ ok: false, err: String(e) });
  }
});

// Modo (B) — “path direto” para FUTURES
app.use("/fapi", async (req, res) => {
  const u = "https://fapi.binance.com" + req.originalUrl;
  try {
    const r = await fetch(u, { headers: { "user-agent": UA } });
    const text = await r.text();
    res.status(r.status);
    res.set("Content-Type", r.headers.get("content-type") || "application/json");
    return res.send(text);
  } catch (e) {
    return res.status(500).json({ ok: false, err: String(e) });
  }
});

// (Opcional) “path direto” para SPOT
app.use("/api", async (req, res) => {
  const u = "https://api.binance.com" + req.originalUrl;
  try {
    const r = await fetch(u, { headers: { "user-agent": UA } });
    const text = await r.text();
    res.status(r.status);
    res.set("Content-Type", r.headers.get("content-type") || "application/json");
    return res.send(text);
  } catch (e) {
    return res.status(500).json({ ok: false, err: String(e) });
  }
});

// Rota de teste rápido
app.get("/test-klines", async (req, res) => {
  const u = "https://fapi.binance.com/fapi/v1/klines?symbol=BTCUSDT&interval=15m&limit=3";
  try {
    const r = await fetch(u, { headers: { "user-agent": UA } });
    const j = await r.json();
    return res.json({ ok: true, sample: j });
  } catch (e) {
    return res.status(500).json({ ok: false, err: String(e) });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Proxy on :" + PORT));

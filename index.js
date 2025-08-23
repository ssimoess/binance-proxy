// index.js — Proxy simples p/ Binance (Node >= 18)
const http = require("http");
const { URL } = require("url");

const PORT = process.env.PORT || 3000;

const BASES = {
  "/api/":  process.env.API_BASE  || "https://api.binance.com",
  "/fapi/": process.env.FAPI_BASE || "https://fapi.binance.com",
  "/dapi/": process.env.DAPI_BASE || "https://dapi.binance.com",
  "/eapi/": process.env.EAPI_BASE || "https://eapi.binance.com",
};

function chooseBase(pathname) {
  for (const prefix of Object.keys(BASES)) if (pathname.startsWith(prefix)) return BASES[prefix];
  return BASES["/fapi/"]; // default
}

function buildTarget(reqUrl) {
  const url = new URL(reqUrl, "http://localhost");

  // Estilo query: /?path=/fapi/v1/klines&symbol=BTCUSDT&interval=15m&limit=5
  if (url.pathname === "/" || url.pathname === "/proxy") {
    const p = url.searchParams.get("path");
    if (!p) return null;
    const rest = new URLSearchParams(url.search);
    rest.delete("path");
    const sep = p.includes("?") ? "&" : "?";
    return chooseBase(p) + p + (rest.toString() ? sep + rest.toString() : "");
  }

  // Estilo direto: /fapi/... (ou /api, /dapi, /eapi)
  if (/^\/(fapi|api|dapi|eapi)\//.test(url.pathname)) {
    const base = chooseBase(url.pathname);
    return base + url.pathname + (url.search || "");
  }

  return null;
}

const server = http.createServer(async (req, res) => {
  // Saúde
  if (req.method === "GET" && req.url === "/") {
    res.writeHead(200, { "content-type": "text/plain; charset=utf-8" });
    res.end("✅ Binance Proxy ativo!\nUse /fapi/... ou /?path=/fapi/...");
    return;
  }

  const target = buildTarget(req.url);
  if (!target) {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    res.end("Not found. Ex.: /fapi/v1/klines?symbol=BTCUSDT&interval=15m&limit=5");
    return;
  }

  try {
    const r = await fetch(target, { method: req.method, headers: { "user-agent": "railway-proxy", accept: "/" }});
    const buf = await r.arrayBuffer();
    res.writeHead(r.status, { "content-type": r.headers.get("content-type") || "application/json" });
    res.end(Buffer.from(buf));
  } catch (err) {
    res.writeHead(502, { "content-type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ ok: false, err: String(err) }));
  }
});

server.listen(PORT, () => console.log("Proxy on :" + PORT));

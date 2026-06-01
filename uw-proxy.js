const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const TOKEN = process.env.UW_TOKEN || "";

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") { res.writeHead(204); res.end(); return; }

  // Serve the dashboard HTML
  if (req.url === "/" || req.url === "/index.html") {
    const file = path.join(__dirname, "index.html");
    if (fs.existsSync(file)) {
      res.setHeader("Content-Type", "text/html");
      res.writeHead(200);
      res.end(fs.readFileSync(file));
    } else {
      res.writeHead(404);
      res.end("index.html not found");
    }
    return;
  }

  // Proxy flow data from Unusual Whales
  if (req.url === "/flow") {
    if (!TOKEN) { res.writeHead(500); res.end('{"error":"UW_TOKEN not set"}'); return; }
    const options = {
      hostname: "api.unusualwhales.com",
      path: "/api/option-trades/flow-alerts",
      headers: { Authorization: `Bearer ${TOKEN}` },
    };
    https.get(options, (apiRes) => {
      let body = "";
      apiRes.on("data", chunk => body += chunk);
      apiRes.on("end", () => {
        res.setHeader("Content-Type", "application/json");
        res.writeHead(apiRes.statusCode);
        res.end(body);
      });
    }).on("error", (e) => {
      res.writeHead(502);
      res.end(JSON.stringify({ error: e.message }));
    });
    return;
  }

  res.writeHead(404);
  res.end('{"error":"not found"}');
});

server.listen(PORT, () => console.log(`UW proxy + dashboard running on port ${PORT}`));

const http = require("http");
const https = require("https");

const PORT = process.env.PORT || 3000;
const TOKEN = process.env.UW_TOKEN || "";

const server = http.createServer((req, res) => {
res.setHeader("Access-Control-Allow-Origin", "*");
res.setHeader("Access-Control-Allow-Headers", "Content-Type");

if (req.method === "OPTIONS") { res.writeHead(204); res.end(); return; }
if (req.url !== "/flow") { res.writeHead(404); res.end('{"error":"not found"}'); return; }
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
});

server.listen(PORT, () => console.log(`UW proxy running on port ${PORT}`));

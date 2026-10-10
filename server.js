const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "public");
const port = Number(process.env.PORT || 3000);

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml; charset=utf-8",
  ".ico": "image/x-icon"
};

function send(res, status, body, type = "text/plain; charset=utf-8") {
  res.writeHead(status, {
    "Content-Type": type,
    "Cache-Control": "no-store"
  });
  res.end(body);
}

const server = http.createServer((req, res) => {
  const requested = decodeURIComponent(req.url.split("?")[0]);
  const safePath = path.normalize(requested).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(root, safePath === "/" ? "index.html" : safePath);

  if (!filePath.startsWith(root)) {
    send(res, 403, "Acesso negado");
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      fs.readFile(path.join(root, "index.html"), (fallbackError, fallback) => {
        if (fallbackError) {
          send(res, 404, "Arquivo nao encontrado");
          return;
        }
        send(res, 200, fallback, types[".html"]);
      });
      return;
    }

    send(res, 200, data, types[path.extname(filePath)] || "application/octet-stream");
  });
});

server.listen(port, () => {
  console.log(`ICE GEN rodando em http://localhost:${port}`);
});

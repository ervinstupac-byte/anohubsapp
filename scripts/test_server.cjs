const http = require('http');
const resolver = require('../src/lib/canonicalResolver.cjs');

const PORT = process.env.TEST_SERVER_PORT || 3005;

const server = http.createServer((req, res) => {
  if (req.url.startsWith('/canonical')) {
    const idx = resolver.buildIndex();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ count: idx.count, samples: resolver.getSamplePaths(10) }));
    return;
  }

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ status: 'ok', ts: Date.now() }));
});

server.listen(PORT, () => {
  console.log(`Test server listening on http://localhost:${PORT}`);
});

process.on('SIGTERM', () => server.close());
process.on('SIGINT', () => server.close());

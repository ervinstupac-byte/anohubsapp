const fs = require('fs');
const path = require('path');
const http = require('http');
// small mime lookup to avoid new dependency
function getMimeType(fp){
  const ext = path.extname(fp).toLowerCase();
  switch(ext){
    case '.html': return 'text/html';
    case '.js': return 'application/javascript';
    case '.css': return 'text/css';
    case '.png': return 'image/png';
    case '.jpg': case '.jpeg': return 'image/jpeg';
    case '.svg': return 'image/svg+xml';
    case '.json': return 'application/json';
    case '.wasm': return 'application/wasm';
    default: return 'application/octet-stream';
  }
}
const { chromium } = require('@playwright/test');

const publicDir = path.join(__dirname, '..', 'public');
const port = 3001;

function serveStatic(req, res) {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath === '/') urlPath = '/index.html';
  const filePath = path.join(publicDir, urlPath.replace(/^\//, ''));
  if (!filePath.startsWith(publicDir)) { res.statusCode = 403; res.end('Forbidden'); return; }
  fs.stat(filePath, (err, st) => {
    if (err) { res.statusCode = 404; res.end('Not found'); return; }
    const type = getMimeType(filePath) || 'application/octet-stream';
    res.setHeader('Content-Type', type + '; charset=utf-8');
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
}

const server = http.createServer(serveStatic);
server.listen(port, async () => {
  console.log('Static server listening on', port);
  const pages = [
    'archive/turbine_friend/francis_sop_penstock/index.html',
    'archive/turbine_friend/francis_sop_generator/index.html',
    'archive/case-studies/cs-francis-misalignment/index.html',
    'archive/case-studies/cs-hydraulic-hammer-mitigation/index.html',
    'archive/case-studies/cs-pelton-abrasion/index.html',
    'archive/case-studies/cs-predictive-maintenance-roi/index.html',
    'archive/case-studies/cs-shaft-system-stability/index.html',
    'archive/case-studies/cs-kaplan-optimization/index.html'
  ];

  const outDir = path.join(__dirname, 'reports', 'nc102_screenshots');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1200, height: 800 } });
  const report = [];
  for (const rel of pages) {
    const url = `http://localhost:${port}/${rel}`;
    const page = await context.newPage();
    try {
      await page.goto(url, { waitUntil: 'load', timeout: 20000 });
      await page.waitForLoadState('networkidle');
      const name = rel.split('/').slice(-3).join('__').replace(/[^a-zA-Z0-9_\.\-]/g,'_');
      const shotPath = path.join(outDir, name + '.png');
      await page.screenshot({ path: shotPath, fullPage: true });
      const html = await page.content();
      const fn = (html.match(/<p>[\s\S]*?<strong>\s*Function:\s*<\/strong>[\s\S]*?<\/p>/i)||[])[0] || null;
      const analysis = (html.match(/<p>[\s\S]*?<strong>\s*Current Analysis:\s*<\/strong>[\s\S]*?<\/p>/i)||[])[0] || null;
      const rec = (html.match(/<p>[\s\S]*?<strong>\s*Operational Recommendation:\s*<\/strong>[\s\S]*?<\/p>/i)||[])[0] || null;
      report.push({ url, screenshot: path.relative(__dirname, shotPath).replace(/\\/g,'/'), function: fn, analysis, recommendation: rec });
      console.log('Captured', url);
    } catch (e) {
      console.error('Error capturing', url, e.message);
      report.push({ url, error: e.message });
    } finally {
      await page.close();
    }
  }
  await browser.close();
  const outFile = path.join(__dirname, 'reports', 'nc102_playwright_report.json');
  fs.writeFileSync(outFile, JSON.stringify(report, null, 2), 'utf8');
  console.log('Playwright sweep complete. report=', outFile);
  server.close();
});

const fs = require('fs');
const path = require('path');
const { chromium } = require('@playwright/test');

const outDir = path.join(__dirname, 'reports', 'nc102_screenshots');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const pages = [
  'public/archive/turbine_friend/francis_sop_penstock/index.html',
  'public/archive/turbine_friend/francis_sop_generator/index.html',
  'public/archive/case-studies/cs-francis-misalignment/index.html',
  'public/archive/case-studies/cs-hydraulic-hammer-mitigation/index.html',
  'public/archive/case-studies/cs-pelton-abrasion/index.html',
  'public/archive/case-studies/cs-predictive-maintenance-roi/index.html',
  'public/archive/case-studies/cs-shaft-system-stability/index.html',
  'public/archive/case-studies/cs-kaplan-optimization/index.html'
];

const base = 'http://localhost:3000/';

function extractSection(html, key) {
  const rx = new RegExp(`<p>[\\s\\S]*?<strong>\\s*${key}:\\s*</strong>[\\s\\S]*?<\\/p>`, 'i');
  const m = html.match(rx);
  return m ? m[0].replace(/\n/g,' ').trim() : null;
}

(async ()=>{
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1200, height: 800 } });
  const report = [];
  for (const rel of pages) {
    const url = base + rel.replace(/^public\//,'');
    const page = await context.newPage();
    try {
      await page.goto(url, { waitUntil: 'load', timeout: 20000 });
      await page.waitForLoadState('networkidle');
      const name = rel.split('/').slice(-3).join('__').replace(/[^a-zA-Z0-9_\.\-]/g,'_');
      const shotPath = path.join(outDir, name + '.png');
      await page.screenshot({ path: shotPath, fullPage: true });
      const html = await page.content();
      const fn = extractSection(html, 'Function');
      const analysis = extractSection(html, 'Current Analysis');
      const rec = extractSection(html, 'Operational Recommendation');
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
})().catch(e=>{ console.error(e); process.exit(1); });

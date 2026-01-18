const puppeteer = require('puppeteer');

const BASE = 'https://ervinstupac-byte.github.io/anohubsapp';
const PATH = '/knowledge/health-monitor';
const TIMEOUT = 120000; // 2 minutes

async function waitForAudit(page) {
  const start = Date.now();
  while (Date.now() - start < TIMEOUT) {
    const text = await page.evaluate(() => document.body.innerText || '');
    // Check for common success markers
    if (text.includes('854 REAL') || text.includes('854 / 0') || text.includes('854 / 854') || text.includes('854 VERIFIED') || /854\s*REAL\s*\/\s*0/.test(text)) {
      return { ok: true, text };
    }
    // Wait a bit
    await new Promise(r => setTimeout(r, 1500));
  }
  return { ok: false };
}

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox','--disable-setuid-sandbox'] });
  try {
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(TIMEOUT);
    console.log('Opening', BASE + PATH);
    await page.goto(BASE + PATH, { waitUntil: 'networkidle2' });

    // Click the Run Content Audit button if present
    const btn = await page.$x("//button[contains(., 'Run Content Audit') or contains(., 'Auditing')]" );
    if (btn && btn.length > 0) {
      console.log('Found Run Content Audit button — triggering audit');
      try { await btn[0].click(); } catch(e) { /* continue */ }
    } else {
      console.log('Run button not found — page may have auto-audited');
    }

    // Wait for audit to complete and check for 854 markers
    const res = await waitForAudit(page);
    if (res.ok) {
      console.log('SUCCESS: Detected 854 markers in page text.');
      process.exit(0);
    }
    console.error('FAIL: Did not detect 854 markers within timeout.');
    process.exit(2);
  } catch (err) {
    console.error('ERROR', err && err.message ? err.message : err);
    process.exit(3);
  } finally {
    await browser.close();
  }
})();

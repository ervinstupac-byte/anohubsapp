const puppeteer = require('puppeteer');

const BASE = 'https://ervinstupac-byte.github.io/anohubsapp';
const PATH = '/knowledge/health-monitor';
const TIMEOUT = 120000; // 2 minutes

async function waitForAudit(page) {
  const start = Date.now();
  while (Date.now() - start < TIMEOUT) {
    const text = await page.evaluate(() => document.body.innerText || '');
    if (text.includes('854 REAL') || text.includes('854 / 0') || text.includes('854 / 854') || text.includes('854 VERIFIED') || /854\s*REAL\s*\/\s*0/.test(text)) {
      return { ok: true, text };
    }
    await new Promise(r => setTimeout(r, 1500));
  }
  return { ok: false };
}

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox','--disable-setuid-sandbox'] });
  try {
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(TIMEOUT);
    page.on('console', msg => console.log('PAGE_CONSOLE:', msg.text()));
    page.on('pageerror', err => console.log('PAGE_ERROR:', err && err.message ? err.message : err));
    console.log('Opening', BASE + '/ (root) and then navigating client-side to', PATH);
    await page.goto(BASE + '/', { waitUntil: 'networkidle2' });
    // Client-side navigate to the SPA route so we avoid GitHub Pages 404 on deep links
    await page.evaluate((p) => {
      const target = p.startsWith('/') ? p : '/' + p;
      const basePrefix = location.pathname.replace(/\/$/, '');
      // Ensure we include the repo base if necessary
      const newPath = basePrefix.endsWith('/anohubsapp') ? `/anohubsapp${target}` : target;
      history.pushState({}, '', newPath);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }, PATH);
    // Wait briefly for SPA to render
    await new Promise(r => setTimeout(r, 1500));
    const snapshot = await page.evaluate(() => (document.body.innerText || '').slice(0, 3000));
    console.log('PAGE SNAPSHOT (first 3000 chars)---\n' + snapshot + '\n---END SNAPSHOT');
    // Also dump raw HTML head for debugging
    const html = (await page.content()).slice(0, 4000);
    console.log('PAGE HTML HEAD (first 4000 chars)---\n' + html + '\n---END HTML');

    const clicked = await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => /Run Content Audit|Auditing/i.test(b.innerText));
      if (btn) { try { btn.click(); return true; } catch(e) { return false; } }
      return false;
    });
    console.log(clicked ? 'Found Run Content Audit button — triggered' : 'Run button not found — page may have auto-audited');
    // Log snapshot after triggering
    const snapshot2 = await page.evaluate(() => (document.body.innerText || '').slice(0, 3000));
    console.log('PAGE SNAPSHOT AFTER CLICK (first 3000 chars)---\n' + snapshot2 + '\n---END SNAPSHOT');
    const html2 = (await page.content()).slice(0, 4000);
    console.log('PAGE HTML AFTER CLICK (first 4000 chars)---\n' + html2 + '\n---END HTML');

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

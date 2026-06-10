const fs = require('fs');
const path = require('path');
const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1200, height: 800 } });
  const page = await context.newPage();
  try {
    await page.goto('http://localhost:3001/#/', { waitUntil: 'load', timeout: 20000 });
    await page.evaluate(() => { localStorage.setItem('ANOHUB_AUTO_GUEST', 'true'); });
    await page.evaluate(() => { window.dispatchEvent(new Event('ANOHUB_DISABLE_OVERLAYS')); });
    await page.waitForTimeout(500);
    await page.evaluate(() => { window.dispatchEvent(new Event('ANOHUB_SIGNIN_GUEST')); });
    await page.waitForTimeout(1000);

    const clickables = await page.evaluate(() => {
      const sels = Array.from(document.querySelectorAll('button, [role="button"], a, input[type="button"], input[type="submit"], [onclick]'));
      return sels.map((el, idx) => {
        const text = (el.innerText || el.getAttribute('aria-label') || el.getAttribute('title') || el.getAttribute('alt') || '').trim();
        const html = el.outerHTML ? el.outerHTML.slice(0, 300) : '';
        return { index: idx, tag: el.tagName, role: el.getAttribute('role') || null, text, html };
      });
    });

    const outDir = path.join(__dirname, 'reports');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, 'clickables.json'), JSON.stringify(clickables, null, 2), 'utf8');
    console.log('Wrote clickables.json with', clickables.length, 'items');
  } catch (err) {
    console.error(err);
  } finally {
    await browser.close();
  }
})();

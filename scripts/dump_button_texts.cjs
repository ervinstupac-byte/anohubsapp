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
    const texts = await page.$$eval('button', els => els.map(b => (b.innerText || '').trim()).filter(Boolean));
    const unique = [...new Set(texts)];
    const outDir = path.join(__dirname, 'reports');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, 'button_texts.json'), JSON.stringify(unique, null, 2), 'utf8');
    console.log('Wrote button_texts.json with', unique.length, 'items');
  } catch (err) {
    console.error(err);
  } finally {
    await browser.close();
  }
})();

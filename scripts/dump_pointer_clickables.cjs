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

    const items = await page.evaluate(() => {
      const all = Array.from(document.querySelectorAll('*'));
      const res = [];
      for (let i = 0; i < all.length && res.length < 500; i++) {
        const el = all[i];
        try {
          const style = getComputedStyle(el);
          if (!style) continue;
          if (style.cursor && style.cursor === 'pointer') {
            const rect = el.getBoundingClientRect();
            if (rect.width < 5 || rect.height < 5) continue;
            const text = (el.innerText || el.getAttribute('aria-label') || el.getAttribute('title') || '').trim();
            res.push({ index: res.length, tag: el.tagName, role: el.getAttribute('role') || null, text, classes: el.className || null, html: (el.outerHTML||'').slice(0,300) });
          }
        } catch (e) { /* ignore cross-origin etc */ }
      }
      return res;
    });

    const outDir = path.join(__dirname, 'reports');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, 'pointer_clickables.json'), JSON.stringify(items, null, 2), 'utf8');
    console.log('Wrote pointer_clickables.json with', items.length, 'items');
  } catch (err) {
    console.error(err);
  } finally {
    await browser.close();
  }
})();

const fs = require('fs');
const path = require('path');
const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1200, height: 800 } });
  const page = await context.newPage();
  const results = [];
  try {
    const startUrl = 'http://localhost:3001/#/';
    await page.goto(startUrl, { waitUntil: 'load', timeout: 20000 });

    await page.evaluate(() => { localStorage.setItem('ANOHUB_AUTO_GUEST', 'true'); });
    await page.evaluate(() => { window.dispatchEvent(new Event('ANOHUB_DISABLE_OVERLAYS')); });
    await page.waitForTimeout(500);
    await page.evaluate(() => { window.dispatchEvent(new Event('ANOHUB_SIGNIN_GUEST')); });
    await page.waitForTimeout(1000);

    const texts = await page.$$eval('button', els => els.map(b => (b.innerText || '').trim()).filter(Boolean));
    const uniqueTexts = [...new Set(texts)].slice(0, 300);
    const blacklist = /(generate|print|share|delete|signout|sign out|logout|download|export|official pdf|generate official pdf)/i;

    for (const t of uniqueTexts) {
      if (blacklist.test(t)) { results.push({ target: t, skipped: true, reason: 'blacklist' }); continue; }
      try {
        const safeSel = `button:has-text("${t.replace(/"/g, '\\"')}")`;
        const btn = page.locator(safeSel).first();
        const visible = await btn.isVisible().catch(() => false);
        const enabled = await btn.isEnabled().catch(() => false);
        if (!visible || !enabled) { results.push({ target: t, skipped: true, reason: 'not-visible-or-disabled', visible, enabled }); continue; }
        await btn.scrollIntoViewIfNeeded().catch(() => {});
        await btn.click({ timeout: 5000 }).catch(err => { throw err; });
        await page.waitForLoadState('networkidle', { timeout: 3000 }).catch(() => {});
        await page.waitForTimeout(500);

        const dialogs = await page.locator('[role="dialog"]').count().catch(() => 0);
        const modalSteps = [];
        if (dialogs > 0) {
          const dialog = page.locator('[role="dialog"]').first();
          let loops = 0;
          while (loops < 10) {
            const nextBtn = dialog.locator('button:has-text("Next")').first();
            const visNext = await nextBtn.isVisible().catch(() => false);
            const enabledNext = await nextBtn.isEnabled().catch(() => false);
            if (!visNext || !enabledNext) break;
            await nextBtn.click({ timeout: 3000 }).catch(() => {});
            await page.waitForTimeout(300);
            modalSteps.push('clicked Next');
            loops++;
          }
          const cancelBtn = dialog.locator('button:has-text("Cancel")').first();
          if (await cancelBtn.isVisible().catch(() => false)) { await cancelBtn.click().catch(() => {}); } else { await page.keyboard.press('Escape').catch(() => {}); }
        }
        results.push({ target: t, success: true, dialogs, modalSteps });
      } catch (err) {
        results.push({ target: t, success: false, error: String(err) });
      }
      await page.waitForTimeout(200);
    }

    const tryFlows = ['Asset Onboarding', 'Open Asset Onboarding', 'Add Asset', 'Logbook', 'ProblemDetection', 'Problem Detection', 'Alignment', 'Alignment Wizard', 'FleetView', 'Maintenance Logbook', 'Register New Asset'];
    for (const flowName of tryFlows) {
      try {
        const loc = page.locator(`button:has-text("${flowName.replace(/"/g, '\\"')}")`).first();
        if (await loc.isVisible().catch(() => false)) {
          await loc.click().catch(() => {});
          await page.waitForTimeout(800);
          const dialogs = await page.locator('[role="dialog"]').count().catch(() => 0);
          results.push({ flow: flowName, triggered: true, dialogs });
          if (dialogs > 0) {
            const dialog = page.locator('[role="dialog"]').first();
            const nextBtn = dialog.locator('button:has-text("Next")').first();
            if (await nextBtn.isVisible().catch(() => false) && await nextBtn.isEnabled().catch(() => false)) { await nextBtn.click().catch(() => {}); await page.waitForTimeout(400); results.push({ flow: flowName, advanced: true }); }
            const cancelBtn = dialog.locator('button:has-text("Cancel")').first();
            if (await cancelBtn.isVisible().catch(() => false)) await cancelBtn.click().catch(() => {}); else await page.keyboard.press('Escape').catch(() => {});
          }
        } else {
          results.push({ flow: flowName, triggered: false, reason: 'not-found' });
        }
      } catch (e) {
        results.push({ flow: flowName, triggered: false, error: String(e) });
      }
    }

  } catch (err) {
    results.push({ error: String(err) });
  } finally {
    await browser.close();
  }

  const outDir = path.join(__dirname, 'reports');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, 'playwright_ui_report.json');
  fs.writeFileSync(outFile, JSON.stringify(results, null, 2), 'utf8');
  console.log('Playwright UI sweep written to', outFile);
})();

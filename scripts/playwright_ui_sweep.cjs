const fs = require('fs');
const path = require('path');
const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1200, height: 800 } });
  await context.addInitScript(() => {
    try {
      localStorage.setItem('ANOHUB_AUTO_GUEST', 'true');
      localStorage.setItem('hasCompletedOnboarding', 'true');
      try { if (document && document.body) document.body.setAttribute('data-anohub-overlays-disabled', 'true'); } catch (e) {}
    } catch (e) {}
  });
  const page = await context.newPage();
  const results = [];
  try {
    const startUrl = 'http://localhost:3001/#/';
    await page.goto(startUrl, { waitUntil: 'load', timeout: 20000 });

    await page.evaluate(() => { try { window.dispatchEvent(new Event('ANOHUB_DISABLE_OVERLAYS')); } catch (e) {} });
    await page.waitForTimeout(500);
    await page.evaluate(() => { try { window.dispatchEvent(new Event('ANOHUB_SIGNIN_GUEST')); } catch (e) {} });
    await page.waitForTimeout(1000);

    // Collect button texts from all frames (main page + iframes)
    const frames = page.frames();
    let allTexts = [];
    for (const f of frames) {
      try {
        const t = await f.$$eval('button', els => els.map(b => (b.innerText || '').trim()).filter(Boolean));
        allTexts = allTexts.concat(t);
      } catch (e) {}
    }
    const uniqueTexts = [...new Set(allTexts)].slice(0, 300);
    const blacklist = /(generate|print|share|delete|signout|sign out|logout|download|export|official pdf|generate official pdf)/i;

    for (const t of uniqueTexts) {
      if (blacklist.test(t)) { results.push({ target: t, skipped: true, reason: 'blacklist' }); continue; }
      try {
        const escaped = t.replace(/"/g, '\\"');
        let clicked = false;
        for (const f of page.frames()) {
          try {
            const safeSel = `button:has-text("${escaped}")`;
            const btn = f.locator(safeSel).first();
            const visible = await btn.isVisible().catch(() => false);
            const enabled = await btn.isEnabled().catch(() => false);
            if (!visible || !enabled) continue;
            await btn.scrollIntoViewIfNeeded().catch(() => {});
            await btn.click({ timeout: 5000 }).catch(err => { throw err; });
            await page.waitForLoadState('networkidle', { timeout: 3000 }).catch(() => {});
            await page.waitForTimeout(500);

            // Count dialogs across frames and handle modal steps inside the dialog's frame
            let dialogs = 0;
            for (const ff of page.frames()) {
              dialogs += await ff.locator('[role="dialog"]').count().catch(() => 0);
            }
            const modalSteps = [];
            if (dialogs > 0) {
              let dialogFrame = null;
              for (const ff of page.frames()) {
                if ((await ff.locator('[role="dialog"]').count().catch(() => 0)) > 0) { dialogFrame = ff; break; }
              }
              if (dialogFrame) {
                let loops = 0;
                while (loops < 10) {
                  const nextBtn = dialogFrame.locator('button:has-text("Next")').first();
                  const visNext = await nextBtn.isVisible().catch(() => false);
                  const enabledNext = await nextBtn.isEnabled().catch(() => false);
                  if (!visNext || !enabledNext) break;
                  await nextBtn.click({ timeout: 3000 }).catch(() => {});
                  await page.waitForTimeout(300);
                  modalSteps.push('clicked Next');
                  loops++;
                }
                const cancelBtn = dialogFrame.locator('button:has-text("Cancel")').first();
                if (await cancelBtn.isVisible().catch(() => false)) { await cancelBtn.click().catch(() => {}); } else { await page.keyboard.press('Escape').catch(() => {}); }
              }
            }
            results.push({ target: t, success: true, dialogs, modalSteps });
            clicked = true;
            break;
          } catch (e) {
            // try next frame
          }
        }
        if (!clicked) {
          results.push({ target: t, skipped: true, reason: 'not-visible-or-disabled', visible: false, enabled: false });
        }
      } catch (err) {
        results.push({ target: t, success: false, error: String(err) });
      }
      await page.waitForTimeout(200);
    }

    const tryFlows = ['Asset Onboarding', 'Open Asset Onboarding', 'Add Asset', 'Logbook', 'ProblemDetection', 'Problem Detection', 'Alignment', 'Alignment Wizard', 'FleetView', 'Maintenance Logbook', 'Register New Asset'];
    for (const flowName of tryFlows) {
      let triggered = false;
      for (const f of page.frames()) {
        try {
          const loc = f.locator(`button:has-text("${flowName.replace(/"/g, '\\"')}")`).first();
          if (await loc.isVisible().catch(() => false)) {
            await loc.click().catch(() => {});
            await page.waitForTimeout(800);
            let dialogs = 0;
            for (const ff of page.frames()) {
              dialogs += await ff.locator('[role="dialog"]').count().catch(() => 0);
            }
            results.push({ flow: flowName, triggered: true, dialogs });
            if (dialogs > 0) {
              let dialogFrame = null;
              for (const ff of page.frames()) {
                if ((await ff.locator('[role="dialog"]').count().catch(() => 0)) > 0) { dialogFrame = ff; break; }
              }
              if (dialogFrame) {
                const nextBtn = dialogFrame.locator('button:has-text("Next")').first();
                if (await nextBtn.isVisible().catch(() => false) && await nextBtn.isEnabled().catch(() => false)) { await nextBtn.click().catch(() => {}); await page.waitForTimeout(400); results.push({ flow: flowName, advanced: true }); }
                const cancelBtn = dialogFrame.locator('button:has-text("Cancel")').first();
                if (await cancelBtn.isVisible().catch(() => false)) await cancelBtn.click().catch(() => {}); else await page.keyboard.press('Escape').catch(() => {});
              }
            }
            triggered = true;
            break;
          }
        } catch (e) {
          // continue to next frame
        }
      }
      if (!triggered) results.push({ flow: flowName, triggered: false, reason: 'not-found' });
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

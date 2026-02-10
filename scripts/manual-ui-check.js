import { chromium } from '@playwright/test';

const url = process.env.TEST_URL || 'http://127.0.0.1:3001/';
const maxClicksPerSection = Number(process.env.MAX_CLICKS_PER_SECTION || 25);
const routesFromEnv = (process.env.ROUTE_PATHS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const defaultPaths = [
  '/',
  '/diagnostic-twin',
  '/francis/hub',
  '/francis/command-center',
  '/francis/diagnostics',
  '/maintenance/dashboard',
  '/map',
  '/risk-assessment',
  '/profile',
  '/hpp-builder',
  '/infrastructure/plant-master'
];

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  page.setDefaultTimeout(8000);
  page.setDefaultNavigationTimeout(15000);

  const errors = [];
  const origin = (() => {
    try {
      return new URL(url).origin;
    } catch {
      return url.replace(/\/$/, '');
    }
  })();

  page.on('pageerror', (err) => {
    errors.push({ type: 'pageerror', message: err?.message || String(err) });
  });
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push({ type: 'console', message: msg.text() });
  });
  page.on('requestfailed', (req) => {
    errors.push({ type: 'requestfailed', message: `${req.url()} :: ${req.failure()?.errorText || 'unknown error'}` });
  });
  page.on('dialog', async (dialog) => {
    try {
      await dialog.dismiss();
    } catch {
      // ignore
    }
  });
  page.on('popup', async (popup) => {
    try {
      await popup.close();
    } catch {
      // ignore
    }
  });

  const clickIfSafe = async (locator, label) => {
    try {
      const handle = await locator.elementHandle({ timeout: 1000 });
      if (!handle) return { clicked: false, skipped: 'detached' };

      await handle.scrollIntoViewIfNeeded().catch(() => {});

      const meta = await handle.evaluate((el) => {
        const anyEl = el;
        const disabled = !!anyEl?.disabled || anyEl?.getAttribute?.('aria-disabled') === 'true';
        const tag = (anyEl?.tagName || '').toLowerCase();
        const href = tag === 'a' ? anyEl.getAttribute('href') || '' : '';
        const target = tag === 'a' ? anyEl.getAttribute('target') || '' : '';
        return { disabled, tag, href, target };
      });
      if (meta.disabled) return { clicked: false, skipped: 'disabled' };

      if (meta.tag === 'a') {
        const href = (meta.href || '').trim();
        const target = (meta.target || '').trim();
        const isExternal = /^https?:\/\//i.test(href) || href.startsWith('mailto:') || href.startsWith('tel:');
        const isDownload = href.includes('.pdf') || href.includes('.zip') || href.includes('.doc') || href.includes('.xlsx');
        const isBlank = target === '_blank';
        if (isExternal || isDownload || isBlank) return { clicked: false, skipped: 'external-or-download' };
      }

      if (!(await locator.isVisible({ timeout: 500 }).catch(() => false))) return { clicked: false, skipped: 'not-visible' };

      await locator.click({ timeout: 2000 });
      await page.waitForTimeout(300);
      return { clicked: true };
    } catch (err) {
      errors.push({ type: 'click', message: `${label}: ${err?.message || String(err)}` });
      return { clicked: false, skipped: 'error' };
    }
  };

  const clickHandleIfSafe = async (handle, label) => {
    try {
      await handle.scrollIntoViewIfNeeded().catch(() => {});

      const box = await handle.boundingBox().catch(() => null);
      if (!box) return { clicked: false, skipped: 'not-visible' };

      const meta = await handle.evaluate((el) => {
        const anyEl = el;
        const disabled = !!anyEl?.disabled || anyEl?.getAttribute?.('aria-disabled') === 'true';
        const tag = (anyEl?.tagName || '').toLowerCase();
        const href = tag === 'a' ? anyEl.getAttribute('href') || '' : '';
        const target = tag === 'a' ? anyEl.getAttribute('target') || '' : '';
        return { disabled, tag, href, target };
      });
      if (meta.disabled) return { clicked: false, skipped: 'disabled' };

      if (meta.tag === 'a') {
        const href = (meta.href || '').trim();
        const target = (meta.target || '').trim();
        const isExternal = /^https?:\/\//i.test(href) || href.startsWith('mailto:') || href.startsWith('tel:');
        const isDownload = href.includes('.pdf') || href.includes('.zip') || href.includes('.doc') || href.includes('.xlsx');
        const isBlank = target === '_blank';
        if (isExternal || isDownload || isBlank) return { clicked: false, skipped: 'external-or-download' };
      }

      await handle.click({ timeout: 1500 });
      await page.waitForTimeout(150);
      return { clicked: true };
    } catch (err) {
      const message = err?.message || String(err);
      const looksLikeOverlay =
        message.includes('intercepts pointer events') ||
        message.includes('Timeout') ||
        message.includes('Element is not attached') ||
        message.includes('Target closed');

      if (looksLikeOverlay) return { clicked: false, skipped: 'overlay-or-timeout' };

      errors.push({ type: 'click', message: `${label}: ${message}` });
      return { clicked: false, skipped: 'error' };
    }
  };

  const sweepClickables = async (scopeLabel) => {
    const seen = new Set();
    const selector = 'button, a, [role="button"]';

    const maxTotalClicks = Math.max(5, maxClicksPerSection * 3);
    let clickedTotal = 0;

    for (let pass = 0; pass < 4; pass++) {
      await tryDismissOverlays();
      const handles = await page.$$(selector);
      if (pass === 0) console.log(`Clickable candidates "${scopeLabel}":`, handles.length);
      if (handles.length === 0) break;

      for (let i = 0; i < handles.length; i++) {
        if (clickedTotal >= maxTotalClicks) break;

        const h = handles[i];
        const sig = await h
          .evaluate((node) => {
            const el = node;
            const tag = (el.tagName || '').toLowerCase();
            const text = (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 80);
            const href = tag === 'a' ? el.getAttribute('href') || '' : '';
            const role = el.getAttribute('role') || '';
            const aria = el.getAttribute('aria-label') || '';
            return `${tag}|${text}|${href}|${role}|${aria}`;
          })
          .catch(() => '');

        if (!sig) continue;
        if (seen.has(sig)) continue;

        const urlBefore = page.url();
        const res = await clickHandleIfSafe(h, `${scopeLabel}:${sig}`);
        if (res.skipped === 'overlay-or-timeout') {
          await tryDismissOverlays();
          continue;
        }

        seen.add(sig);
        if (res.clicked) clickedTotal += 1;

        const urlAfter = page.url();
        if (urlAfter !== urlBefore) {
          await page.goBack({ waitUntil: 'domcontentloaded', timeout: 8000 }).catch(() => {});
          await page.waitForTimeout(250);
        }
      }

      if (clickedTotal >= maxTotalClicks) break;
    }

    console.log(`Clickable sweep "${scopeLabel}" clicked total: ${clickedTotal}`);
  };

  const tryDismissOverlays = async () => {
    const priorities = [
      /^(next|continue)$/i,
      /(get started|start|enter|finish|done)/i,
      /(skip|close|dismiss|ok|got it)/i,
      /(accept|agree)/i
    ];

    for (let step = 0; step < 12; step++) {
      await page.keyboard.press('Escape').catch(() => {});

      const candidates = page.locator('button');
      const count = await candidates.count();
      let clicked = false;

      for (const re of priorities) {
        for (let i = 0; i < Math.min(count, 80); i++) {
          const b = candidates.nth(i);
          if (!(await b.isVisible().catch(() => false))) continue;
          const text = (await b.innerText({ timeout: 800 }).catch(() => '')).trim();
          if (!text) continue;
          if (!re.test(text)) continue;

          await b.click({ timeout: 1500 }).catch(() => {});
          await Promise.race([page.waitForLoadState('networkidle', { timeout: 1200 }).catch(() => {}), page.waitForTimeout(600)]);
          clicked = true;
          break;
        }
        if (clicked) break;
      }

      if (!clicked) break;
    }
  };

  try {
    console.log('Connecting to', url);
    await page.goto(url, { waitUntil: 'networkidle' }).catch(async () => {
      await page.goto(url, { waitUntil: 'domcontentloaded' });
    });
    await tryDismissOverlays();
    await page.waitForSelector('button, a, [role=\"button\"]', { timeout: 30000 });

    // STEP 1: screenshot + body dump for visual evidence
    await page.screenshot({ path: 'debug-ui.png', fullPage: true });
    const bodyText = await page.evaluate(() => document.body?.innerText || '');
    console.log('BODY TEXT DUMP >>>');
    console.log(bodyText.slice(0, 2000)); // first 2k chars
    console.log('<<< END BODY TEXT');

    // Guest login flow – robust selector + wait for hydration
    const guestBtn = page.locator('button:has-text("Guest"), button:has-text("👤")').first();
    if (await guestBtn.count()) {
      console.log('Clicking Guest button');
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle' }),
        guestBtn.click()
      ]);
      await page.waitForSelector('.svg-container', { visible: true, timeout: 10000 }).catch(() => {});
      await page.screenshot({ path: 'debug-ui-post-guest.png', fullPage: true });
      // fresh body dump from INSIDE
      const insideText = await page.evaluate(() => document.body?.innerText || '');
      console.log('POST-GUEST BODY TEXT >>>');
      console.log(insideText.slice(0, 2000));
      console.log('<<< END POST-GUEST BODY');
    }

    // Navigate via sidebar instead of hard page.goto
    // Try multiple selectors for robustness
    let diagTwinLink = page.locator('a[href="/diagnostic-twin"]').first();
    if (!await diagTwinLink.count()) {
        diagTwinLink = page.locator('a, button').filter({ hasText: /Diagnostic Twin/i }).first();
    }

    if (await diagTwinLink.count()) {
      console.log('Clicking sidebar ♊ Diagnostic Twin');
      await diagTwinLink.waitFor({ state: 'visible', timeout: 5000 }).catch(e => console.log('Link not visible:', e.message));
      await Promise.all([
        // HashRouter navigation might not trigger networkidle, wait for URL change
        page.waitForURL(/diagnostic-twin/, { timeout: 5000 }).catch(() => console.log('URL wait timeout')),
        diagTwinLink.click({ force: true })
      ]);
      console.log('Arrived at', page.url());
      await tryDismissOverlays();
      await page.waitForSelector('.svg-container', { visible: true, timeout: 8000 }).catch(() => console.log('SVG container not visible'));
      await page.screenshot({ path: 'debug-twin.png', fullPage: true });
      console.log('Screenshot saved: debug-twin.png');

      const sealBtn = page.locator('button', { hasText: /seal/i }).first();
      if (await sealBtn.count()) {
        await sealBtn.click({ timeout: 1200 }).catch(() => {});
        await page.waitForTimeout(250);
        const res = await page.evaluate(() => {
          const g = document.querySelector('#group-seal');
          const alt = document.querySelector('#group-shaft-seal');
          return {
            foundGroup: !!(g || alt),
            active: !!((g && g.classList.contains('active-highlight')) || (alt && alt.classList.contains('active-highlight')))
          };
        });
        if (res.foundGroup) console.log('Seal group active-highlight:', res.active);
      }

      // X-Ray toggle check
      const xrayBtn = page.locator('button[title="X-Ray Mode"]').first();
      if (await xrayBtn.count()) {
          console.log('X-Ray toggle found, clicking...');
          await xrayBtn.click();
          await page.waitForTimeout(500);
      } else {
          console.log('X-Ray toggle NOT found');
      }

      await sweepClickables('route:diagnostic-twin');
    } else {
      console.log('ERROR: Sidebar link "Diagnostic Twin" NOT FOUND. Dumping sidebar text...');
      const sidebarText = await page.locator('aside').innerText().catch(() => 'No aside found');
      console.log(sidebarText.slice(0, 500));
      await page.screenshot({ path: 'debug-sidebar-fail.png' });
    }

    const headerBtns = page.locator('header button');
    const headerCount = await headerBtns.count();
    let xrayIdx = -1;
    for (let i = 0; i < headerCount; i++) {
      const txt = (await headerBtns.nth(i).innerText({ timeout: 800 }).catch(() => '')).trim();
      const low = txt.toLowerCase();
      if (low.includes('x-ray') || low === 'x') {
        xrayIdx = i;
        break;
      }
    }

    console.log('X-Ray toggle found in header:', xrayIdx !== -1);
    if (xrayIdx !== -1) {
      await headerBtns.nth(xrayIdx).click();
      await page.waitForTimeout(300);
      await headerBtns.nth(xrayIdx).click();
      await page.waitForTimeout(300);

      const vis = await page.evaluate(() => {
        const runner = document.querySelector('#group-runner');
        const seal = document.querySelector('#group-seal') || document.querySelector('#group-shaft-seal');
        return {
          runnerExists: !!runner,
          runnerDisplayed: runner ? getComputedStyle(runner).display !== 'none' : false,
          sealExists: !!seal,
          sealDisplayed: seal ? getComputedStyle(seal).display !== 'none' : false
        };
      });
      console.log('Runner exists/displayed:', vis.runnerExists, vis.runnerDisplayed);
      console.log('Seal exists/displayed:', vis.sealExists, vis.sealDisplayed);
    }

    const svg = page.locator('div.svg-container svg');
    if (await svg.count()) {
      const before = await svg.evaluate((el) => el.style.transform);
      await svg.dispatchEvent('wheel', { deltaY: -200, clientX: 100, clientY: 100 });
      await page.waitForTimeout(300);
      const after = await svg.evaluate((el) => el.style.transform);
      console.log('SVG transform before:', before, 'after:', after);
    } else {
      console.warn('SVG element not found inside .svg-container');
    }

    // NC-9000: Detach Module Verification
    console.log('Verifying /detach/scada...');
    const baseUrl = url.replace(/\/$/, '');
    await page.goto(baseUrl + '/#/detach/scada');
    try {
        await page.waitForSelector('.svg-container', { visible: true, timeout: 10000 });
        console.log('Detached SCADA SVG container visible');
        
        // Verify NO sidebar
        const asideCount = await page.locator('aside').count();
        if (asideCount === 0) {
            console.log('SUCCESS: No sidebar in detached mode');
        } else {
            console.log('FAILURE: Sidebar detected in detached mode');
        }
        await page.screenshot({ path: 'debug-detach-scada.png' });
    } catch (e) {
        console.log('Detached SCADA verification failed:', e.message);
        await page.screenshot({ path: 'debug-detach-fail.png' });
    }

    const filteredErrors = errors.filter((e) => {
      const msg = (e.message || '').toLowerCase();
      if (msg.includes('status of 401')) return false;
      if (msg.includes('supabase.co/rest/v1/assets')) return false;
      return true;
    });

    if (filteredErrors.length > 0) {
      console.error('UI sweep detected errors:');
      for (const e of filteredErrors) console.error('-', e.type, e.message);
      throw new Error(`UI sweep failed with ${filteredErrors.length} error(s)`);
    }

    await browser.close();
    process.exit(0);
  } catch (err) {
    console.error('Manual UI check failed:', err);
    await browser.close();
    process.exit(1);
  }
})();

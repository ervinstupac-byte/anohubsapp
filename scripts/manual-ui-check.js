import puppeteer from 'puppeteer';

const url = process.env.TEST_URL || 'http://localhost:3001/';

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  page.setDefaultTimeout(20000);

  try {
    console.log('Connecting to', url);
    await page.goto(url, { waitUntil: 'networkidle2' });

    // wait for aside to appear
    await page.waitForSelector('aside', { timeout: 15000 });

    // count nav buttons in aside
    const buttons = await page.$$('aside nav button');
    console.log('Found aside nav buttons count:', buttons.length);

    // click SHAFT SEAL (look for button containing 'seal')
    let sealBtn = null;
    for (const b of buttons) {
      const txt = (await (await b.getProperty('textContent')).jsonValue()) || '';
      if (txt.toLowerCase().includes('seal')) { sealBtn = b; break; }
    }

    if (!sealBtn) console.warn('Seal button not found in aside nav');
    else {
      await sealBtn.click();
      await page.waitForTimeout(400);
      const res = await page.evaluate(() => {
        const g = document.querySelector('#group-seal');
        const alt = document.querySelector('#group-shaft-seal');
        return {
          foundGroup: !!(g || alt),
          active: !!((g && g.classList.contains('active-highlight')) || (alt && alt.classList.contains('active-highlight')))
        };
      });
      console.log('Seal group found:', res.foundGroup, 'active-highlight:', res.active);
    }

    // find X-Ray toggle button by text
    const headerBtns = await page.$$('header button');
    let xrayBtn = null;
    for (const b of headerBtns) {
      const txt = (await (await b.getProperty('textContent')).jsonValue()) || '';
      if (txt.toLowerCase().includes('x') || txt.toLowerCase().includes('x-ray')) { xrayBtn = b; break; }
    }

    console.log('X-Ray toggle found in header:', !!xrayBtn);
    if (xrayBtn) {
      // ensure runner/seal hidden when off, shown when on
      // first ensure it's off (click to toggle state twice is safe)
      await xrayBtn.click();
      await page.waitForTimeout(300);
      await xrayBtn.click();
      await page.waitForTimeout(300);

      // check runner and seal visibility
      const vis = await page.evaluate(() => {
        const runner = document.querySelector('#group-runner');
        const seal = document.querySelector('#group-seal') || document.querySelector('#group-shaft-seal');
        return {
          runnerExists: !!runner,
          runnerDisplayed: runner ? (getComputedStyle(runner).display !== 'none') : false,
          sealExists: !!seal,
          sealDisplayed: seal ? (getComputedStyle(seal).display !== 'none') : false,
        };
      });
      console.log('Runner exists/displayed:', vis.runnerExists, vis.runnerDisplayed);
      console.log('Seal exists/displayed:', vis.sealExists, vis.sealDisplayed);
    }

    // Test mousewheel zoom by dispatching wheel and checking transform on svg
    const svgSel = await page.$('div.svg-container svg');
    if (!svgSel) {
      console.warn('SVG element not found inside .svg-container');
    } else {
      const before = await page.evaluate(el => el.style.transform, svgSel);
      await page.evaluate(el => {
        const ev = new WheelEvent('wheel', { deltaY: -200, clientX: 100, clientY: 100, bubbles: true });
        el.dispatchEvent(ev);
      }, svgSel);
      await page.waitForTimeout(300);
      const after = await page.evaluate(el => el.style.transform, svgSel);
      console.log('SVG transform before:', before, 'after:', after);
    }

    await browser.close();
    process.exit(0);
  } catch (err) {
    console.error('Manual UI check failed:', err);
    await browser.close();
    process.exit(1);
  }
})();

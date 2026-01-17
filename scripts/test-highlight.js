import puppeteer from 'puppeteer';

(async () => {
  const url = 'http://localhost:3003/';
  const browser = await puppeteer.launch({ args: ['--no-sandbox','--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  page.setDefaultTimeout(20000);

  try {
    console.log('Loading app:', url);
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Wait for the surgical index buttons to render
    await page.waitForSelector('aside nav button', { timeout: 15000 });

    // Find the button that contains 'Shaft Seal' (label for id 'seal')
    const buttons = await page.$$('aside nav button');
    let targetBtn = null;
    for (const b of buttons) {
      const txt = await (await b.getProperty('textContent')).jsonValue();
      if (txt && txt.toLowerCase().includes('shaft seal')) { targetBtn = b; break; }
    }

    if (!targetBtn) {
      console.error('Could not find Shaft Seal button in the Surgical Index.');
      await browser.close();
      process.exit(2);
    }

    console.log('Clicking Shaft Seal button...');
    await targetBtn.click();

    // Wait a moment for React to update DOM
    await page.waitForTimeout(500);

    // Evaluate whether #group-seal has class 'active-highlight'
    const result = await page.evaluate(() => {
      const g = document.querySelector('#group-seal');
      if (!g) return { found: false };
      return { found: true, active: g.classList.contains('active-highlight') };
    });

    console.log('SVG group present:', result.found);
    console.log('Group has active-highlight:', result.active);

    await browser.close();
    process.exit(result.found && result.active ? 0 : 3);
  } catch (err) {
    console.error('Test error:', err);
    await browser.close();
    process.exit(1);
  }
})();

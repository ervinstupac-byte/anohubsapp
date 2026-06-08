import puppeteer from 'puppeteer';
import fs from 'fs';

(async () => {
  const url = process.env.URL || 'http://localhost:3000/';
  const out = process.env.OUT || 'a11y-report.json';

  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox','--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(60000);
  await page.goto(url, { waitUntil: 'networkidle0' });

  // Inject axe from CDN
  await page.addScriptTag({ url: 'https://unpkg.com/axe-core@4.8.0/axe.min.js' });

  // Run axe on the Pelton panel area (or whole document)
  const results = await page.evaluate(async () => {
    const root = document.querySelector('body');
    return await axe.run(root, {
      runOnly: {
        type: 'tag',
        values: ['wcag2aa', 'wcag21aa']
      }
    });
  });

  fs.writeFileSync(out, JSON.stringify(results, null, 2));
  console.log('Axe results written to', out);
  await browser.close();
})();

import puppeteer from 'puppeteer';

// Default to the Vite dev server port used earlier (3001)
const url = process.env.TEST_URL || 'http://localhost:3001/';
const ASSETS = [
  { id: 'electrical-cubicles', label: 'Electrical Cubicles' },
  { id: 'hpu', label: 'HPU System' },
  { id: 'lubrication', label: 'Lubrication' },
  { id: 'penstock', label: 'Penstock' },
  { id: 'manhole', label: 'Manhole' },
  { id: 'bypass', label: 'Bypass Valve' },
  { id: 'miv', label: 'Main Inlet Valve' },
  { id: 'draft-tube', label: 'Draft Tube' },
  { id: 'dft-manhole', label: 'Draft Tube Manhole' },
  { id: 'seal', label: 'Shaft Seal' },
  { id: 'spiral-case', label: 'Spiral Case' },
  { id: 'spiral-manhole', label: 'Spiral Manhole' },
  { id: 'relief-pipes', label: 'Relief Pipes' },
  { id: 'runner', label: 'Francis Runner' },
  { id: 'generator', label: 'Generator' },
];

async function waitForServer(page, attempts = 12) {
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await page.goto(url, { waitUntil: 'networkidle2', timeout: 5000 });
      if (res && res.ok()) return true;
    } catch (e) {
      // retry
    }
    await new Promise(r => setTimeout(r, 1000));
  }
  return false;
}

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();

  try {
    console.log('Connecting to', url);
    const up = await waitForServer(page, 20);
    if (!up) {
      console.error('Server not reachable at', url);
      await browser.close();
      process.exit(2);
    }

    console.log('Connected — running marker checks');

    await page.waitForSelector('aside nav button', { timeout: 10000 });
    const buttons = await page.$$('aside nav button');

    const results = [];

    for (const a of ASSETS) {
      // find button by label text
      let btn = null;
      for (const b of buttons) {
        const txt = (await (await b.getProperty('textContent')).jsonValue()) || '';
        if (txt.toLowerCase().includes(a.label.toLowerCase())) { btn = b; break; }
      }

      if (!btn) {
        console.warn('Button not found for', a.id, a.label);
        results.push({ id: a.id, foundButton: false, foundGroup: false, active: false });
        continue;
      }

      await btn.click();
      await page.waitForTimeout(300);

      const res = await page.evaluate((id) => {
        const g = document.querySelector('#group-' + id);
        return { foundGroup: !!g, active: !!(g && g.classList.contains('active-highlight')) };
      }, a.id);

      console.log(a.id, '-> group found:', res.foundGroup, 'active:', res.active);
      results.push({ id: a.id, foundButton: true, foundGroup: res.foundGroup, active: res.active });
    }

    const failed = results.filter(r => !r.foundGroup || !r.active);
    if (failed.length === 0) {
      console.log('All markers present and reacting.');
      await browser.close();
      process.exit(0);
    } else {
      console.error('Failures:', failed);
      await browser.close();
      process.exit(3);
    }
  } catch (err) {
    console.error('Test error:', err);
    await browser.close();
    process.exit(1);
  }
})();

#!/usr/bin/env node
const puppeteer = require('puppeteer-core');

(async () => {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const logs = [];

  page.on('console', msg => logs.push({type: 'console', text: msg.text(), location: msg.location()}));
  page.on('pageerror', err => logs.push({type: 'pageerror', text: err.message}));
  page.on('requestfailed', req => logs.push({type: 'requestfailed', url: req.url(), failure: req.failure().errorText}));

  const target = 'https://anohubs.com/app-iframe.html';
  console.log('Loading', target);
  await page.goto(target, {waitUntil: 'networkidle2', timeout: 30000});

  // Wait a bit for iframe contents to load and run
  await page.waitForTimeout(3000);

  // Collect frame console logs as well
  const frames = page.frames();
  for (const f of frames) {
    try {
      const url = f.url();
      logs.push({type: 'frame', url});
    } catch (e) {}
  }

  console.log('Captured logs:');
  for (const l of logs) console.log(JSON.stringify(l));

  await browser.close();
})();

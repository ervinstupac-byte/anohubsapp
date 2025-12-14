#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

(async () => {
  const outDir = path.resolve(__dirname, '../artifacts');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outBase = process.argv[2] || 'iframe';
  const logPath = path.join(outDir, `${outBase}-network-log.json`);
  const consolePath = path.join(outDir, `${outBase}-console.txt`);
  const screenshotPath = path.join(outDir, `${outBase}-screenshot.png`);

  const target = process.argv[3] || 'https://anohubs.com/app-iframe.html';
  console.log('Launching Chrome (headful) and loading', target);

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const records = { requests: [], responses: [], failed: [], frames: [], console: [] };

  page.on('request', req => {
    const info = {
      id: req._requestId || null,
      url: req.url(),
      method: req.method(),
      resourceType: req.resourceType(),
      headers: req.headers(),
      timestamp: Date.now()
    };
    records.requests.push(info);
    // capture early for supabase filtering
    if (info.url.includes('supabase.co')) console.log('REQ', info.method, info.url);
  });

  page.on('response', async res => {
    try {
      const req = res.request();
      const info = {
        url: res.url(),
        status: res.status(),
        headers: res.headers(),
        request: { url: req.url(), method: req.method(), headers: req.headers() },
        timestamp: Date.now()
      };
      records.responses.push(info);
      if (res.url().includes('supabase.co')) console.log('RESP', info.status, res.url());
    } catch (e) {
      console.error('response handler error', e && e.message);
    }
  });

  page.on('requestfailed', req => {
    const err = req.failure && req.failure().errorText;
    const info = {
      url: req.url(),
      method: req.method(),
      headers: req.headers(),
      resourceType: req.resourceType(),
      timestamp: Date.now(),
      errorText: err
    };
    records.failed.push(info);
    console.warn('REQ_FAILED', info.errorText, info.url);
  });

  page.on('console', msg => {
    const text = msg.text();
    const entry = { type: msg.type(), text, timestamp: Date.now() };
    records.console.push(entry);
    fs.appendFileSync(consolePath, `[${new Date().toISOString()}] ${msg.type()}: ${text}\n`);
  });

  // load the page and wait longer for network activity
  await page.goto(target, { waitUntil: 'networkidle2', timeout: 60000 }).catch(e => console.warn('goto err', e && e.message));
  await page.waitForTimeout(5000);

  // enumerate frames
  const frames = page.frames();
  records.frames = frames.map(f => ({ url: f.url(), name: f.name() }));
  console.log('Frames found:', records.frames.map(f => f.url));

  // if app frame exists, try a simple in-frame fetch to a supabase resource
  const appFrame = frames.find(f => f.url().includes('ervinstupac-byte.github.io'));
  if (appFrame) {
    console.log('Found app frame; performing in-frame fetch for diagnostic');
    try {
      const res = await appFrame.evaluate(async () => {
        const url = 'https://nehxtecejxklqknscbgf.supabase.co/rest/v1/risk_assessments?select=*';
        try {
          const r = await fetch(url, { method: 'GET' });
          const txt = await r.text();
          return { status: r.status, length: txt.length };
        } catch (e) {
          return { error: e.message };
        }
      });
      records.inFrameFetch = res;
      console.log('IN_FRAME_FETCH', res);
    } catch (e) {
      console.error('appFrame evaluate failed', e && e.message);
    }
  } else {
    console.warn('App frame not found; skipping in-frame fetch');
  }

  await page.screenshot({ path: screenshotPath, fullPage: true }).catch(() => {});

  fs.writeFileSync(logPath, JSON.stringify(records, null, 2));
  console.log('Saved network log to', logPath);
  console.log('Saved console to', consolePath);
  console.log('Saved screenshot to', screenshotPath);

  // keep the browser open a couple more seconds so you can inspect manually
  console.log('Waiting 8s before closing browser so you can inspect manually...');
  await page.waitForTimeout(8000);
  await browser.close();
  console.log('Done.');
})();

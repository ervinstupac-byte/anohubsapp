#!/usr/bin/env node
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

async function run() {
  const root = path.resolve(__dirname, '..');
  const hashesPath = path.join(root, 'scripts', 'hashes_applied.json');
  let mapping = {};
  try { mapping = JSON.parse(fs.readFileSync(hashesPath,'utf8')); } catch(e) { console.warn('Could not read hashes_applied.json, proceeding with random sample from mapping fallback'); }

  // pick a sample path
  const keys = Object.keys(mapping || {});
  const sampleEntry = keys.length ? keys[Math.floor(Math.random()*keys.length)] : null;
  // sampleEntry is stored as path like "public/archive/....html" in mapping; convert to archive path
  const samplePath = sampleEntry ? (`/archive/${sampleEntry.split('/').slice(-2).join('/')}`) : null;

  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox','--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(60000);

  const results = { uiVerified: false, dossierLoadOk: false, crlfHashMatch: false, details: {} };

  try {
    // 1) Load site root so SPA routing works (server may not serve deep links)
    const rootUrl = 'https://anohubs.com/';
    const respRoot = await page.goto(rootUrl, { waitUntil: 'networkidle2' });
    results.details.rootStatus = respRoot ? respRoot.status() : null;

    // small delay to allow client JS to hydrate
    await new Promise(r => setTimeout(r, 2000));

    // Try to find and click an internal link to the health monitor (client-side navigation)
    const clicked = await page.evaluate(() => {
      const anchors = Array.from(document.querySelectorAll('a')) || [];
      const link = anchors.find(a => (a.getAttribute && a.getAttribute('href') && a.getAttribute('href').includes('knowledge/health-monitor')) || /Health Monitor/i.test(a.innerText) || /System Health/i.test(a.innerText));
      if (link) {
        try { link.click(); } catch(e) { /* ignore */ }
        return true;
      }
      return false;
    });
    if (clicked) await new Promise(r => setTimeout(r, 2000));

    // 2) Check for "854 / 854 VERIFIED" or similar (accept VALIDATED)
    const bodyText = await page.evaluate(() => document.body.innerText || '');
    const uiMatch = /854\s*\/\s*854\s*(VERIFIED|VALIDATED)/i.test(bodyText);
    results.uiVerified = uiMatch;
    results.details.bodySnippet = bodyText.slice(0, 1200);

    // 3) Dossier interactivity: navigate directly to a sample dossier path
    if (samplePath) {
      const dossierUrl = `https://anohubs.com${samplePath}`;
      const r2 = await page.goto(dossierUrl, { waitUntil: 'networkidle2' });
      results.details.sampleDossier = { url: dossierUrl, status: r2 ? r2.status() : 'no-response' };

      if (r2 && r2.status() >= 200 && r2.status() < 400) {
        results.dossierLoadOk = true;
        const html = await page.content();

        // Extract embedded hash
        const m = html.match(/SHA-256:\s*([A-Fa-f0-9]{40,64})/);
        const embedded = m ? m[1].toUpperCase() : null;

        // Compute SHA-256 with CRLF normalization and stripping token
        let contentForHash = html.replace(/SHA-256:\s*[A-Fa-f0-9]{40,64}/g, 'SHA-256: ');
        contentForHash = contentForHash.replace(/\r?\n/g, '\r\n');
        const computed = crypto.createHash('sha256').update(contentForHash, 'utf8').digest('hex').toUpperCase();

        results.details.embedded = embedded;
        results.details.computed = computed;
        results.crlfHashMatch = embedded && embedded === computed;
      }
    } else {
      results.details.sampleDossier = 'no-sample-available';
    }

  } catch (err) {
    results.error = String(err.stack || err);
  } finally {
    await browser.close();
  }

  console.log(JSON.stringify(results, null, 2));
  // exit code: success if all three checks passed
  const ok = results.uiVerified && results.dossierLoadOk && results.crlfHashMatch;
  process.exit(ok ? 0 : 2);
}

run();

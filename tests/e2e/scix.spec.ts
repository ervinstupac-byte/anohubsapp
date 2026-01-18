import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// This test loads the local file via file:// URL and captures a snapshot
// of the Engineering Justification region where the scix injection exists.

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dossierPath = path.join(
  __dirname,
  '..',
  '..',
  'public',
  'archive',
  'turbine_friend',
  'francis_h',
  'francis_sop_generator',
  'index.html'
);

const selector = '.scix-inject';

test('scix injection visual snapshot', async ({ page }) => {
  const fileUrl = 'file://' + dossierPath.replace(/\\/g, '/');
  await page.goto(fileUrl);
  await page.waitForSelector(selector, { timeout: 5000 });
  const el = await page.locator(selector).first();
  const screenshot = await el.screenshot();
  // Save artifact to test-results for inspection
  const outDir = path.join(__dirname, '..', 'test-results');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'engineering-justification.png'), screenshot);
  // Basic sanity: ensure the injected container exists
  const injected = await page.locator('.scix-inject').count();
  expect(injected).toBeGreaterThan(0);
});

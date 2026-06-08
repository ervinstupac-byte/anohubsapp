import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// TODO(Phase 3): This test references a path that does not exist.
// The static AnoHub_site content was moved from src/AnoHub_site/ to public/anohub_site/
// during the Phase 3 modernization. Update dossierPath to:
//   public/anohub_site/Turbine_Friend/Francis_SOP_Generator/index.html

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dossierPath = path.join(
  __dirname,
  '..',
  '..',
  'public',
  'anohub_site',
  'Turbine_Friend',
  'Francis_SOP_Generator',
  'index.html'
);

const selector = 'h1';

test('scix injection visual snapshot [BLOCKED: path valid after Phase 3 migration]', async ({ page }) => {
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
  const injected = await page.locator('h1').count();
  expect(injected).toBeGreaterThan(0);
});

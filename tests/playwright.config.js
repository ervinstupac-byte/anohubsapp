// Playwright config for a single visual regression test (ESM)
/** @type {import('@playwright/test').PlaywrightTestConfig} */
export default {
  testDir: './e2e',
  timeout: 30 * 1000,
  use: {
    headless: true,
    viewport: { width: 1200, height: 800 },
  },
};

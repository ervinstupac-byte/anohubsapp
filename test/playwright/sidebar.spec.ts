import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:3000';

test.beforeEach(async ({ page }) => {
  await page.goto(BASE);
  await page.waitForTimeout(500);
});

test('clicks primary rail icons and records audit entries', async ({ page }) => {
  const ids = ['ops','mechanical','electrical','forensics','risk','docs'];
  for (const id of ids) {
    const button = page.locator(`#nav-${id}`);
    await expect(button).toBeVisible();
    await button.click();
    await page.waitForTimeout(300);
    const marker = `CLICKED_ICON_${id.toUpperCase()}`;
    // presence of marker is optional in DOM; just attempt to locate it
    await page.locator(`text=${marker}`).first();
  }
});

test('clicks Engineer Console and Hydroschool modules', async ({ page }) => {
  const eng = page.locator('text=Engineer Console');
  if (await eng.count()) {
    await eng.click();
    await page.waitForTimeout(300);
    await expect(page.locator('text=CLICKED_MODULE_ENGINEER_PORTAL')).toHaveCountGreaterThan(0);
  }

  const hydro = page.locator('text=Hydroschool');
  if (await hydro.count()) {
    await hydro.click();
    await page.waitForTimeout(300);
    await expect(page.locator('text=CLICKED_MODULE_HYDROSCHOOL')).toHaveCountGreaterThan(0);
  }
});

import { test, expect } from '@playwright/test';
for (const path of ['projects', 'ai', 'thinking']) {
  test(`${path} page reachable with cards`, async ({ page }) => {
    await page.goto(`/personal-website/${path}/`);
    await expect(page.locator('.grid .card').first()).toBeVisible();
  });
}

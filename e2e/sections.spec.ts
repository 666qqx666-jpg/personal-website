import { test, expect } from '@playwright/test';
for (const path of ['projects', 'ai', 'thinking']) {
  test(`${path} page reachable with cards`, async ({ page }) => {
    await page.goto(`/${path}/`);
    await expect(page.locator('.grid .card').first()).toBeVisible();
  });
}

test('project index replaces only sales lead and parking covers', async ({ page }) => {
  await page.goto('/projects/'); const cards = page.locator('.grid a.card');
  await expect(cards).toHaveCount(5); await expect(cards.locator('[data-card-media]')).toHaveCount(2);
  await expect(cards.nth(0).locator('img')).toHaveAttribute('alt', /销售线索管理界面/); await expect(cards.nth(1).locator('[data-system-preview="parking-layers"]')).toHaveAttribute('aria-label', /停车服务|停车场/);
  await expect(cards.nth(2).locator('img')).toHaveCount(0); await expect(cards.nth(3).locator('img')).toHaveCount(0); await expect(cards.nth(4).locator('img')).toHaveCount(0);
});

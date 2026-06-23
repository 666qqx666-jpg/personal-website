import { test, expect } from '@playwright/test';
test('about page has HR essentials', async ({ page }) => {
  await page.goto('/personal-website/about/');
  await expect(page.getByText('求职意向')).toBeVisible();
  await expect(page.locator('.timeline')).toBeVisible();
  await expect(page.locator('.skills')).toBeVisible();
  await expect(page.locator('.cta a[download]')).toHaveCount(1);
});

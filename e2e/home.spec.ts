import { test, expect } from '@playwright/test';

test('home renders banner, intent, three section cards', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.banner h1')).toBeVisible();
  await expect(page.getByText('求职意向')).toBeVisible();
  await expect(page.locator('.grid a.card')).toHaveCount(3);
});

test('theme toggle switches and persists', async ({ page }) => {
  await page.goto('/');
  const html = page.locator('html');
  const before = await html.getAttribute('data-theme');
  await page.locator('#theme-toggle').click();
  const after = await html.getAttribute('data-theme');
  expect(after).not.toBe(before);
  expect(await page.evaluate(() => localStorage.getItem('theme'))).toBe(after);
});

test('mobile navigation keeps the about page reachable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  const aboutLink = page.getByRole('link', { name: '关于', exact: true });
  await expect(aboutLink).toBeVisible();
  await aboutLink.click();
  await expect(page).toHaveURL(/\/about\/$/);
  await expect(page.getByRole('heading', { name: '钱麒祥', exact: true })).toBeVisible();
});

import { test, expect } from '@playwright/test';

const deckRoutes = [
  '/ai/claude-code-architecture/',
  '/ai/knowledge-harness/',
  '/ai/zhi-shen-ding-nei/',
  '/ai/skill-desk/competitive-analysis/',
  '/ai/skill-desk/memory-loader/',
  '/ai/skill-desk/prd-skill/',
  '/ai/skill-desk/quotation/',
  '/ai/skill-desk/reading-dialogue/',
  '/ai/skill-desk/requirement-discovery/',
  '/ai/skill-desk/weekly-retro/',
  '/projects/sales-lead-slm/',
  '/projects/enterprise-permissions/',
  '/projects/group-business-analytics/',
  '/projects/smart-parking/',
  '/projects/membership-operations/',
];

test('DeckLayout pages follow the shared light theme state by default', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('theme', 'light'));

  for (const route of deckRoutes) {
    await page.goto(route);
    await expect(page.locator('html')).toHaveAttribute('data-deck-theme', 'site');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await expect(page.locator('#deck-theme-toggle')).toBeVisible();
    const bodyBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(bodyBg).toBe('rgb(247, 249, 253)');
  }
});

test('DeckLayout theme toggle persists to the global theme state', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('theme', 'light'));
  await page.goto('/ai/claude-code-architecture/');

  await page.locator('#deck-theme-toggle').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('#deck-theme-toggle')).toContainText('☀️');
  const storedTheme = await page.evaluate(() => localStorage.getItem('theme'));
  expect(storedTheme).toBe('dark');
});

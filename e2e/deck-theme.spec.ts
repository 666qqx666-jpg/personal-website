import { test, expect } from '@playwright/test';

const deckRoutes = [
  '/personal-website/ai/claude-code-architecture/',
  '/personal-website/ai/knowledge-harness/',
  '/personal-website/ai/zhi-shen-ding-nei/',
  '/personal-website/ai/skill-desk/competitive-analysis/',
  '/personal-website/ai/skill-desk/memory-loader/',
  '/personal-website/ai/skill-desk/prd-skill/',
  '/personal-website/ai/skill-desk/quotation/',
  '/personal-website/ai/skill-desk/reading-dialogue/',
  '/personal-website/ai/skill-desk/requirement-discovery/',
  '/personal-website/ai/skill-desk/weekly-retro/',
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
  await page.goto('/personal-website/ai/claude-code-architecture/');

  await page.locator('#deck-theme-toggle').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('#deck-theme-toggle')).toContainText('☀️');
  const storedTheme = await page.evaluate(() => localStorage.getItem('theme'));
  expect(storedTheme).toBe('dark');
});

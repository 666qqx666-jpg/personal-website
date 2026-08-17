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

test('home adds selected work without replacing the original section navigation', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 }); await page.goto('/');
  await expect(page.locator('[data-selected-work]')).toBeVisible(); await expect(page.locator('[data-work-preview]')).toHaveCount(4);
  await expect(page.locator('.grid a.card')).toHaveCount(3);
  const knowledgeColumns = await page.locator('[data-knowledge-preview]').evaluate((node) => getComputedStyle(node).gridTemplateColumns.split(' ').length);
  expect(knowledgeColumns).toBe(1);
  const heroHeight = await page.locator('.banner').evaluate((node) => node.getBoundingClientRect().height);
  expect(heroHeight).toBeGreaterThanOrEqual(560); expect(heroHeight).toBeLessThan(900);
});

test('selected work keeps AI systems first on mobile and loads reviewed visuals', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 }); await page.goto('/'); const previews = page.locator('[data-work-preview]');
  await expect(previews).toHaveCount(4); await expect(previews.nth(0)).toContainText('Enterprise Knowledge Harness'); await expect(previews.nth(1)).toContainText('Enterprise Product Delivery Agent Harness');
  await expect(previews.nth(0).locator('[data-knowledge-preview]')).toBeVisible(); await expect(previews.nth(1).locator('img')).toHaveAttribute('alt', /PRD 审查记录/); await expect(previews.nth(3).locator('[data-system-preview="parking-layers"]')).toBeVisible();
  expect(await previews.nth(0).innerText()).not.toMatch(/V1\.5|V2|16\/20|18\/20/); expect(await previews.locator('img').evaluateAll((images) => images.every((image) => { const img = image as HTMLImageElement; return img.complete && img.naturalWidth > 0; }))).toBe(true);
  const columns = await page.locator('.business-pair').evaluate((node) => getComputedStyle(node).gridTemplateColumns.split(' ').length);
  const deskColumns = await previews.nth(1).evaluate((node) => getComputedStyle(node).gridTemplateColumns.split(' ').length);
  const sales = await previews.nth(2).boundingBox(); const parking = await previews.nth(3).boundingBox();
  expect(columns).toBe(1); expect(deskColumns).toBe(1); expect(sales?.width).toBeGreaterThan(320); expect(parking?.y).toBeGreaterThan((sales?.y ?? 0) + (sales?.height ?? 0) - 1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(await page.evaluate(() => document.documentElement.clientWidth));
});

test('selected work turns the Desk card into a compact tablet row', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto('/');

  const knowledge = page.locator('[data-work-id="knowledge-harness"]');
  const desk = page.locator('[data-work-id="delivery-harness"]');
  const [knowledgeBox, deskBox] = await Promise.all([knowledge.boundingBox(), desk.boundingBox()]);

  expect(deskBox?.y).toBeGreaterThan((knowledgeBox?.y ?? 0) + (knowledgeBox?.height ?? 0) - 1);
  expect(await desk.evaluate((node) => getComputedStyle(node).gridTemplateColumns.split(' ').length)).toBe(2);
  expect(deskBox?.height).toBeLessThan(460);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    await page.evaluate(() => document.documentElement.clientWidth)
  );
});

import { test, expect } from '@playwright/test';

test('AI listing links to Zhi Shen Ding Nei responsibility flow deck', async ({ page }) => {
  await page.goto('/personal-website/ai/');
  const card = page.locator('.card', { hasText: '置身钉内：责任流阅读笔记' });
  await expect(card).toBeVisible();
  await expect(card).toContainText('企业 AI');
  await expect(card).toContainText('To B 产品');
  await expect(card).toHaveAttribute('href', '/personal-website/ai/zhi-shen-ding-nei/');
});

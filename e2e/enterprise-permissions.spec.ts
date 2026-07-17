import { test, expect } from '@playwright/test';

const route = '/projects/enterprise-permissions/';

test('projects listing exposes the enterprise permissions case', async ({ page }) => {
  await page.goto('/projects/');
  const card = page.locator('.card', { hasText: '多业务线企业权限体系' });

  await expect(card).toBeVisible();
  await expect(card).toContainText('共享同一套业务底座');
  await expect(card).toContainText('权限模型');
  await expect(card).toHaveAttribute('href', route);
});

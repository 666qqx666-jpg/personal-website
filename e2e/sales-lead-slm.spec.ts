import { test, expect } from '@playwright/test';

const route = '/projects/sales-lead-slm/';

test('projects listing exposes the sales lead flagship case', async ({ page }) => {
  await page.goto('/projects/');
  const card = page.locator('.card', { hasText: '全域销售线索管理系统' });

  await expect(card).toBeVisible();
  await expect(card).toContainText('让线索真正到达合适的门店');
  await expect(card).toContainText('责任链重构');
  await expect(card).toHaveAttribute('href', route);
});

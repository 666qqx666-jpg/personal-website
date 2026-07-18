import { test, expect } from '@playwright/test';

const route = '/projects/group-business-analytics/';

test('projects listing exposes the group business analytics case as the third card', async ({ page }) => {
  await page.goto('/projects/');
  const cards = page.locator('.card');
  await expect(cards).toHaveCount(3);
  await expect(cards.nth(0)).toContainText('全域销售线索管理系统');
  await expect(cards.nth(1)).toContainText('多业务线企业权限体系');

  const card = cards.nth(2);
  await expect(card).toContainText('集团经营数据分析体系');
  await expect(card).toContainText('集团考核需求');
  await expect(card).toContainText('指标建模');
  await expect(card).toHaveAttribute('href', route);
});

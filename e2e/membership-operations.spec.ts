import { readFile } from 'node:fs/promises';
import { test, expect } from '@playwright/test';

const route = '/projects/membership-operations/';

test('opening explains why membership is the CRM relationship spine', async ({ page }) => {
  await page.goto(route);

  await expect(page.getByRole('heading', { name: '把分散的平台访客，变成可持续经营的会员关系' })).toBeVisible();
  await expect(page.locator('#s2')).toContainText('CRM 管理的不是一次访问');
  for (const asset of ['会员卡', '积分', '卡券', '消费', '等级', '互动关系']) {
    await expect(page.locator('#s2')).toContainText(asset);
  }
  await expect(page.locator('#s2 [data-member-asset]')).toHaveCount(6);
});

test('background connects channel expansion to fragmented member identity', async ({ page }) => {
  await page.goto(route);
  const scene = page.locator('#s3');

  for (const platform of ['微信', '支付宝', '抖音', '小红书', '快手', '线下二维码']) {
    await expect(scene).toContainText(platform);
  }
  await expect(scene).toContainText('同一顾客会以多个平台访客身份进入系统');
  await expect(scene.locator('[data-platform-entry]')).toHaveCount(6);

  const body = await page.locator('body').innerText();
  expect(body).not.toContain('跨客户识别同一自然人');
  expect(body).not.toContain('876 万独立用户');
});

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

test('identity chapter preserves inherited model and asset boundaries', async ({ page }) => {
  await page.goto(route);

  const foundation = page.locator('#s4');
  await expect(foundation).toContainText('原始微信 / 支付宝模型由其他产品经理规划');
  for (const entity of ['MCU', 'ECU', 'XCU']) {
    await expect(foundation.locator(`[data-identity-entity="${entity.toLowerCase()}"]`)).toHaveCount(1);
  }
  await expect(foundation.locator('[data-contribution-boundary]')).toContainText('多平台接入、券主 MCU、会员触达、渠道归因和异常治理');
  await expect(foundation.locator('[data-contribution-boundary]')).toContainText('研发团队负责工程实现');

  const rebind = page.locator('#s5');
  await expect(rebind.locator('[data-rebind="xcu"]')).toContainText('当前平台身份迁移');
  await expect(rebind.locator('[data-assets="preserved"]')).toContainText('积分、卡券、消费和等级保持不动');
  await expect(rebind).toContainText('重绑定不等于会员资产合并');

  const body = await page.locator('body').innerText();
  expect(body).not.toContain('原始身份模型由我从零设计');
  expect(body).not.toContain('自动识别同一自然人');
});

test('voucher-owner MCU keeps transactions running and exposes the debt', async ({ page }) => {
  await page.goto(route);
  const scene = page.locator('#s6');

  await expect(scene.locator('[data-voucher-path="reuse"]')).toContainText('优先复用真实 MCU');
  await expect(scene.locator('[data-voucher-path="fallback"]')).toContainText('实例化券主 MCU');
  await expect(scene).toContainText('订单、投放记录和核销继续运行');
  await expect(scene.locator('[data-identity-debt]')).toContainText('可能长期并存');
  await expect(scene.locator('[data-identity-debt]')).toContainText('不能可靠自动合并');
});

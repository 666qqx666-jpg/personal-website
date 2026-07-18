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

test('growth chapter connects reusable infrastructure to touch and attribution', async ({ page }) => {
  await page.goto(route);

  const foundation = page.locator('#s7');
  for (const capability of ['customer-list', 'audience-filter', 'audience-pack', 'sms-service']) {
    await expect(foundation.locator(`[data-foundation="${capability}"]`)).toHaveCount(1);
  }

  const touch = page.locator('#s8');
  await expect(touch.locator('[data-touch-step]')).toHaveCount(6);
  for (const label of ['筛选人群', '创建计划', '内容与额度审核', '发送短信', '点击短链', '访问小程序']) {
    await expect(touch).toContainText(label);
  }

  const attribution = page.locator('#s9');
  await expect(attribution.locator('[data-channel="short-link"]')).toContainText('线上短链');
  await expect(attribution.locator('[data-channel="qr"]')).toContainText('线下二维码');
  await expect(attribution.locator('[data-loop="growth"]')).toHaveCount(1);
  await expect(attribution).toContainText('短链点击与小程序访问使用同一页面访问日志');
  for (const behavior of ['开卡', '领券', '核销', '下单']) {
    await expect(attribution).toContainText(behavior);
  }
  await expect(attribution).toContainText('完整链路不等于增量因果');
});

test('result scene binds every number to its counting boundary', async ({ page }) => {
  await page.goto(route);
  const scene = page.locator('#s10');

  await expect(scene.locator('[data-metric="mcu-records"]')).toContainText('约 876 万条');
  await expect(scene.locator('[data-metric="mcu-records"]')).toContainText('记录数，不是独立自然人数');
  await expect(scene.locator('[data-metric="annual-new-members"]')).toContainText('约 11.37 万');
  await expect(scene.locator('[data-metric="post-signup-reach"]')).toContainText('约 10.08 万');
  await expect(scene.locator('[data-metric="reach-rate"]')).toContainText('约 88.7%');
  await expect(scene).toContainText('开卡后触达覆盖率');
  await expect(scene.locator('[data-status="launched"]')).toContainText('核心能力均已正式上线');

  const body = await page.locator('body').innerText();
  expect(body).not.toContain('短信带来 11.37 万人开卡');
  expect(body).not.toContain('营销计划直接带来 7,296 万元销售额');
  expect(body).not.toContain('最大单一客户约 271 万');
});

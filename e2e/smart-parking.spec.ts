import { test, expect } from '@playwright/test';

const route = '/projects/smart-parking/';

test('deck renders eleven scenes and five chapter links', async ({ page }) => {
  await page.goto(route);
  await expect(page.getByRole('heading', { name: '让一套停车系统，重新拥有演进能力' })).toBeVisible();
  await expect(page.locator('section[data-scene]')).toHaveCount(11);

  const nav = page.getByRole('navigation', { name: '智慧停车案例章节' });
  for (const label of ['需求背景', '黑盒还原', '原生重构', '持续演进', '真实落地']) {
    await expect(nav.getByRole('link', { name: label })).toBeVisible();
  }
});

test('S1 to S4 establish the business importance and black-box reconstruction', async ({ page }) => {
  await page.goto(route);
  await expect(page.locator('#s2')).toContainText('停车，是商场体验的第一站与最后一站');
  await expect(page.locator('#s2')).toContainText('到场');
  await expect(page.locator('#s2')).toContainText('消费');
  await expect(page.locator('#s2')).toContainText('缴费离场');
  await expect(page.locator('#s3')).toContainText('1.0 仍在运行');
  await expect(page.locator('#s3')).toContainText('外包响应慢');
  await expect(page.locator('#s3')).toContainText('需求迭代慢');
  await expect(page.locator('#s4')).toContainText('没有可直接使用的产品文档和开发技术文档');
  await expect(page.locator('#s4')).toContainText('后台和小程序');
  await expect(page.locator('#s4')).toContainText('功能覆盖接近原系统');
});

test('S2 never exposes visual-companion sample numbers', async ({ page }) => {
  await page.goto(route);
  const scene = page.locator('#s2');
  const metricCount = await scene.locator('[data-background-metric]').count();
  expect([0, 3]).toContain(metricCount);

  if (metricCount === 0) {
    await expect(scene.locator('[data-metric-state="without-data"]')).toBeVisible();
  } else {
    for (const metric of await scene.locator('[data-background-metric]').all()) {
      await expect(metric).toHaveAttribute('data-scope', /.+/);
      await expect(metric).toHaveAttribute('data-time-basis', /.+/);
    }
  }

  const body = await page.locator('body').innerText();
  expect(body).not.toMatch(/42\.6 万|¥318 万|12\.8 万/);
});

test('S5 makes visitor payment independent from voluntary membership', async ({ page }) => {
  await page.goto(route);
  const scene = page.locator('#s5');
  await expect(scene.locator('[data-identity="xcu"]')).toContainText('无需开卡');
  await expect(scene.locator('[data-identity="xcu"]')).toContainText('直接缴费');
  await expect(scene.locator('[data-identity="mcu"]')).toContainText('自愿成为会员');
  await expect(scene.locator('[data-identity="mcu"]')).toContainText('会员权益');
  await expect(scene).toContainText('2.0 首发能力');
});

test('public copy keeps legacy, contribution, and result boundaries explicit', async ({ page }) => {
  await page.goto(route);
  const body = await page.locator('body').innerText();
  expect(body).toContain('1.0 仍在运行');
  expect(body).toContain('研发团队完成工程实现');
  expect(body).toContain('退款能力已上线，但暂无真实线上退款订单');
  expect(body).not.toContain('1.0 完全不可用');
  expect(body).not.toContain('2.0 已经全面替代 1.0');
  expect(body).not.toContain('独立完成研发');
});

test('S6 exposes five architecture layers without claiming universal standardization', async ({ page }) => {
  await page.goto(route);
  const scene = page.locator('#s6');
  for (const layer of ['internal', 'parking-service', 'parking-middleware', 'adapter', 'parking-lot']) {
    await expect(scene.locator(`[data-layer="${layer}"]`)).toHaveCount(1);
  }
  await expect(scene).toContainText('独立部署系统仍可能逐客户适配');
  await expect(scene).toContainText('集团级对接可覆盖 19 个商场');
});

test('S7 keeps four benefits, one total cap, and member plus vehicle limits explicit', async ({ page }) => {
  await page.goto(route);
  const scene = page.locator('#s7');
  for (const benefit of ['level', 'points', 'coupon', 'consumption']) {
    await expect(scene.locator(`[data-benefit="${benefit}"]`)).toHaveCount(1);
  }
  await expect(scene.locator('[data-discount-cap]')).toContainText('单次总减免上限');
  await expect(scene.locator('[data-limit-axis="member"]')).toContainText('会员');
  await expect(scene.locator('[data-limit-axis="vehicle"]')).toContainText('车辆');
  await expect(scene).toContainText('用户选择顺序决定优惠优先级');
  await expect(scene).toContainText('后端重新校验');
  await expect(scene).toContainText('每名会员每天最多使用一次');
});

test('S8 closes the payment lifecycle for cash, zero-pay, and failure branches', async ({ page }) => {
  await page.goto(route);
  const scene = page.locator('#s8');
  for (const state of ['validate', 'freeze', 'pending', 'paid', 'zero', 'release', 'notify']) {
    await expect(scene.locator(`[data-payment-state="${state}"]`)).toHaveCount(1);
  }
  await expect(scene).toContainText('并发重复占用');
});

test('S9 and S10 prove continued evolution while preserving migration boundaries', async ({ page }) => {
  await page.goto(route);
  for (const iteration of ['benefits', 'vehicle-risk', 'double-pay', 'refund']) {
    await expect(page.locator(`#s9 [data-iteration="${iteration}"]`)).toHaveCount(1);
  }
  await expect(page.locator('#s9')).toContainText('再次执行只重试失败步骤');
  await expect(page.locator('#s10 [data-version="2.0"]')).toContainText('8 个商场');
  await expect(page.locator('#s10 [data-version="1.0"]')).toContainText('27 个存量商场');
  await expect(page.locator('#s10')).toContainText('约 7.57 万笔');
  await expect(page.locator('#s10')).toContainText('1 个使用 2.0、18 个继续使用 1.0');
  await expect(page.locator('#s10')).toContainText('其中一个 2.0 商场刚上线');
});

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

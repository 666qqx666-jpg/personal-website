import { readFile } from 'node:fs/promises';
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

test('deck renders eleven scenes and five chapter links', async ({ page }) => {
  await page.goto(route);

  await expect(page.getByRole('heading', { name: '同一套系统，为什么需要两种权限模型？' })).toBeVisible();
  await expect(page.locator('section[data-scene]')).toHaveCount(11);

  const nav = page.getByRole('navigation', { name: '企业权限体系案例章节' });
  for (const label of ['共同约束', '商场基线', '品牌分叉', '治理闭环', '真实运行']) {
    await expect(nav.getByRole('link', { name: label })).toBeVisible();
  }
});

test('deck keeps launched status, public scale, and contribution boundary accurate', async ({ page }) => {
  await page.goto(route);

  await expect(page.locator('#s2 [data-status="launched"]')).toHaveCount(2);
  await expect(page.locator('#s2')).toContainText('综合商场成员与权限体系');
  await expect(page.locator('#s2')).toContainText('连锁品牌组织与多维权限体系');
  await expect(page.locator('#s3')).toContainText('业务权限身份分离');
  await expect(page.locator('#s3')).toContainText('审计操作身份统一');
  await expect(page.locator('#s10')).toContainText('约 25 个综合商场');
  await expect(page.locator('#s10')).toContainText('约 30 个连锁品牌');
  await expect(page.locator('#s10')).toContainText('约 3,000 名已创建成员');
  await expect(page.locator('#s10')).toContainText('单客户 3 万多家门店');

  const body = await page.locator('body').innerText();
  expect(body).not.toContain('万能权限中台');
  expect(body).not.toContain('独立完成研发');
  expect(body).not.toContain('生产权限字典');
});

test('S7 explains all five permission objects with distinct visual semantics', async ({ page }) => {
  await page.goto(route);
  const scene = page.locator('#s7');

  for (const dimension of ['organization', 'store', 'region', 'platform', 'page-action']) {
    await expect(scene.locator(`[data-dimension="${dimension}"]`)).toHaveCount(1);
  }
  await expect(scene.locator('[data-dimension="organization"]')).toContainText('上下级成员治理');
  await expect(scene.locator('[data-dimension="store"]')).toContainText('全部门店');
  await expect(scene.locator('[data-dimension="store"]')).toContainText('区域内门店');
  await expect(scene.locator('[data-dimension="store"]')).toContainText('指定门店');
  await expect(scene.locator('[data-dimension="region"]')).toContainText('全部');
  await expect(scene.locator('[data-dimension="region"]')).toContainText('指定');
  await expect(scene.locator('[data-dimension="region"]')).toContainText('无');
  await expect(scene.locator('[data-dimension="platform"] .platform-groups span')).toHaveCount(4);
  await expect(scene.locator('[data-dimension="page-action"]')).toContainText('查看');
  await expect(scene).toContainText('不自动向节点内成员继承');
});

test('S8 maps business modules to matching data objects instead of a global intersection', async ({ page }) => {
  await page.goto(route);
  const coupon = page.locator('#s8 [data-module="coupon"]');
  const salesLead = page.locator('#s8 [data-module="sales-lead"]');
  const member = page.locator('#s8 [data-module="member-governance"]');

  await expect(coupon.locator('[data-permission-ref="store"][data-required]')).toBeVisible();
  await expect(coupon.locator('[data-permission-ref="platform"][data-required]')).toBeVisible();
  await expect(coupon.locator('[data-permission-ref="region"][data-excluded]')).toContainText('不参与');

  await expect(salesLead.locator('[data-permission-ref="region"][data-required]')).toBeVisible();
  await expect(salesLead.locator('[data-permission-ref="platform"][data-required]')).toBeVisible();
  await expect(salesLead.locator('[data-permission-ref="store"][data-excluded]')).toContainText('不反推');

  await expect(member.locator('[data-permission-ref="organization"][data-required]')).toBeVisible();
  await expect(page.locator('#s8 [data-governance-boundary="page-action"]')).toContainText('入口与动作');
  await expect(page.locator('#s8')).toContainText('不是把五类权限全局求交');
});

test('desktop keeps DeckLayout snap while mobile preserves reading order without overflow', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(route);
  expect(await page.locator('[data-enterprise-permissions-deck]').evaluate((element) => getComputedStyle(element).scrollSnapType)).toContain('y');

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(route);
  expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)).toBe(false);
  const sceneIds = await page.locator('section[data-scene]').evaluateAll((sections) => sections.map((section) => section.id));
  expect(sceneIds).toEqual(['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8', 's9', 's10', 's11']);
  await expect(page.locator('#s7 [data-dimension]')).toHaveCount(5);
  await expect(page.locator('#s8 [data-module]')).toHaveCount(3);
});

test('permission semantics remain explicit without relying on color', async ({ page }) => {
  await page.goto(route);

  await expect(page.locator('#s7 [data-dimension="organization"]')).toHaveAttribute('data-dimension', 'organization');
  await expect(page.locator('#s8 [data-required]')).toHaveCount(5);
  await expect(page.locator('#s8 [data-excluded]')).toHaveCount(2);
  await expect(page.locator('#s9 b[aria-label="同级越权被阻断"]')).toContainText('阻断');
});

test('static mode keeps all scenes readable without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(route);

  await expect(page.locator('[data-enterprise-permissions-deck]')).toHaveAttribute('data-motion-mode', 'static');
  await expect(page.locator('section[data-scene]')).toHaveCount(11);
  await page.locator('#s11').scrollIntoViewIfNeeded();
  await expect(page.locator('#s11')).toBeVisible();
  await expect(page.locator('#s11')).toContainText('复用底座，而不是复用错误模型');
  await context.close();
});

test('desktop uses native observed reveals without pinning or horizontal tracks', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(route);
  const root = page.locator('[data-enterprise-permissions-deck]');

  await expect(root).toHaveAttribute('data-motion-ready', 'true');
  await expect(root).toHaveAttribute('data-motion-mode', 'observe');
  await expect(page.locator('#s1')).toHaveAttribute('data-motion-state', 'visible');
  await page.locator('#s8').scrollIntoViewIfNeeded();
  await expect(page.locator('#s8')).toHaveAttribute('data-motion-state', 'visible');
  await expect(page.locator('.pin-spacer')).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)).toBe(false);
});

test('reduced motion directly exposes final content', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto(route);
  const root = page.locator('[data-enterprise-permissions-deck]');

  await expect(root).toHaveAttribute('data-motion-mode', 'reduce');
  await expect(root).toHaveAttribute('data-motion-ready', 'true');
  await expect(page.locator('section[data-motion-state="visible"]')).toHaveCount(11);
  await expect(page.locator('.pin-spacer')).toHaveCount(0);
  await context.close();
});

test('missing IntersectionObserver falls back to fully visible content', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'IntersectionObserver', { value: undefined, configurable: true });
  });
  await page.goto(route);
  const root = page.locator('[data-enterprise-permissions-deck]');

  await expect(root).toHaveAttribute('data-motion-mode', 'fallback');
  await expect(root).toHaveAttribute('data-motion-ready', 'false');
  await expect(page.locator('section[data-motion-state="visible"]')).toHaveCount(11);
  await page.locator('#s11').scrollIntoViewIfNeeded();
  await expect(page.locator('#s11')).toBeVisible();
});

test('motion controller stays independent from GSAP and ScrollTrigger', async () => {
  const source = await readFile(new URL('../src/scripts/enterprise-permissions-motion.ts', import.meta.url), 'utf8');
  expect(source).not.toContain("from 'gsap'");
  expect(source).not.toContain('ScrollTrigger');
});

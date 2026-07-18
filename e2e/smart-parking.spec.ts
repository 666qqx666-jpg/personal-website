import { readFile } from 'node:fs/promises';
import { test, expect } from '@playwright/test';

const route = '/projects/smart-parking/';

test('deck renders eleven scenes and five chapter links', async ({ page }) => {
  await page.goto(route);
  await expect(page.getByRole('heading', { name: /让一套停车系统，\s*重新拥有演进能力/ })).toBeVisible();
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

test('desktop keeps snap while mobile preserves scene order without overflow', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(route);
  expect(await page.locator('[data-smart-parking-deck]').evaluate((element) => getComputedStyle(element).scrollSnapType)).toContain('y');
  expect(await page.locator('#s5 .identity-road').evaluate((element) => getComputedStyle(element).display)).toBe('grid');
  expect(await page.locator('#s8 .payment-flow').evaluate((element) => getComputedStyle(element).display)).toBe('grid');

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(route);
  expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)).toBe(false);
  const sceneIds = await page.locator('section[data-scene]').evaluateAll((sections) => sections.map((section) => section.id));
  expect(sceneIds).toEqual(['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8', 's9', 's10', 's11']);
});

test('light and dark themes retain parking semantic tokens', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('theme', 'light'));
  await page.goto(route);
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  const lightTokens = await page.locator('[data-smart-parking-deck]').evaluate((element) => {
    const style = getComputedStyle(element);
    return [style.getPropertyValue('--sp-lane').trim(), style.getPropertyValue('--sp-native').trim(), style.getPropertyValue('--sp-member').trim()];
  });
  expect(lightTokens.every(Boolean)).toBe(true);

  await page.locator('#deck-theme-toggle').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('#deck-theme-toggle')).toContainText('☀️');
});

test('parking semantics remain explicit without relying on color', async ({ page }) => {
  await page.goto(route);
  await expect(page.locator('#s5 [data-identity="xcu"]')).toHaveAttribute('data-identity', 'xcu');
  await expect(page.locator('#s5 [data-identity="mcu"]')).toHaveAttribute('data-identity', 'mcu');
  await expect(page.locator('#s7 [data-limit-axis]')).toHaveCount(2);
  await expect(page.locator('#s10 [data-version]')).toHaveCount(2);
  await expect(page.locator('#s10 [data-version="1.0"]')).toContainText('历史数据整合成本');
});

test('static mode keeps all scenes readable without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(route);
  await expect(page.locator('[data-smart-parking-deck]')).toHaveAttribute('data-motion-mode', 'static');
  await expect(page.locator('section[data-scene]')).toHaveCount(11);
  await page.locator('#s11').scrollIntoViewIfNeeded();
  await expect(page.locator('#s11')).toContainText('迁回的是产品定义权与演进能力');
  await context.close();
});

test('desktop uses native observed reveals without pinning', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(route);
  const root = page.locator('[data-smart-parking-deck]');
  await expect(root).toHaveAttribute('data-motion-ready', 'true');
  await expect(root).toHaveAttribute('data-motion-mode', 'observe');
  await expect(page.locator('#s1')).toHaveAttribute('data-motion-state', 'visible');
  await page.locator('#s7').scrollIntoViewIfNeeded();
  await expect(page.locator('#s7')).toHaveAttribute('data-motion-state', 'visible');
  await expect(page.locator('.pin-spacer')).toHaveCount(0);
});

test('reduced motion directly exposes all scenes', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto(route);
  const root = page.locator('[data-smart-parking-deck]');
  await expect(root).toHaveAttribute('data-motion-mode', 'reduce');
  await expect(root).toHaveAttribute('data-motion-ready', 'true');
  await expect(page.locator('section[data-motion-state="visible"]')).toHaveCount(11);
  await expect(page.locator('.pin-spacer')).toHaveCount(0);
  await context.close();
});

test('missing IntersectionObserver falls back to visible content', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'IntersectionObserver', { value: undefined, configurable: true });
  });
  await page.goto(route);
  const root = page.locator('[data-smart-parking-deck]');
  await expect(root).toHaveAttribute('data-motion-mode', 'fallback');
  await expect(root).toHaveAttribute('data-motion-ready', 'false');
  await expect(page.locator('section[data-motion-state="visible"]')).toHaveCount(11);
});

test('motion controller stays independent from GSAP and ScrollTrigger', async () => {
  const source = await readFile(new URL('../src/scripts/smart-parking-motion.ts', import.meta.url), 'utf8');
  expect(source).not.toContain("from 'gsap'");
  expect(source).not.toContain('ScrollTrigger');
});

test('chapter anchors remain keyboard usable and active state is accessible', async ({ page }) => {
  await page.goto(route);
  const nav = page.getByRole('navigation', { name: '智慧停车案例章节' });
  const native = nav.getByRole('link', { name: '原生重构' });
  await native.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#s5$/);
  await expect(native).toHaveAttribute('aria-current', 'true');
  await expect(page.getByRole('link', { name: '返回项目经历' })).toHaveAttribute('href', '/projects/');
});

test('controller cleanup restores static readable state', async ({ page }) => {
  await page.goto(route);
  const root = page.locator('[data-smart-parking-deck]');
  await expect(root).toHaveAttribute('data-motion-mode', 'observe');
  await page.evaluate(() => document.dispatchEvent(new Event('astro:before-swap')));
  await expect(root).toHaveAttribute('data-motion-mode', 'static');
  await expect(root).not.toHaveAttribute('data-motion-ready', /.+/);
  await expect(page.locator('section[data-motion-state]')).toHaveCount(0);
});

test('rapid forward and reverse scrolling keeps current scenes visible without browser errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(route);
  for (const id of ['s4', 's8', 's11', 's7', 's2', 's10']) {
    await page.locator(`#${id}`).scrollIntoViewIfNeeded();
    await expect(page.locator(`#${id}`)).toHaveAttribute('data-motion-state', 'visible');
  }
  expect(errors).toEqual([]);
});

test('projects listing exposes smart parking as the fourth public case', async ({ page }) => {
  await page.goto('/projects/');
  const cards = page.locator('.card');
  const firstFourTitles = await cards.locator('h3').evaluateAll((headings) => headings.slice(0, 4).map((heading) => heading.textContent?.trim()));
  expect(firstFourTitles).toEqual([
    '全域销售线索管理系统',
    '多业务线企业权限体系',
    '集团经营数据分析体系',
    '智慧停车 2.0',
  ]);

  const card = cards.nth(3);
  await expect(card).toContainText('外包系统内收');
  await expect(card).toContainText('持续演进');
  await expect(card).toHaveAttribute('href', route);

  const membershipIndex = await cards.evaluateAll((elements) => elements.findIndex((element) => element.textContent?.includes('多平台会员运营体系')));
  expect(membershipIndex === -1 || membershipIndex > 3).toBe(true);
});

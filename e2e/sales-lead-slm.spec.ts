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

test('deck renders eleven scenes and five chapter links', async ({ page }) => {
  await page.goto(route);

  await expect(page.getByRole('heading', { name: '让线索真正到达合适的门店' })).toBeVisible();
  await expect(page.locator('section[data-scene]')).toHaveCount(11);

  const nav = page.getByRole('navigation', { name: '销售线索案例章节' });
  for (const label of ['起点', '评分', '机制', '边界', '重构']) {
    await expect(nav.getByRole('link', { name: label })).toBeVisible();
  }
});

test('deck preserves verified facts and contribution boundary', async ({ page }) => {
  await page.goto(route);

  await expect(page.locator('#s1')).toContainText('10+');
  await expect(page.locator('#s1')).toContainText('15k+');
  await expect(page.locator('#s1')).toContainText('5 类来源');
  await expect(page.locator('#s2')).toContainText('前任 PM 已经搭建采集接入底座');
  await expect(page.locator('#s3')).toContainText('最近 180 天');
  await expect(page.locator('#s3')).toContainText('探索过但未上线');
  await expect(page.locator('#s5')).toContainText('3 公里');
  await expect(page.locator('#s5')).toContainText('30 公里');
  await expect(page.locator('#s6')).toContainText('不足 49.4%');
  await expect(page.locator('#s6')).toContainText('61.7%');
  await expect(page.locator('#s6')).toContainText('超过 12.3 个百分点');
  await expect(page.locator('#s6')).toContainText('卡券核销计为成交');

  const body = await page.locator('body').innerText();
  expect(body).not.toContain('从零建设');
  expect(body).not.toContain('独立完成整套系统');
});

test('future work keeps visible and accurate status labels', async ({ page }) => {
  await page.goto(route);

  await expect(page.locator('#s9 [data-status]')).toHaveText('已排期');
  await expect(page.locator('#s10 [data-status]')).toHaveText('方案规划中');
  await expect(page.locator('#s11 [data-status]')).toHaveText('待验证');
  await expect(page.locator('#s10')).toContainText('平台不经手资金');
  await expect(page.locator('#s10')).toContainText('尚未进入详细 PRD');
});

test('deck replaces inherited snap scrolling with document scrolling', async ({ page }) => {
  await page.goto(route);

  const scrollMode = await page.locator('[data-sales-lead-deck]').evaluate((element) => {
    const style = getComputedStyle(element);
    return { height: style.height, overflowY: style.overflowY, scrollSnapType: style.scrollSnapType };
  });

  expect(scrollMode.height).not.toBe(`${page.viewportSize()?.height}px`);
  expect(scrollMode.overflowY).toBe('visible');
  expect(scrollMode.scrollSnapType).toBe('none');
});

test('static mode keeps every scene readable without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(route);

  await expect(page.locator('[data-sales-lead-deck]')).toHaveAttribute('data-motion-mode', 'static');
  for (let index = 1; index <= 11; index += 1) await expect(page.locator(`#s${index}`)).toBeAttached();
  await page.locator('#s11').scrollIntoViewIfNeeded();
  await expect(page.locator('#s11')).toBeVisible();
  await expect(page.locator('#s11')).toContainText('投诉与退款边界');
  await context.close();
});

test('desktop motion creates exactly two pinned chapters without markers', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(route);
  const root = page.locator('[data-sales-lead-deck]');
  await expect(root).toHaveAttribute('data-motion-ready', 'true');
  await expect(root).toHaveAttribute('data-motion-mode', 'desktop');
  await expect(root).toHaveAttribute('data-motion-trigger-count', '5');
  await expect(root).toHaveAttribute('data-motion-pin-count', '2');
  await expect(page.locator('.pin-spacer')).toHaveCount(2);
  await expect(page.locator('.gsap-marker-start, .gsap-marker-end')).toHaveCount(0);
});

test('mobile motion keeps the full vertical flow without pin spacers', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(route);
  const root = page.locator('[data-sales-lead-deck]');
  await expect(root).toHaveAttribute('data-motion-ready', 'true');
  await expect(root).toHaveAttribute('data-motion-mode', 'mobile');
  await expect(root).toHaveAttribute('data-motion-trigger-count', '3');
  await expect(root).toHaveAttribute('data-motion-pin-count', '0');
  await expect(page.locator('.pin-spacer')).toHaveCount(0);
  await expect(page.locator('#s7')).toBeAttached();
  await expect(page.locator('#s8')).toBeAttached();
});

test('reduced motion renders final content without ScrollTrigger pinning', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto(route);
  const root = page.locator('[data-sales-lead-deck]');
  await expect(root).toHaveAttribute('data-motion-ready', 'true');
  await expect(root).toHaveAttribute('data-motion-mode', 'reduce');
  await expect(root).toHaveAttribute('data-motion-trigger-count', '0');
  await expect(root).toHaveAttribute('data-motion-pin-count', '0');
  await expect(page.locator('.pin-spacer')).toHaveCount(0);
  await expect(page.locator('#s11')).toContainText('待验证');
  await context.close();
});

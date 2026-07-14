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

test('deck explains the business chain and demand origin for first-time readers', async ({ page }) => {
  await page.goto(route);

  const background = page.locator('#s2');
  for (const step of ['顾客留资或领券', '平台产生线索', '总部汇总线索', '匹配合适门店', '门店跟进顾客', '核销或成交']) {
    await expect(background).toContainText(step);
  }
  await expect(background).toContainText('客户最初提出');
  await expect(background).toContainText('多平台下载、导入和分配太麻烦');
  await expect(background).toContainText('继续追查后发现');
  await expect(background).toContainText('信息缺失、分配延迟、责任无法回收');

  await expect(page.locator('#s5')).toContainText('公海池：无法直接分发给明确意向门店的线索');
  await expect(page.locator('#s5')).toContainText('保护期：意向门店和最近门店先看、先抢');
  await expect(page.locator('#s6')).toContainText('在这个客户的业务里，卡券核销计为成交');
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

test('deck has no horizontal overflow on desktop and mobile', async ({ page }) => {
  for (const viewport of [{ width: 1280, height: 800 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    await page.goto(route);
    await expect(page.locator('[data-sales-lead-deck]')).toHaveAttribute('data-motion-ready', 'true');
    expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)).toBe(false);
  }
});

test('chapter navigation updates aria-current and anchors remain usable', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(route);
  const rebuild = page.getByRole('navigation', { name: '销售线索案例章节' }).getByRole('link', { name: '重构' });
  await rebuild.click();
  await expect(page).toHaveURL(/#s9$/);
  await expect(page.locator('#s9')).toBeAttached();
  await expect(rebuild).toHaveAttribute('aria-current', 'true');
});

test('desktop horizontal chapter moves the track while keeping S8 readable', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(route);
  const track = page.locator('[data-motion="industry-track"]');
  const before = await track.evaluate((element) => getComputedStyle(element).transform);
  const stageTop = await page.locator('[data-motion="industry-stage"]').evaluate((element) => element.getBoundingClientRect().top + window.scrollY);
  await page.evaluate((top) => window.scrollTo(0, top + window.innerWidth * .82), stageTop);
  await page.waitForTimeout(250);
  expect(await track.evaluate((element) => getComputedStyle(element).transform)).not.toBe(before);
  await expect(page.locator('#s8')).toContainText('问题必须前移到清洗层');
});

test('deck produces no browser errors during the main scroll path', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(route);
  const maxScroll = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
  for (const progress of [0, .12, .25, .38, .5, .62, .75, .88, 1]) { await page.evaluate(([max, ratio]) => window.scrollTo(0, max * ratio), [maxScroll, progress]); await page.waitForTimeout(120); }
  expect(errors).toEqual([]);
});

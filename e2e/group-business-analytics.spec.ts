import { readFile } from 'node:fs/promises';
import { test, expect } from '@playwright/test';

const route = '/projects/group-business-analytics/';

test('projects listing exposes the group business analytics case as the third card', async ({ page }) => {
  await page.goto('/projects/');
  const cards = page.locator('.card');
  await expect(cards).toHaveCount(4);
  await expect(cards.nth(0)).toContainText('全域销售线索管理系统');
  await expect(cards.nth(1)).toContainText('多业务线企业权限体系');

  const card = cards.nth(2);
  await expect(card).toContainText('集团经营数据分析体系');
  await expect(card).toContainText('集团考核需求');
  await expect(card).toContainText('指标建模');
  await expect(card).toHaveAttribute('href', route);
});

test('deck renders eleven scenes and four chapter links', async ({ page }) => {
  await page.goto(route);
  await expect(page.getByRole('heading', { name: '当管理对象从一家商场变成一个集团' })).toBeVisible();
  await expect(page.locator('section[data-scene]')).toHaveCount(11);

  const nav = page.getByRole('navigation', { name: '集团经营数据分析案例章节' });
  for (const label of ['需求诞生', '建模演进', '产品反思', '真实运行']) {
    await expect(nav.getByRole('link', { name: label })).toBeVisible();
  }
});

test('S1 and S2 explain how the group management demand was born', async ({ page }) => {
  await page.goto(route);
  await expect(page.locator('#s1')).toContainText('集团管理层不需要逐个进入商场页面完成集团分析');
  await expect(page.locator('#s1')).toContainText('集团汇总');
  await expect(page.locator('#s1')).toContainText('商场横向比较');
  await expect(page.locator('#s1')).toContainText('统一考核入口');
  await expect(page.locator('#s2')).toContainText('10 个商场');
  await expect(page.locator('#s2')).toContainText('半年');
  await expect(page.locator('#s2')).toContainText('至少 20 次下载');
  await expect(page.locator('#s2')).toContainText('一次跨商场查询与下载');
  await expect(page.locator('#s2')).toContainText('集团整体');
  await expect(page.locator('#s2')).toContainText('商场对比');
  await expect(page.locator('#s2')).toContainText('单商场下钻');
});

test('S3 and S4 convert business definitions into statistical records', async ({ page }) => {
  await page.goto(route);
  const member = page.locator('#s3');
  for (const term of ['集团新增会员', '商场新增开卡会员', '商场新增关联会员', '商场新增会员']) {
    await expect(member).toContainText(term);
  }
  await expect(member).toContainText('集团新增会员 ≠ 各商场新增会员之和');
  await expect(member).toContainText('日期 × 商场 × 新增类型 × 来源维度 → 新增数量');

  const sales = page.locator('#s4');
  for (const term of ['SO', '负数 RSO', 'MCUid', '商场 / 门店', '日粒度', '销售额', '销售笔数', '销售人数', '连带率', '老客率']) {
    await expect(sales).toContainText(term);
  }
  await expect(sales).toContainText('周 / 月比例需要重新聚合分子与分母');
});

test('S7 and S8 preserve the four object to metric mappings in semantic HTML', async ({ page }) => {
  await page.goto(route);
  const mapping = [
    ['new-member', 'NM', '小程序新增会员明细'],
    ['daily-active', 'UV', '小程序用户日活记录'],
    ['launch', 'VV', '小程序启动日志'],
    ['page-view', 'PV', '小程序页面访问日志'],
  ] as const;

  for (const [object, metric, label] of mapping) {
    const row = page.locator(`#s8 [data-fact-object="${object}"][data-metric="${metric}"]`);
    await expect(row).toHaveCount(1);
    await expect(row).toContainText(label);
    await expect(row).toContainText(metric);
  }

  for (const phase of ['problem', 'objects', 'query', 'metrics']) {
    await expect(page.locator(`[data-model-stage] [data-model-phase="${phase}"]`)).toHaveCount(1);
  }
  await expect(page.locator('#s8')).toContainText('先保留真实行为，再按问题选择聚合方式');
});

test('S10 keeps the full technical debt chapter permanently visible', async ({ page }) => {
  await page.goto(route);
  const debt = page.locator('#s10');

  await expect(debt.locator('[data-status="warehouse-launched"]')).toContainText('小程序访问趋势');
  await expect(debt.locator('[data-status="warehouse-launched"]')).toContainText('积分产生 / 消耗趋势');
  await expect(debt.locator('[data-status="legacy-launched"]')).toContainText('会员新增趋势 2.0');
  await expect(debt.locator('[data-status="legacy-launched"]')).toContainText('销售趋势');
  await expect(debt.locator('[data-status="solution-unscheduled"]')).toContainText('有价券分析');
  await expect(debt.locator('[data-status="debt-unscheduled"]')).toContainText('拍照积分订单纳入销售趋势');
  await expect(debt).toContainText('MCUid 与统一 SO 只是继续关联分析的基础');
  await expect(debt).toContainText('不表示统一漏斗已经上线');
});

test('S11 keeps adoption evidence and contribution boundaries accurate', async ({ page }) => {
  await page.goto(route);
  const result = page.locator('#s11');
  await expect(result).toContainText('约 25 个综合商场');
  await expect(result).toContainText('季度考核');
  await expect(result).toContainText('至少 20 次下载');
  await expect(result).toContainText('一次跨商场查询与下载');
  await expect(result).toContainText('客户沟通');
  await expect(result).toContainText('指标与分析维度建模');
  await expect(result).toContainText('PRD 与原型');
  await expect(result).toContainText('研发与数据团队完成工程实现');
});

test('deck rejects false completion claims and production identifiers', async ({ page }) => {
  await page.goto(route);
  const body = await page.locator('body').innerText();
  for (const forbidden of [
    '四类报表已统一迁移到数仓',
    '已上线统一转化漏斗',
    '有价券分析已上线',
    '有价券分析已经排期',
    '拍照积分订单已进入销售趋势',
    '本人独立完成数据工程',
    '本人独立完成数仓建设',
    'appid',
    'openid',
    'XCUid',
  ]) expect(body).not.toContain(forbidden);
});

test('deck uses document scrolling and keeps the model lab local', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(route);
  const scrollMode = await page.locator('[data-group-analytics-deck]').evaluate((element) => {
    const style = getComputedStyle(element);
    return { height: style.height, overflowY: style.overflowY, scrollSnapType: style.scrollSnapType };
  });
  expect(scrollMode.height).not.toBe('800px');
  expect(scrollMode.overflowY).toBe('visible');
  expect(scrollMode.scrollSnapType).toBe('none');
  await expect(page.locator('[data-model-stage]')).toHaveCount(1);
});

test('mobile preserves vertical reading order without horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(route);
  expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)).toBe(false);
  expect(await page.locator('#s7 .model-phases').evaluate((element) => getComputedStyle(element).gridTemplateColumns)).not.toContain(' ');
  const phases = await page.locator('[data-model-stage] [data-model-phase]').evaluateAll((items) => items.map((item) => item.getAttribute('data-model-phase')));
  expect(phases).toEqual(['problem', 'objects', 'query', 'metrics']);
  await expect(page.locator('#s10 [data-status]')).toHaveCount(4);
});

test('static mode keeps all scenes, model phases, and debt readable without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  await page.goto(route);
  const root = page.locator('[data-group-analytics-deck]');
  await expect(root).toHaveAttribute('data-motion-mode', 'static');
  await expect(page.locator('section[data-scene]')).toHaveCount(11);
  await expect(page.locator('[data-model-stage] [data-model-phase]')).toHaveCount(4);
  await page.locator('#s10').scrollIntoViewIfNeeded();
  await expect(page.locator('#s10')).toContainText('有价券分析');
  await page.locator('#s11').scrollIntoViewIfNeeded();
  await expect(page.locator('#s11')).toContainText('研发与数据团队完成工程实现');
  await context.close();
});

test('color is not the only carrier of object and debt semantics', async ({ page }) => {
  await page.goto(route);
  await expect(page.locator('#s8 [data-fact-object][data-metric]')).toHaveCount(4);
  await expect(page.locator('#s10 [data-status] strong')).toHaveCount(4);
  for (const object of ['new-member', 'daily-active', 'launch', 'page-view']) {
    await expect(page.locator(`#s8 [data-fact-object="${object}"] p`)).not.toBeEmpty();
  }
});

test('desktop model lab uses a deliberate grid-based visual layout', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(route);
  await expect(page.locator('#s7 .model-lab-shell')).toHaveCSS('display', 'grid');
  await expect(page.locator('#s7 .model-phases')).toHaveCSS('display', 'grid');
  await expect(page.locator('#s7 [data-model-phase="problem"]')).toHaveCSS('min-height', '384px');
});

test('desktop creates exactly one local model pin with four semantic phases', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(route);
  const root = page.locator('[data-group-analytics-deck]');
  await expect(root).toHaveAttribute('data-motion-ready', 'true');
  await expect(root).toHaveAttribute('data-motion-mode', 'desktop');
  await expect(root).toHaveAttribute('data-motion-trigger-count', '1');
  await expect(root).toHaveAttribute('data-motion-pin-count', '1');
  await expect(page.locator('.pin-spacer')).toHaveCount(1);
  const stage = page.locator('[data-model-stage]');
  await expect(stage.locator('section[data-scene]')).toHaveCount(2);
  await expect(stage.locator('#s7')).toHaveCount(1);
  await expect(stage.locator('#s8')).toHaveCount(1);
  await expect(stage.locator('xpath=..')).toHaveClass(/pin-spacer/);
  await expect(page.locator('.gsap-marker-start, .gsap-marker-end')).toHaveCount(0);
  await expect(stage.locator('[data-model-phase]')).toHaveCount(4);
});

test('desktop model lab advances from the problem to the metric mapping', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(route);
  const root = page.locator('[data-group-analytics-deck]');
  await expect(root).toHaveAttribute('data-model-phase-active', 'problem');
  const top = await page.locator('[data-model-stage]').evaluate((element) => element.getBoundingClientRect().top + window.scrollY);
  await page.evaluate((stageTop) => window.scrollTo(0, stageTop + window.innerHeight * 1.55), top);
  await expect(root).toHaveAttribute('data-model-phase-active', 'metrics');
  await expect(page.locator('#s8')).toContainText('小程序页面访问日志');
});

test('mobile keeps all four phases visible and creates no ScrollTrigger', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(route);
  const root = page.locator('[data-group-analytics-deck]');
  await expect(root).toHaveAttribute('data-motion-ready', 'true');
  await expect(root).toHaveAttribute('data-motion-mode', 'mobile');
  await expect(root).toHaveAttribute('data-motion-trigger-count', '0');
  await expect(root).toHaveAttribute('data-motion-pin-count', '0');
  await expect(root).toHaveAttribute('data-model-phase-active', 'all');
  await expect(page.locator('.pin-spacer')).toHaveCount(0);
  for (const phase of ['problem', 'objects', 'query', 'metrics']) {
    await expect(page.locator(`[data-model-phase="${phase}"]`)).toBeVisible();
  }
});

test('reduced motion exposes final content without pinning or delayed reveals', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto(route);
  const root = page.locator('[data-group-analytics-deck]');
  await expect(root).toHaveAttribute('data-motion-mode', 'reduce');
  await expect(root).toHaveAttribute('data-motion-ready', 'true');
  await expect(root).toHaveAttribute('data-motion-trigger-count', '0');
  await expect(root).toHaveAttribute('data-motion-pin-count', '0');
  await expect(root).toHaveAttribute('data-model-phase-active', 'all');
  await expect(page.locator('.pin-spacer')).toHaveCount(0);
  await expect(page.locator('section[data-motion-state="visible"]')).toHaveCount(9);
  await context.close();
});

test('motion source owns only one pin and no debug markers', async () => {
  const source = await readFile(new URL('../src/scripts/group-business-analytics-motion.ts', import.meta.url), 'utf8');
  expect(source.match(/pin:\s*true/g)).toHaveLength(1);
  expect(source).toContain("id: 'group-analytics-model-lab'");
  expect(source).not.toContain('markers: true');
});

test('missing IntersectionObserver falls back to fully visible content without a pin', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'IntersectionObserver', { value: undefined, configurable: true });
  });
  await page.goto(route);
  const root = page.locator('[data-group-analytics-deck]');
  await expect(root).toHaveAttribute('data-motion-mode', 'fallback');
  await expect(root).toHaveAttribute('data-motion-ready', 'false');
  await expect(root).toHaveAttribute('data-motion-trigger-count', '0');
  await expect(root).toHaveAttribute('data-motion-pin-count', '0');
  await expect(page.locator('.pin-spacer')).toHaveCount(0);
  await expect(page.locator('[data-model-stage] [data-model-phase]')).toHaveCount(4);
  await page.locator('#s11').scrollIntoViewIfNeeded();
  await expect(page.locator('#s11')).toBeVisible();
});

test('observer initialization failure also returns to the readable fallback state', async ({ page }) => {
  await page.addInitScript(() => {
    class BrokenIntersectionObserver {
      constructor() { throw new Error('synthetic observer failure'); }
    }
    Object.defineProperty(window, 'IntersectionObserver', { value: BrokenIntersectionObserver, configurable: true });
  });
  await page.goto(route);
  const root = page.locator('[data-group-analytics-deck]');
  await expect(root).toHaveAttribute('data-motion-mode', 'fallback');
  await expect(root).toHaveAttribute('data-motion-ready', 'false');
  await expect(page.locator('.pin-spacer')).toHaveCount(0);
  await expect(page.locator('[data-model-stage] [data-model-phase]')).toHaveCount(4);
});

test('chapter navigation works with keyboard and updates aria-current', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(route);
  const nav = page.getByRole('navigation', { name: '集团经营数据分析案例章节' });
  const reflection = nav.getByRole('link', { name: '产品反思' });
  await reflection.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#s9$/);
  await expect(page.locator('#s9')).toBeAttached();
  await expect(reflection).toHaveAttribute('aria-current', 'true');
  await expect(page.getByRole('link', { name: '返回项目经历' })).toHaveAttribute('href', '/projects/');
});

test('controller cleanup removes the pin and restores static readable state', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(route);
  const root = page.locator('[data-group-analytics-deck]');
  await expect(root).toHaveAttribute('data-motion-mode', 'desktop');
  await expect(page.locator('.pin-spacer')).toHaveCount(1);

  await page.evaluate(() => document.dispatchEvent(new Event('astro:before-swap')));
  await expect(root).toHaveAttribute('data-motion-mode', 'static');
  await expect(root).not.toHaveAttribute('data-motion-ready', /.+/);
  await expect(root).not.toHaveAttribute('data-motion-trigger-count', /.+/);
  await expect(root).not.toHaveAttribute('data-motion-pin-count', /.+/);
  await expect(root).toHaveAttribute('data-model-phase-active', 'all');
  await expect(page.locator('.pin-spacer')).toHaveCount(0);
  await expect(page.locator('section[data-motion-state]')).toHaveCount(0);
  await expect(page.locator('#s10')).toContainText('技术债');
});

test('viewport changes rebuild motion without accumulating pin spacers', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(route);
  const root = page.locator('[data-group-analytics-deck]');
  await expect(page.locator('.pin-spacer')).toHaveCount(1);

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(root).toHaveAttribute('data-motion-mode', 'mobile');
  await expect(page.locator('.pin-spacer')).toHaveCount(0);

  await page.setViewportSize({ width: 1280, height: 800 });
  await expect(root).toHaveAttribute('data-motion-mode', 'desktop');
  await expect(root).toHaveAttribute('data-motion-pin-count', '1');
  await expect(page.locator('.pin-spacer')).toHaveCount(1);
});

test('main scroll path produces no browser errors and releases the model pin', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(route);
  await expect(page.locator('[data-group-analytics-deck]')).toHaveAttribute('data-motion-ready', 'true');

  const maxScroll = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
  for (const progress of [0, .12, .24, .36, .48, .6, .72, .84, 1, .68, .42, .16, 1]) {
    await page.evaluate(([max, ratio]) => window.scrollTo(0, max * ratio), [maxScroll, progress]);
    await page.waitForTimeout(100);
  }

  await page.locator('#s11').scrollIntoViewIfNeeded();
  await expect(page.locator('#s11')).toBeVisible();
  await expect(page.locator('#s11')).toContainText('可以持续演进的数据产品');
  expect(errors).toEqual([]);
});

test('all supported viewports remain free of horizontal overflow', async ({ page }) => {
  for (const viewport of [{ width: 1440, height: 900 }, { width: 1024, height: 768 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    await page.goto(route);
    await expect(page.locator('[data-group-analytics-deck]')).toHaveAttribute('data-motion-ready', 'true');
    expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)).toBe(false);
  }
});

import { readFile } from 'node:fs/promises';
import { test, expect } from '@playwright/test';

const visualIds = [
  'problem-map',
  'knowledge-production-gates',
  'v1-routing-runtime',
  'v2-shadow-runtime',
  'evaluation-activation-gate',
  'v15-profile-runtime',
  'workflow-impact',
] as const;

const normalize = (value: string) => value.replace(/[\s，。；：、/·—–-]/g, '').toLowerCase();

test('Knowledge Harness binds eight sections to seven unique diagrams', async ({ page }) => {
  await page.goto('/ai/knowledge-harness/');
  await expect(page.getByRole('heading', { name: 'Enterprise Knowledge Harness' })).toBeVisible();
  await expect(page.locator('main#deck section')).toHaveCount(8);
  await expect(page.locator('[data-visual]')).toHaveCount(7);
  expect(await page.locator('[data-visual]').evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-visual'))))
    .toEqual([...visualIds]);
  await expect(page.locator('nav.timeline a[data-t]')).toHaveCount(8);
  expect(await page.locator('nav.timeline a[data-t]').evaluateAll((nodes) => nodes.map((node) => node.getAttribute('href'))))
    .toEqual(['#s1', '#s2', '#s3', '#s4', '#s5', '#s6', '#s7', '#s8']);
});

test('narrative copy and diagram labels are not the same payload', async ({ page }) => {
  await page.goto('/ai/knowledge-harness/');
  for (let index = 2; index <= 8; index += 1) {
    const section = page.locator(`#s${index}`);
    const left = normalize(await section.locator('.narrative-copy').innerText());
    const right = normalize(await section.locator('.diagram-labels').innerText());
    expect(left.length).toBeGreaterThan(20);
    expect(right.length).toBeGreaterThan(12);
    expect(right).not.toBe(left);
  }
});

test('public facts explain candidate gates and V1 to V1.5 evolution without overclaiming', async ({ page }) => {
  await page.goto('/ai/knowledge-harness/');
  const body = await page.locator('body').innerText();
  for (const required of [
    '不是每个对话都触发', '不是会话结束 Hook', '候选', '正式知识',
    '最多 5 个文件', '没有 Token 硬上限', '6,000 Token',
    '300', '1,400', '800', '2,600', '900',
    '20 组', 'V1 18', 'V2 16', 'activation=false',
    'Profile', '两阶段', 'RetrievalTrace', '可替换检索接口',
    '工作价值不降低', '中位数', 'P90', '待同题评测',
    'PRD Writer', '独立 Reviewer', '渗透率 100%', '历史文档缺失',
  ]) expect(body).toContain(required);
  for (const forbidden of [
    'V2 已正式替换 V1', 'V1 有 6,000 Token 硬上限', 'V2 上限为 6,500 Token',
    'V1.5 硬上限为 3,500 Token', 'V1.5 已证明 Token 中位数和 P90 低于 V2',
    'V1.5 已完成生产切流', '每个对话结束都会自动生成知识卡',
    'digest 是全局会话结束 Hook', '两个独立 Skill 已上线负责查找和组装',
  ]) expect(body).not.toContain(forbidden);
});

test('page source does not pass narrative arrays into visual components', async () => {
  const source = await readFile(new URL('../src/pages/ai/knowledge-harness.astro', import.meta.url), 'utf8');
  expect(source).not.toMatch(/points\.map/);
  expect(source).not.toMatch(/<Visual[^>]+(?:narrative|points)=/);
  expect(source).toContain('visualById[section.visualId]');
});

test('diagrams expose captions, labels and non-color state legends', async ({ page }) => {
  await page.goto('/ai/knowledge-harness/');
  for (const visualId of visualIds) {
    const figure = page.locator(`[data-visual="${visualId}"]`);
    await expect(figure).toHaveAttribute('aria-label', /.+/);
    await expect(figure.locator('figcaption')).not.toBeEmpty();
    await expect(figure.locator('[data-legend]')).toContainText(/稳定|影子|门禁|已验证/);
  }
});

test('deck interactions and source bridge remain available', async ({ page }) => {
  await page.goto('/ai/knowledge-harness/#s2');
  await page.addStyleTag({ content: 'astro-dev-toolbar { display: none !important; }' });
  await expect(page.locator('#s2 .source-link')).toHaveAttribute('href', '/ai/claude-code-architecture/');
  for (let index = 1; index <= 8; index += 1) {
    await page.locator(`nav.timeline a[data-t="s${index}"]`).click();
    await expect(page).toHaveURL(new RegExp(`#s${index}$`));
  }
  await page.locator('nav.timeline a[data-t="s6"]').click();
  await expect(page).toHaveURL(/#s6$/);
  await expect(page.locator('nav.timeline a[data-t="s6"]')).toHaveClass(/active/);
  await page.locator('#deck-theme-toggle').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', /light|dark/);
});

test('desktop and mobile layouts do not overflow horizontally', async ({ page }) => {
  for (const viewport of [{ width: 1280, height: 800 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    for (const id of ['s3', 's5', 's6', 's7']) {
      await page.goto(`/ai/knowledge-harness/#${id}`);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
      expect(overflow).toBe(false);
    }
  }
});

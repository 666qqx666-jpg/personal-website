import { readFile } from 'node:fs/promises';
import { test, expect } from '@playwright/test';

const visualIds = [
  'problem-map',
  'layered-architecture',
  'knowledge-pipeline',
  'routing-index-map',
  'context-assembly',
  'ranking-mechanism',
  'failure-boundary',
  'release-rollback',
  'workflow-impact',
] as const;

const normalize = (value: string) => value.replace(/[\s，。；：、/·—–-]/g, '').toLowerCase();

test('Knowledge Harness binds ten sections to nine unique diagrams', async ({ page }) => {
  await page.goto('/ai/knowledge-harness/');
  await expect(page.getByRole('heading', { name: 'Enterprise Knowledge Harness' })).toBeVisible();
  await expect(page.locator('main#deck section')).toHaveCount(10);
  await expect(page.locator('[data-visual]')).toHaveCount(9);
  expect(await page.locator('[data-visual]').evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-visual'))))
    .toEqual([...visualIds]);
  await expect(page.locator('nav.timeline a[data-t]')).toHaveCount(10);
});

test('narrative copy and diagram labels are not the same payload', async ({ page }) => {
  await page.goto('/ai/knowledge-harness/');
  for (let index = 2; index <= 10; index += 1) {
    const section = page.locator(`#s${index}`);
    const left = normalize(await section.locator('.narrative-copy').innerText());
    const right = normalize(await section.locator('.diagram-labels').innerText());
    expect(left.length).toBeGreaterThan(20);
    expect(right.length).toBeGreaterThan(12);
    expect(right).not.toBe(left);
  }
});

test('public facts separate V1 stable operation from V2 shadow capability', async ({ page }) => {
  await page.goto('/ai/knowledge-harness/');
  const body = await page.locator('body').innerText();
  for (const required of [
    '企业知识与固定 Skill 解耦',
    '三层知识架构',
    '根索引',
    '领域索引',
    '任务索引',
    '项目记忆索引',
    'V1 稳定基线',
    'V2 已实现但暂未激活',
    'Query Planner',
    'RoleRetriever',
    'RRF',
    'Reranker',
    'Selector',
    'Quality Gate',
    'Composer',
    'Renderer',
    'RetrievalTrace',
    'PRD Writer',
    '独立 Reviewer',
    '渗透率 100%',
  ]) expect(body).toContain(required);
  for (const forbidden of [
    'Personal Knowledge Harness',
    '个人稳定自用',
    '两个独立 Skill 已上线',
    'V2 已正式替换 V1',
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
  await page.locator('nav.timeline a[data-t="s6"]').click();
  await expect(page).toHaveURL(/#s6$/);
  await expect(page.locator('nav.timeline a[data-t="s6"]')).toHaveClass(/active/);
  await page.locator('#deck-theme-toggle').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', /light|dark/);
});

test('desktop and mobile layouts do not overflow horizontally', async ({ page }) => {
  for (const viewport of [{ width: 1280, height: 800 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    await page.goto('/ai/knowledge-harness/#s6');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    expect(overflow).toBe(false);
  }
});

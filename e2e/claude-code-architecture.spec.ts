import { test, expect } from '@playwright/test';

test('AI listing links to Claude Code architecture deck', async ({ page }) => {
  await page.goto('/personal-website/ai/');
  const card = page.locator('.card', { hasText: '从 Claude Code 到 AI 产品架构' });
  await expect(card).toBeVisible();
  await expect(card).toContainText('AI 产品架构');
  await expect(card).toHaveAttribute('href', '/personal-website/ai/claude-code-architecture/');
});

test('Claude Code architecture deck has ten method sections', async ({ page }) => {
  await page.goto('/personal-website/ai/claude-code-architecture/');
  await expect(page.getByRole('heading', { name: '从 Claude Code 到 AI 产品架构' })).toBeVisible();
  await expect(page.locator('main#deck section')).toHaveCount(10);
  await expect(page.locator('#s2')).toContainText('模型看到的世界');
  await expect(page.locator('#s5')).toContainText('上下文怎么进出');
  await expect(page.locator('#s9')).toContainText('我的 AI 产品架构框架');
});

test('Claude Code architecture deck exposes timeline labels', async ({ page }) => {
  await page.goto('/personal-website/ai/claude-code-architecture/');
  const timeline = page.locator('nav.timeline');
  await expect(timeline).toBeVisible();
  for (const label of ['封面', '输入', '循环', '工具', '上下文', '控制', '运行时', '多 agent', '框架', '实践']) {
    await expect(timeline).toContainText(label);
  }
});

test('method deck links to Knowledge Harness practice deck', async ({ page }) => {
  await page.goto('/personal-website/ai/claude-code-architecture/');
  await expect(page.locator('#s10 a', { hasText: '查看 Personal Knowledge Harness' })).toHaveAttribute(
    'href',
    '/personal-website/ai/knowledge-harness/'
  );
});

test('Knowledge Harness origin slide links back to method deck', async ({ page }) => {
  await page.goto('/personal-website/ai/knowledge-harness/');
  await expect(page.locator('#s2 a', { hasText: '源码方法论篇' })).toHaveAttribute(
    'href',
    '/personal-website/ai/claude-code-architecture/'
  );
});

test('method deck has no horizontal overflow on desktop and mobile', async ({ page }) => {
  for (const viewport of [
    { width: 1280, height: 800 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto('/personal-website/ai/claude-code-architecture/');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    expect(overflow).toBe(false);
  }
});

test('mobile deck keeps code snippets readable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/personal-website/ai/claude-code-architecture/#s2');
  const codeBox = page.locator('#s2 pre').first();
  await expect(codeBox).toBeVisible();
  const box = await codeBox.boundingBox();
  expect(box?.width).toBeLessThanOrEqual(360);
});

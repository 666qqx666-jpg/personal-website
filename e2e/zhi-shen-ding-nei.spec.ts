import { test, expect } from '@playwright/test';

test('AI listing does not duplicate Zhi Shen Ding Nei deck', async ({ page }) => {
  await page.goto('/personal-website/ai/');
  const card = page.locator('.card', { hasText: '置身钉内：责任流阅读笔记' });
  await expect(card).toHaveCount(0);
});

test('thinking listing replaces Zhi Shen Ding Nei product opportunity card with responsibility flow deck', async ({ page }) => {
  await page.goto('/personal-website/thinking/');
  const card = page.locator('.card', { hasText: '置身钉内 → 产品机会' });
  await expect(card).toBeVisible();
  await expect(card).toContainText('责任流');
  await expect(card).toContainText('To B 产品');
  await expect(card).toHaveAttribute('href', '/personal-website/ai/zhi-shen-ding-nei/');
});

test('Zhi Shen Ding Nei deck has ten responsibility-flow sections', async ({ page }) => {
  await page.goto('/personal-website/ai/zhi-shen-ding-nei/');
  await expect(page.getByRole('heading', { name: '置身钉内：我读到的不是消息总结，而是责任流' })).toBeVisible();
  await expect(page.locator('main#deck section')).toHaveCount(10);
  await expect(page.locator('#s3')).toContainText('发信人基因');
  await expect(page.locator('#s4')).toContainText('信息、任务、责任');
  await expect(page.locator('#s5')).toContainText('AI 判断不是传统规则里的 1 和 0');
  await expect(page.locator('#s9')).toContainText('没有胜仗的敏捷');
  await expect(page.locator('#s10')).toContainText('reading-dialogue Skill');
});

test('Zhi Shen Ding Nei deck exposes responsibility-flow timeline labels', async ({ page }) => {
  await page.goto('/personal-website/ai/zhi-shen-ding-nei/');
  const timeline = page.locator('nav.timeline');
  await expect(timeline).toBeVisible();
  for (const label of ['封面', '阅读', '张力', '三层', '不确定性', '兜底', '异常', '流程', '胜仗', '资产']) {
    await expect(timeline).toContainText(label);
  }
});

test('Zhi Shen Ding Nei deck keeps reading workflow as a closing hook only', async ({ page }) => {
  await page.goto('/personal-website/ai/zhi-shen-ding-nei/');
  await expect(page.locator('#s10')).toContainText('不展开讲完整阅读 workflow');
  await expect(page.locator('#s10')).toContainText('常用技能 deck');
  await expect(page.locator('#s4')).not.toContainText('候选卡片池');
});

test('Zhi Shen Ding Nei deck has no horizontal overflow on desktop and mobile', async ({ page }) => {
  for (const viewport of [
    { width: 1280, height: 800 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto('/personal-website/ai/zhi-shen-ding-nei/');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    expect(overflow).toBe(false);
  }
});

test('mobile responsibility visuals remain within the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/personal-website/ai/zhi-shen-ding-nei/#s5');
  const visual = page.locator('#s5 .figure').first();
  await expect(visual).toBeVisible();
  const box = await visual.boundingBox();
  expect(box?.width).toBeLessThanOrEqual(360);
});

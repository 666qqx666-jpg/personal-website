import { test, expect } from '@playwright/test';

test('AI listing links to Skill Desk', async ({ page }) => {
  await page.goto('/personal-website/ai/');
  const card = page.locator('.card', { hasText: 'Skill Desk' });
  await expect(card).toBeVisible();
  await expect(card).toContainText('常用技能');
  await expect(card).toContainText('可产品化');
  await expect(card).toHaveAttribute('href', '/personal-website/ai/skill-desk/');
  await expect(page.locator('.card', { hasText: 'reading-dialogue Skill' })).toHaveCount(0);
});

test('Skill Desk homepage shows six skill cards and the flagship entry', async ({ page }) => {
  await page.goto('/personal-website/ai/skill-desk/');
  await expect(page.getByRole('heading', { name: 'Skill Desk' })).toBeVisible();
  await expect(page.locator('.skill-card')).toHaveCount(6);
  await expect(page.locator('.desk-tabs')).toContainText('阅读与沉淀');
  await expect(page.locator('.desk-tabs')).toContainText('PRD / Spec');
  await expect(page.locator('.skill-card', { hasText: '深度阅读对话' })).toContainText('稳定使用');
  await expect(page.locator('.skill-card', { hasText: '深度阅读对话' })).toHaveAttribute(
    'href',
    '/personal-website/ai/skill-desk/reading-dialogue/'
  );
  await expect(page.locator('.product-lane')).toContainText('GitHub 开源项目');
  await expect(page.locator('.harness-link')).toHaveAttribute('href', '/personal-website/ai/knowledge-harness/');
});

test('reading-dialogue flagship has ten sections and core controls', async ({ page }) => {
  await page.goto('/personal-website/ai/skill-desk/reading-dialogue/');
  await expect(page.getByRole('heading', { name: 'reading-dialogue Skill：把深度阅读变成知识生产' })).toBeVisible();
  await expect(page.locator('main#deck section')).toHaveCount(10);
  await expect(page.locator('#s4')).toContainText('事故现场：《置身钉内》里的失控');
  await expect(page.locator('#s6')).toContainText('划线交流档');
  await expect(page.locator('#s7')).toContainText('单条划线最多两轮');
  await expect(page.locator('#s8')).toContainText('候选池，不直接制卡');
  await expect(page.locator('#s9')).toContainText('入库门禁');
  await expect(page.locator('#s10')).toContainText('开源潜力');
});

test('reading-dialogue flagship exposes timeline labels', async ({ page }) => {
  await page.goto('/personal-website/ai/skill-desk/reading-dialogue/');
  const timeline = page.locator('nav.timeline');
  await expect(timeline).toBeVisible();
  for (const label of ['入口', '问题', '直觉', '事故', '反思', '档位', '刹车', '候选', '门禁', '资产']) {
    await expect(timeline).toContainText(label);
  }
});

test('Skill Desk and Zhi Shen Ding Nei decks cross-link', async ({ page }) => {
  await page.goto('/personal-website/ai/skill-desk/reading-dialogue/');
  await expect(page.locator('#s10 a', { hasText: '查看一次真实阅读产出的产品判断' })).toHaveAttribute(
    'href',
    '/personal-website/ai/zhi-shen-ding-nei/'
  );

  await page.goto('/personal-website/ai/zhi-shen-ding-nei/');
  await expect(page.locator('#s10 a', { hasText: '查看这套阅读方法如何被做成 skill' })).toHaveAttribute(
    'href',
    '/personal-website/ai/skill-desk/reading-dialogue/'
  );
});

test('Skill Desk pages have no horizontal overflow on desktop and mobile', async ({ page }) => {
  for (const route of ['/personal-website/ai/skill-desk/', '/personal-website/ai/skill-desk/reading-dialogue/']) {
    for (const viewport of [
      { width: 1280, height: 800 },
      { width: 390, height: 844 },
    ]) {
      await page.setViewportSize(viewport);
      await page.goto(route);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
      expect(overflow).toBe(false);
    }
  }
});

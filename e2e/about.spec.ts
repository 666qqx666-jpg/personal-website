import { expect, test } from '@playwright/test';

const expectedProjectOrder = [
  'ai',
  'site',
  'sales',
  'permissions',
  'analytics',
  'membership',
  'parking',
];

test('about page is a complete recruiter-first profile', async ({ page }) => {
  await page.goto('/about/');
  await expect(page.getByRole('heading', { level: 1, name: '钱麒祥' })).toBeVisible();
  await expect(page.getByText('AI PRODUCT MANAGER · HANGZHOU')).toBeVisible();
  await expect(page.getByText('把复杂业务系统，做成可落地的 AI 产品')).toBeVisible();
  await expect(page.getByAltText('钱麒祥个人照片')).toBeVisible();
  await expect(page.getByRole('heading', { name: '商业产品基本盘' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'AI 产品实践' })).toBeVisible();

  expect(await page.locator('[data-about-project]').evaluateAll((cards) =>
    cards.map((card) => card.getAttribute('data-project-id')),
  )).toEqual(expectedProjectOrder);

  for (const id of expectedProjectOrder) {
    const card = page.locator(`[data-about-project][data-project-id="${id}"]`);
    await expect(card.getByText('项目背景', { exact: true })).toBeVisible();
    await expect(card.getByText('关键行动', { exact: true })).toBeVisible();
    await expect(card.getByText('结果证据', { exact: true })).toBeVisible();
    await expect(card.getByText('能力关键词', { exact: true })).toBeVisible();
  }
  await expect(page.locator('[data-project-id="site"]').getByText('具体实现', { exact: true })).toBeVisible();
  await expect(page.locator('.timeline')).toBeVisible();
  await expect(page.locator('.skills')).toBeVisible();
});

test('about links are explicit and public copy excludes private fields', async ({ page }) => {
  await page.goto('/about/');
  const basePath = new URL(page.url()).pathname.replace(/about\/?$/, '');
  await expect(page.getByRole('link', { name: '下载 AI 产品经理简历' }).first())
    .toHaveAttribute('href', `${basePath}resume.pdf`);
  const primaryResumeLinks = page.getByRole('link', { name: '下载 AI 产品经理简历' });
  await expect(primaryResumeLinks).toHaveCount(2);
  expect(await primaryResumeLinks.evaluateAll((links) =>
    links.map((link) => link.getAttribute('download')),
  )).toEqual(['钱麒祥-AI产品经理.pdf', '钱麒祥-AI产品经理.pdf']);
  await expect(page.getByRole('link', { name: '简历 PDF' }))
    .toHaveAttribute('download', '钱麒祥-AI产品经理.pdf');
  await expect(page.getByRole('link', { name: 'B2B / SaaS 版' }))
    .toHaveAttribute('href', `${basePath}resume-b2b-saas.pdf`);
  await expect(page.locator('[data-project-id="ai"] a'))
    .toHaveAttribute('href', `${basePath}ai/knowledge-harness/`);
  await expect(page.locator('[data-project-id="site"] a'))
    .toHaveAttribute('href', 'https://github.com/666qqx666-jpg/personal-website');
  const mainText = await page.locator('main').innerText();
  expect(mainText).not.toContain('173 9571 1345');
  expect(mainText).not.toContain('2000.02');
});

test('about page stays within the mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/about/');
  expect(await page.evaluate(() =>
    document.documentElement.scrollWidth - window.innerWidth <= 1,
  )).toBe(true);
  await expect(page.locator('[data-about-project]')).toHaveCount(7);
});

test('about page removes motion when the visitor requests it', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/about/');
  const motion = await page.locator('.reveal').first().evaluate((element) => {
    const style = getComputedStyle(element);
    return { transitionDuration: style.transitionDuration, transform: style.transform };
  });
  expect(motion.transitionDuration).toBe('0s');
  expect(motion.transform).toBe('none');
});

test('about content remains visible without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/about/');
  await expect(page.getByRole('heading', { level: 1, name: '钱麒祥' })).toBeVisible();
  await expect(page.locator('[data-about-project]')).toHaveCount(7);
  await expect(page.locator('[data-project-id="sales"]')).toBeVisible();
  expect(await page.locator('.hero-copy.reveal').evaluate((element) => getComputedStyle(element).opacity)).toBe('1');
  expect(await page.locator('[data-project-id="sales"]').evaluate((element) => getComputedStyle(element).opacity)).toBe('1');
  await context.close();
});

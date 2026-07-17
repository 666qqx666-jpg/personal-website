import { test, expect } from '@playwright/test';

const route = '/projects/enterprise-permissions/';

test('projects listing exposes the enterprise permissions case', async ({ page }) => {
  await page.goto('/projects/');
  const card = page.locator('.card', { hasText: '多业务线企业权限体系' });

  await expect(card).toBeVisible();
  await expect(card).toContainText('共享同一套业务底座');
  await expect(card).toContainText('权限模型');
  await expect(card).toHaveAttribute('href', route);
});

test('deck renders eleven scenes and five chapter links', async ({ page }) => {
  await page.goto(route);

  await expect(page.getByRole('heading', { name: '同一套系统，为什么需要两种权限模型？' })).toBeVisible();
  await expect(page.locator('section[data-scene]')).toHaveCount(11);

  const nav = page.getByRole('navigation', { name: '企业权限体系案例章节' });
  for (const label of ['共同约束', '商场基线', '品牌分叉', '治理闭环', '真实运行']) {
    await expect(nav.getByRole('link', { name: label })).toBeVisible();
  }
});

test('deck keeps launched status, public scale, and contribution boundary accurate', async ({ page }) => {
  await page.goto(route);

  await expect(page.locator('#s2 [data-status="launched"]')).toHaveCount(2);
  await expect(page.locator('#s2')).toContainText('综合商场成员与权限体系');
  await expect(page.locator('#s2')).toContainText('连锁品牌组织与多维权限体系');
  await expect(page.locator('#s3')).toContainText('业务权限身份分离');
  await expect(page.locator('#s3')).toContainText('审计操作身份统一');
  await expect(page.locator('#s10')).toContainText('约 25 个综合商场');
  await expect(page.locator('#s10')).toContainText('约 30 个连锁品牌');
  await expect(page.locator('#s10')).toContainText('约 3,000 名已创建成员');
  await expect(page.locator('#s10')).toContainText('单客户 3 万多家门店');

  const body = await page.locator('body').innerText();
  expect(body).not.toContain('万能权限中台');
  expect(body).not.toContain('独立完成研发');
  expect(body).not.toContain('生产权限字典');
});

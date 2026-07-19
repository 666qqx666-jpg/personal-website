import { test, expect } from '@playwright/test';
test('about page has HR essentials', async ({ page }) => {
  await page.goto('/about/');
  await expect(page.getByText('求职意向：AI 产品经理', { exact: true })).toBeVisible();
  await expect(page.getByText(/Agent 工作流用于真实产品工作/)).toBeVisible();
  await expect(page.locator('.timeline')).toBeVisible();
  await expect(page.locator('.skills')).toBeVisible();
  await expect(page.getByRole('link', { name: 'AI 产品经理版', exact: true })).toHaveAttribute('href', '/resume.pdf');
  await expect(page.getByRole('link', { name: 'B2B / SaaS 版', exact: true })).toHaveAttribute('href', '/resume-b2b-saas.pdf');
  await expect(page.locator('.cta a[download]')).toHaveCount(2);
});

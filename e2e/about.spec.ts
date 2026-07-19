import { test, expect } from '@playwright/test';
test('about page has HR essentials', async ({ page }) => {
  await page.goto('./about/');
  const basePath = new URL(page.url()).pathname.replace(/about\/?$/, '');

  await expect(page.getByText('求职意向：AI 产品经理', { exact: true })).toBeVisible();
  await expect(page.getByText(/Agent 工作流用于真实产品工作/)).toBeVisible();
  await expect(page.locator('.timeline')).toBeVisible();
  await expect(page.locator('.skills')).toBeVisible();

  const aiResumeLink = page.getByRole('link', { name: 'AI 产品经理版', exact: true });
  const b2bResumeLink = page.getByRole('link', { name: 'B2B / SaaS 版', exact: true });
  await expect(aiResumeLink).toHaveAttribute('href', `${basePath}resume.pdf`);
  await expect(aiResumeLink).toHaveAttribute('download', '');
  await expect(b2bResumeLink).toHaveAttribute('href', `${basePath}resume-b2b-saas.pdf`);
  await expect(b2bResumeLink).toHaveAttribute('download', '');
  await expect(page.locator('.cta a[download]')).toHaveCount(2);
  await expect(page.getByRole('link', { name: /联系我/ })).not.toHaveAttribute('download', /.*/);
});

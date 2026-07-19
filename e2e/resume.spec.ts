import { expect, test } from '@playwright/test';

test('master resume renders every project in canonical order', async ({ page }) => {
  await page.goto('/resume/master/');

  await expect(page.locator('[data-resume-variant="master"]')).toBeVisible();
  expect(await page.locator('[data-project-id]').evaluateAll((projects) =>
    projects.map((project) => project.getAttribute('data-project-id')),
  )).toEqual([
    'ai',
    'sales',
    'permissions',
    'analytics',
    'membership',
    'parking',
  ]);
  await expect(page.getByText('2026.04–至今', { exact: true })).toBeVisible();
  await expect(page.getByText('2022.06–2023.12｜分两期建设', { exact: true })).toBeVisible();
});

test('AI one-page resume leads with AI and excludes unrelated projects', async ({ page }) => {
  await page.goto('/resume/ai/');

  expect(await page.locator('[data-project-id]').evaluateAll((projects) =>
    projects.map((project) => project.getAttribute('data-project-id')),
  )).toEqual([
    'ai',
    'sales',
    'permissions',
  ]);
  await expect(page.getByText(/9 份真实业务 PRD/)).toBeVisible();
  await expect(page.getByRole('heading', { name: '多平台会员运营体系' })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: '智慧停车 2.0' })).toHaveCount(0);
});

test('B2B one-page resume ends with a short AI proof point', async ({ page }) => {
  await page.goto('/resume/b2b/');

  expect(await page.locator('[data-project-id]').evaluateAll((projects) =>
    projects.map((project) => project.getAttribute('data-project-id')),
  )).toEqual([
    'sales',
    'permissions',
    'analytics',
    'ai',
  ]);
  await expect(page.locator('[data-project-id="ai"]')).toHaveAttribute('data-density', 'short');
  await expect(page.getByRole('heading', { name: '多平台会员运营体系' })).toHaveCount(0);
});

for (const variant of ['ai', 'b2b']) {
  test(`${variant} print layout fits a single A4 sheet`, async ({ page }) => {
    await page.setViewportSize({ width: 794, height: 1123 });
    await page.emulateMedia({ media: 'print' });
    await page.goto(`/resume/${variant}/`);

    const sheets = page.locator('.resume-sheet');
    await expect(sheets).toHaveCount(1);
    expect(
      await sheets.evaluate((sheet) => sheet.scrollHeight <= sheet.clientHeight + 1),
    ).toBe(true);
  });
}

for (const variant of ['master', 'ai', 'b2b']) {
  test(`${variant} resume has no horizontal overflow on mobile`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/resume/${variant}/`);

    expect(
      await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth <= 1),
    ).toBe(true);
  });
}

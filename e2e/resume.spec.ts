import { execFile } from 'node:child_process';
import { cp, mkdtemp, readFile, realpath, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { promisify } from 'node:util';

import { expect, test } from '@playwright/test';

const A4_WIDTH_PX = 210 / 25.4 * 96;
const A4_HEIGHT_PX = 297 / 25.4 * 96;
const A4_TOLERANCE_PX = 2;
const execFileAsync = promisify(execFile);

test('static resume links honor Astro base path', async () => {
  const projectRoot = resolve('.');
  const buildRoot = await realpath(await mkdtemp(join(tmpdir(), 'resume-base-path-')));
  const outDir = join(buildRoot, 'dist');

  try {
    await Promise.all([
      cp(join(projectRoot, 'src'), join(buildRoot, 'src'), { recursive: true }),
      cp(join(projectRoot, 'public'), join(buildRoot, 'public'), { recursive: true }),
      cp(join(projectRoot, 'node_modules'), join(buildRoot, 'node_modules'), { recursive: true }),
      cp(join(projectRoot, 'package.json'), join(buildRoot, 'package.json')),
      cp(join(projectRoot, 'tsconfig.json'), join(buildRoot, 'tsconfig.json')),
    ]);
    await writeFile(join(buildRoot, 'astro.config.mjs'), `export default {
  site: 'https://qqx.life',
  cacheDir: './.astro-cache',
  vite: { cacheDir: './.vite-cache' },
};
`);

    await execFileAsync(process.execPath, [
      join(buildRoot, 'node_modules/astro/astro.js'),
      'build',
      '--root',
      buildRoot,
      '--base',
      '/personal-website',
      '--outDir',
      outDir,
      '--silent',
    ], { cwd: projectRoot });

    for (const variant of ['ai', 'b2b']) {
      const html = await readFile(join(outDir, 'resume', variant, 'index.html'), 'utf8');
      expect(html).toContain('href="/personal-website/about/"');
      expect(html).not.toContain('href="/about/"');
    }
  } finally {
    await rm(buildRoot, { recursive: true, force: true });
  }
});

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
    await page.evaluate(async () => {
      await document.fonts.ready;
    });

    const sheets = page.locator('.resume-sheet');
    await expect(sheets).toHaveCount(1);
    expect(
      await sheets.evaluate((sheet) => sheet.scrollHeight <= sheet.clientHeight + 1),
    ).toBe(true);

    const sheetRect = await sheets.evaluate((sheet) => {
      const { width, height } = sheet.getBoundingClientRect();
      return { width, height };
    });
    expect(Math.abs(sheetRect.width - A4_WIDTH_PX)).toBeLessThanOrEqual(A4_TOLERANCE_PX);
    expect(Math.abs(sheetRect.height - A4_HEIGHT_PX)).toBeLessThanOrEqual(A4_TOLERANCE_PX);

    const actions = page.locator('.screen-actions');
    await expect(actions).toHaveCount(1);
    expect(await actions.evaluate((element) => getComputedStyle(element).display)).toBe('none');

    const documentHeight = await page.evaluate(() => Math.max(
      document.documentElement.scrollHeight,
      document.body.scrollHeight,
    ));
    expect(documentHeight).toBeLessThanOrEqual(A4_HEIGHT_PX + A4_TOLERANCE_PX);
  });
}

for (const variant of ['master', 'ai', 'b2b']) {
  test(`${variant} resume uses the standalone output layout`, async ({ page }) => {
    const response = await page.goto(`/resume/${variant}/`);

    expect(response?.ok()).toBe(true);
    await expect(page.locator(`[data-resume-variant="${variant}"]`)).toBeVisible();
    await expect(page.locator('header.nav')).toHaveCount(0);
    await expect(page.locator('footer.footer')).toHaveCount(0);
    await expect(page.locator('.screen-actions')).toHaveCount(1);
    await expect(page.locator('.screen-actions')).toBeVisible();
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

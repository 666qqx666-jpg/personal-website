import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '@playwright/test';

const cases = [
  { path: '/', selector: '[data-selected-work]' },
  { path: '/projects/', selector: 'main' },
  { path: '/ai/knowledge-harness/#s6', selector: '#s6' },
  { path: '/ai/knowledge-harness/#s7', selector: '#s7' },
  { path: '/ai/skill-desk/', selector: '.skill-desk-page' },
] as const;
const themes = ['light', 'dark'] as const;
const viewports = [
  { name: 'desktop', width: 1280, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
] as const;

for (const theme of themes) for (const viewport of viewports) for (const item of cases) test(
  `${item.path} ${theme} ${viewport.name} incremental surface has no axe violations`,
  async ({ page }) => {
  await page.setViewportSize({ width: viewport.width, height: viewport.height });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript((selectedTheme) => localStorage.setItem('theme', selectedTheme), theme);
  await page.goto(item.path);
  await page.addStyleTag({ content: '.reveal { opacity: 1 !important; transform: none !important; }' });
  const results = await new AxeBuilder({ page }).include(item.selector).analyze();
  expect(results.violations).toEqual([]);
  }
);

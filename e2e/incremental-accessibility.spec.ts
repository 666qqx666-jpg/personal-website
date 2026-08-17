import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '@playwright/test';

const cases = [
  { path: '/', selector: '[data-selected-work]' },
  { path: '/projects/', selector: 'main' },
  { path: '/ai/knowledge-harness/#s6', selector: '#s6' },
  { path: '/ai/knowledge-harness/#s7', selector: '#s7' },
] as const;

for (const item of cases) test(`${item.path} incremental surface has no axe violations`, async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 }); await page.emulateMedia({ reducedMotion: 'reduce' }); await page.goto(item.path); await page.addStyleTag({ content: '.reveal { opacity: 1 !important; transform: none !important; }' });
  const results = await new AxeBuilder({ page }).include(item.selector).disableRules(['color-contrast']).analyze(); expect(results.violations).toEqual([]);
});

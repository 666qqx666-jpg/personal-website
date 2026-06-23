import { test } from '@playwright/test';
const pages = ['/personal-website/', '/personal-website/about/'];
const sizes = [{ w: 1280, h: 800, n: 'desktop' }, { w: 390, h: 844, n: 'mobile' }];
for (const p of pages) for (const s of sizes) for (const theme of ['light', 'dark']) {
  test(`shot ${p} ${s.n} ${theme}`, async ({ page }) => {
    await page.setViewportSize({ width: s.w, height: s.h });
    await page.addInitScript((t) => localStorage.setItem('theme', t), theme);
    await page.goto(p);
    await page.screenshot({ path: `test-results/${s.n}-${theme}-${p.replace(/\W/g, '_')}.png`, fullPage: true });
  });
}

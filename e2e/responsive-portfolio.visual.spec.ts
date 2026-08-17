import { test, expect, type Page } from '@playwright/test';

async function prepare(page: Page, viewport: { width: number; height: number }, theme: 'light' | 'dark') {
  await page.setViewportSize(viewport);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript((selectedTheme) => localStorage.setItem('theme', selectedTheme), theme);
}

async function freezeMotion(page: Page) {
  await page.addStyleTag({
    content: 'astro-dev-toolbar{display:none!important}*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}',
  });
}

test('selected work tablet visual', async ({ page }) => {
  await prepare(page, { width: 768, height: 1024 }, 'light');
  await page.goto('/');
  await freezeMotion(page);
  await expect(page.locator('[data-selected-work]')).toHaveScreenshot('selected-work-tablet-light.png', { animations: 'disabled' });
});

test('selected work mobile visual', async ({ page }) => {
  await prepare(page, { width: 390, height: 844 }, 'light');
  await page.goto('/');
  await freezeMotion(page);
  await expect(page.locator('[data-selected-work]')).toHaveScreenshot('selected-work-mobile-light.png', { animations: 'disabled' });
});

test('Knowledge Harness evaluation tablet visual', async ({ page }) => {
  await prepare(page, { width: 834, height: 1194 }, 'dark');
  await page.goto('/ai/knowledge-harness/#s6');
  await freezeMotion(page);
  await page.addStyleTag({
    content: '.deck-back,.deck-theme-toggle,.timeline{display:none!important}main#deck{height:auto!important;overflow:visible!important;scroll-snap-type:none!important}main#deck>section{height:auto!important;min-height:0!important}',
  });
  const section = page.locator('#s6');
  await section.scrollIntoViewIfNeeded();
  await expect(section).toHaveScreenshot('knowledge-harness-s6-tablet-dark.png', {
    animations: 'disabled',
    maxDiffPixelRatio: 0.015,
  });
});

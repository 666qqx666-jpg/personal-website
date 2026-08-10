import { test, expect } from '@playwright/test';

const desktopSections = ['s2', 's3', 's4', 's5', 's6', 's7', 's8', 's9', 's10'] as const;
const mobileSections = ['s3', 's6', 's9'] as const;

async function prepare(page: import('@playwright/test').Page, id: string, viewport: { width: number; height: number }) {
  await page.setViewportSize(viewport);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => localStorage.setItem('theme', 'dark'));
  await page.goto(`/ai/knowledge-harness/#${id}`);
  await page.addStyleTag({ content: 'astro-dev-toolbar { display: none !important; } *, *::before, *::after { animation: none !important; transition: none !important; caret-color: transparent !important; }' });
  const section = page.locator(`#${id}`);
  await section.scrollIntoViewIfNeeded();
  await expect(section).toBeVisible();
  return section;
}

for (const id of desktopSections) {
  test(`Knowledge Harness ${id} desktop visual`, async ({ page }) => {
    const section = await prepare(page, id, { width: 1280, height: 800 });
    await expect(section).toHaveScreenshot(`knowledge-harness-${id}-desktop.png`, { animations: 'disabled' });
  });
}

for (const id of mobileSections) {
  test(`Knowledge Harness ${id} mobile visual`, async ({ page }) => {
    const section = await prepare(page, id, { width: 390, height: 844 });
    await expect(section).toHaveScreenshot(`knowledge-harness-${id}-mobile.png`, { animations: 'disabled' });
  });
}

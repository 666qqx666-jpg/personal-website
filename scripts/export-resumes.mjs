import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { mkdir, rename, rm } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const host = '127.0.0.1';
const port = 4322;
const baseURL = `http://${host}:${port}`;
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const outputs = [
  { route: '/resume/ai/', file: 'public/resume.pdf' },
  { route: '/resume/b2b/', file: 'public/resume-b2b-saas.pdf' },
];

async function waitForServer() {
  for (let attempt = 0; attempt < 120; attempt += 1) {
    try {
      const response = await fetch(baseURL);
      if (response.ok) return;
    } catch {
      // The Astro dev server is still starting.
    }

    await new Promise((resolveWait) => setTimeout(resolveWait, 250));
  }

  throw new Error(`Astro dev server did not start at ${baseURL}`);
}

const server = spawn(
  npmCommand,
  ['run', 'dev', '--', '--host', host, '--port', String(port)],
  { stdio: 'inherit' },
);

let browser;

try {
  await waitForServer();
  browser = await chromium.launch();

  const page = await browser.newPage({ viewport: { width: 794, height: 1123 } });
  await page.emulateMedia({ media: 'print' });

  for (const output of outputs) {
    await page.goto(`${baseURL}${output.route}`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready.then(() => undefined));

    const fits = await page
      .locator('.resume-sheet')
      .evaluate((element) => element.scrollHeight <= element.clientHeight + 1);
    if (!fits) throw new Error(`${output.route} exceeds one A4 sheet`);

    const target = resolve(output.file);
    const temporary = `${target}.tmp`;
    await mkdir(dirname(target), { recursive: true });
    await rm(temporary, { force: true });

    try {
      await page.pdf({
        path: temporary,
        printBackground: true,
        preferCSSPageSize: true,
      });
      await rename(temporary, target);
    } catch (error) {
      await rm(temporary, { force: true });
      throw error;
    }
  }
} finally {
  try {
    await browser?.close();
  } finally {
    server.kill('SIGTERM');
  }
}

import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { mkdir, rename, rm } from 'node:fs/promises';
import { createServer as createNetServer } from 'node:net';
import { dirname, resolve } from 'node:path';

const host = '127.0.0.1';
const port = 4322;
const baseURL = `http://${host}:${port}`;
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const outputs = [
  { route: '/resume/ai/', variant: 'ai', file: 'public/resume.pdf' },
  { route: '/resume/b2b/', variant: 'b2b', file: 'public/resume-b2b-saas.pdf' },
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

async function assertPortAvailable() {
  const probe = createNetServer();

  try {
    await new Promise((resolveListen, rejectListen) => {
      probe.once('error', rejectListen);
      probe.listen({ host, port, exclusive: true }, () => {
        probe.off('error', rejectListen);
        resolveListen();
      });
    });
  } catch (error) {
    throw new Error(`Resume export port ${baseURL} is unavailable: ${error.message}`);
  }

  await new Promise((resolveClose, rejectClose) => {
    probe.close((error) => error ? rejectClose(error) : resolveClose());
  });
}

await assertPortAvailable();

const server = spawn(
  npmCommand,
  ['run', 'dev', '--', '--host', host, '--port', String(port), '--strictPort'],
  { stdio: 'inherit' },
);

let browser;
let serverExited = false;
const serverExit = new Promise((resolveExit) => {
  server.once('error', (error) => {
    serverExited = true;
    resolveExit({ error, code: server.exitCode, signal: server.signalCode });
  });
  server.once('exit', (code, signal) => {
    serverExited = true;
    resolveExit({ code, signal });
  });
});

function serverExitError(result) {
  const details = `code=${result.code ?? 'null'}, signal=${result.signal ?? 'null'}`;
  if (result.error) {
    return new Error(`Astro dev server failed to spawn (${details}): ${result.error.message}`);
  }

  return new Error(`Astro dev server exited before resume export completed (${details})`);
}

async function waitForServerExit(timeoutMs) {
  if (serverExited) return true;

  let timeout;
  const exited = await Promise.race([
    serverExit.then(() => true),
    new Promise((resolveTimeout) => {
      timeout = setTimeout(() => resolveTimeout(false), timeoutMs);
    }),
  ]);
  clearTimeout(timeout);
  return exited;
}

async function stopServer() {
  if (serverExited) return;

  server.kill(process.platform === 'win32' ? undefined : 'SIGTERM');
  if (await waitForServerExit(2_000)) return;

  server.kill('SIGKILL');
  if (!await waitForServerExit(2_000)) {
    throw new Error(`Astro dev server did not stop (pid=${server.pid ?? 'unknown'})`);
  }
}

async function cleanTemporaryFiles() {
  await Promise.all(outputs.map(({ file }) => rm(`${resolve(file)}.tmp`, { force: true })));
}

async function exportResumes() {
  await waitForServer();
  browser = await chromium.launch();

  const page = await browser.newPage({ viewport: { width: 794, height: 1123 } });
  await page.emulateMedia({ media: 'print' });

  for (const output of outputs) {
    const response = await page.goto(`${baseURL}${output.route}`, { waitUntil: 'networkidle' });
    if (!response?.ok()) {
      throw new Error(`${output.route} returned ${response?.status() ?? 'no response'}`);
    }

    await page
      .locator(`[data-resume-variant="${output.variant}"]`)
      .waitFor({ state: 'visible', timeout: 5_000 });
    await page.evaluate(() => document.fonts.ready.then(() => undefined));

    const fits = await page
      .locator('.resume-sheet')
      .evaluate((element) => element.scrollHeight <= element.clientHeight + 1);
    if (!fits) throw new Error(`${output.route} exceeds one A4 sheet`);

    const target = resolve(output.file);
    const temporary = `${target}.tmp`;
    await mkdir(dirname(target), { recursive: true });
    await rm(temporary, { force: true });

    await page.pdf({
      path: temporary,
      printBackground: true,
      preferCSSPageSize: true,
    });
    await rename(temporary, target);
  }
}

try {
  await Promise.race([
    exportResumes(),
    serverExit.then((result) => { throw serverExitError(result); }),
  ]);
} finally {
  try {
    await browser?.close();
  } finally {
    try {
      await cleanTemporaryFiles();
    } finally {
      await stopServer();
    }
  }
}

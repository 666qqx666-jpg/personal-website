import { readFileSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { expect, test } from '@playwright/test';

test('AI product manager resume PDF is a real exported document', () => {
  const pdf = readFileSync('public/resume.pdf');

  expect(pdf.subarray(0, 5).toString()).toBe('%PDF-');
  expect(pdf.byteLength).toBe(278_835);
  expect(createHash('sha256').update(pdf).digest('hex')).toBe(
    'b3bef0977bde3b89c6b2ec6fe8baf23e645e8099ca4d230dc028eff838cfc8d3',
  );
});

test('B2B / SaaS resume PDF is a real exported document', () => {
  const pdf = readFileSync('public/resume-b2b-saas.pdf');

  expect(pdf.subarray(0, 5).toString()).toBe('%PDF-');
  expect(pdf.byteLength).toBeGreaterThan(20_000);
});

test('resume export refuses a different server already using its port', async () => {
  const aiPath = 'public/resume.pdf';
  const b2bPath = 'public/resume-b2b-saas.pdf';
  const originalAi = readFileSync(aiPath);
  const originalB2b = readFileSync(b2bPath);
  const fakeServer = createServer((_request, response) => {
    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    response.end(`<!doctype html>
      <html>
        <head><style>.resume-sheet { height: 100px; overflow: hidden; }</style></head>
        <body><main class="resume-sheet">Not an Astro resume route</main></body>
      </html>`);
  });

  await new Promise<void>((resolve, reject) => {
    fakeServer.once('error', reject);
    fakeServer.listen(4322, '127.0.0.1', () => {
      fakeServer.off('error', reject);
      resolve();
    });
  });

  try {
    const child = spawn(process.execPath, ['scripts/export-resumes.mjs'], {
      cwd: process.cwd(),
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => { stdout += chunk.toString(); });
    child.stderr.on('data', (chunk) => { stderr += chunk.toString(); });

    const result = await new Promise<{ code: number | null; signal: NodeJS.Signals | null }>(
      (resolve, reject) => {
        let timedOut = false;
        const timeout = setTimeout(() => {
          timedOut = true;
          child.kill('SIGKILL');
        }, 20_000);

        child.once('error', (error) => {
          clearTimeout(timeout);
          reject(error);
        });
        child.once('close', (code, signal) => {
          clearTimeout(timeout);
          if (timedOut) {
            reject(new Error(`resume export timed out\nstdout:\n${stdout}\nstderr:\n${stderr}`));
            return;
          }
          resolve({ code, signal });
        });
      },
    );

    expect(
      result.code,
      `export unexpectedly succeeded\nstdout:\n${stdout}\nstderr:\n${stderr}`,
    ).not.toBe(0);
    expect(readFileSync(aiPath).equals(originalAi)).toBe(true);
    expect(readFileSync(b2bPath).equals(originalB2b)).toBe(true);
  } finally {
    await Promise.all([
      writeFile(aiPath, originalAi),
      writeFile(b2bPath, originalB2b),
    ]);
    await new Promise<void>((resolve, reject) => {
      fakeServer.close((error) => error ? reject(error) : resolve());
    });
  }
});

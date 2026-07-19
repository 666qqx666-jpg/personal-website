import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';

test('AI product manager resume PDF is a real exported document', () => {
  const pdf = readFileSync('public/resume.pdf');

  expect(pdf.subarray(0, 5).toString()).toBe('%PDF-');
  expect(pdf.byteLength).toBeGreaterThan(20_000);
});

test('B2B / SaaS resume PDF is a real exported document', () => {
  const pdf = readFileSync('public/resume-b2b-saas.pdf');

  expect(pdf.subarray(0, 5).toString()).toBe('%PDF-');
  expect(pdf.byteLength).toBeGreaterThan(20_000);
});

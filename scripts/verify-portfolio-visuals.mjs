import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const manifestPath = join(repoRoot, 'src/data/portfolioVisuals.json');
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
const errors = [];
const ids = new Set();

for (const asset of manifest) {
  if (ids.has(asset.id)) errors.push(`duplicate id: ${asset.id}`);
  ids.add(asset.id);
  if (!['real-sanitized', 'structural-redraw'].includes(asset.kind)) errors.push(`invalid kind: ${asset.id}`);
  if (!asset.src.startsWith('/portfolio/')) errors.push(`invalid public path: ${asset.id}`);
  if (!Number.isInteger(asset.width) || asset.width <= 0 || !Number.isInteger(asset.height) || asset.height <= 0) errors.push(`invalid dimensions: ${asset.id}`);
  const absolutePath = join(repoRoot, 'public', asset.src.replace(/^\//, ''));
  try {
    const buffer = await readFile(absolutePath);
    const actual = createHash('sha256').update(buffer).digest('hex');
    if (actual !== asset.sha256) errors.push(`sha256 mismatch: ${asset.id} expected=${asset.sha256} actual=${actual}`);
  } catch (error) {
    errors.push(`missing asset: ${asset.id} (${error.code ?? 'read-error'})`);
  }
}

if (errors.length > 0) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(`portfolio visuals verified: ${manifest.length}`);

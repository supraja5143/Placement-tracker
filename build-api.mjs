import { build } from 'esbuild';
import { renameSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

// Find all API function entry points (skip _ prefixed files/dirs)
function findApiEntryPoints(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    if (entry.startsWith('_')) continue;
    const fullPath = join(dir, entry);
    if (statSync(fullPath).isDirectory()) {
      files.push(...findApiEntryPoints(fullPath));
    } else if (entry.endsWith('.ts')) {
      files.push(fullPath);
    }
  }
  return files;
}

const entryPoints = findApiEntryPoints('api');
console.log('Bundling API functions:', entryPoints);

// Bundle each API function into a self-contained .js file
// All _lib/ and shared/ imports get inlined into each function
await build({
  entryPoints,
  bundle: true,
  outdir: 'api',
  outbase: 'api',
  platform: 'node',
  format: 'esm',
  target: 'node20',
  allowOverwrite: true,
  external: ['@vercel/node'],
  packages: 'external',
});

// Remove original .ts files so Vercel uses the bundled .js files
// (Vercel prioritizes .ts over .js, so we need to remove .ts)
for (const file of entryPoints) {
  renameSync(file, file + '.bak');
}

console.log(`Successfully bundled ${entryPoints.length} API functions`);

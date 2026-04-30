/**
 * Build script for @clustta/icons
 * Compiles TypeScript source to ESM + CJS bundles with type declarations.
 */

import { build } from 'esbuild';
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname);
const SRC = resolve(ROOT, 'src');

// Ensure generated icons exist
if (!existsSync(resolve(SRC, 'index.generated.ts'))) {
  console.error('❌ Run `pnpm run build` at the monorepo root first to generate icon modules.');
  process.exit(1);
}

// ESM build
await build({
  entryPoints: [resolve(SRC, 'index.ts')],
  outdir: resolve(ROOT, 'dist/esm'),
  format: 'esm',
  bundle: true,
  splitting: true,
  outExtension: { '.js': '.mjs' },
  platform: 'neutral',
  target: 'es2022',
  sourcemap: true,
  minify: false,
  treeShaking: true,
});

// CJS build
await build({
  entryPoints: [resolve(SRC, 'index.ts')],
  outdir: resolve(ROOT, 'dist/cjs'),
  format: 'cjs',
  bundle: true,
  platform: 'neutral',
  target: 'es2022',
  sourcemap: true,
  minify: false,
});

// Type declarations
execSync('npx tsc --project tsconfig.json', { cwd: ROOT, stdio: 'inherit' });

console.log('✅ @clustta/icons built successfully');

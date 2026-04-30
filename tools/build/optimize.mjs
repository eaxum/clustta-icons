/**
 * Standalone SVG optimizer script.
 * Usage: node tools/build/optimize.mjs [--dry-run]
 *
 * Reads all SVGs from /icons/, runs SVGO, and writes back in-place.
 */

import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { optimize } from 'svgo';

const ROOT = resolve(import.meta.dirname, '../..');
const ICONS_DIR = join(ROOT, 'icons');
const DRY_RUN = process.argv.includes('--dry-run');

async function loadSvgoConfig() {
  const configPath = join(ROOT, 'svgo.config.mjs');
  const config = await import(`file://${configPath}`);
  return config.default;
}

async function run() {
  const svgoConfig = await loadSvgoConfig();
  const files = (await readdir(ICONS_DIR)).filter(f => f.endsWith('.svg'));

  console.log(`Optimizing ${files.length} SVGs${DRY_RUN ? ' (dry run)' : ''}...\n`);

  let totalSaved = 0;
  let errors = [];

  for (const file of files) {
    const filePath = join(ICONS_DIR, file);
    const raw = await readFile(filePath, 'utf-8');

    let result;
    try {
      result = optimize(raw, { ...svgoConfig, path: filePath });
    } catch (err) {
      errors.push({ file, error: err.message });
      console.log(`  ⚠️  ${file}: SKIPPED (${err.message.slice(0, 60)})`);
      continue;
    }

    const saved = raw.length - result.data.length;
    totalSaved += saved;

    if (saved > 0) {
      console.log(`  ${file}: ${raw.length}B → ${result.data.length}B (saved ${saved}B)`);
    }

    if (!DRY_RUN) {
      await writeFile(filePath, result.data);
    }
  }

  console.log(`\nTotal saved: ${totalSaved}B across ${files.length} files`);
  if (errors.length > 0) {
    console.log(`\n⚠️  ${errors.length} file(s) had errors:`);
    errors.forEach(({ file, error }) => console.log(`  - ${file}: ${error.slice(0, 80)}`));
  }
}

run().catch(console.error);

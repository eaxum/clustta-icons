/**
 * Copy original SVGs from clustta-client/frontend/public/icons/
 * into this repo's icon variant directories.
 *
 * Source layout:
 *   public/icons/outline/ → icons/          (default outline-1.5 variant)
 *   public/icons/solid/   → icons-solid/    (solid variant)
 */

import { readdir, mkdir, copyFile, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

const PUBLIC_ICONS = resolve(import.meta.dirname, '../../clustta-client/frontend/public/icons');

const VARIANT_MAP = {
  'outline': resolve(import.meta.dirname, '../icons'),
  'solid': resolve(import.meta.dirname, '../icons-solid'),
};

async function copyVariant(sourceSubdir, targetDir) {
  const sourceDir = join(PUBLIC_ICONS, sourceSubdir);
  if (!existsSync(sourceDir)) {
    console.log(`  ⚠️  ${sourceSubdir}/ not found, skipping`);
    return 0;
  }

  await mkdir(targetDir, { recursive: true });

  // Clear target directory
  if (existsSync(targetDir)) {
    const existing = (await readdir(targetDir)).filter(f => f.endsWith('.svg'));
    for (const f of existing) {
      await rm(join(targetDir, f));
    }
  }

  const files = (await readdir(sourceDir)).filter(f => f.endsWith('.svg'));
  for (const file of files) {
    await copyFile(join(sourceDir, file), join(targetDir, file));
  }

  console.log(`  ${sourceSubdir}/ → ${targetDir.split(/[\\/]/).pop()}/ (${files.length} icons)`);
  return files.length;
}

async function main() {
  console.log('Copying original SVGs from clustta-client/frontend/public/icons/\n');

  let total = 0;
  for (const [subdir, targetDir] of Object.entries(VARIANT_MAP)) {
    total += await copyVariant(subdir, targetDir);
  }

  // Also copy root-only icons (ones in public/icons/ but not in outline/)
  const outlineDir = join(PUBLIC_ICONS, 'outline');
  const iconsDir = VARIANT_MAP['outline'];
  const outlineNames = new Set((await readdir(outlineDir)).filter(f => f.endsWith('.svg')));
  const rootFiles = (await readdir(PUBLIC_ICONS)).filter(f => f.endsWith('.svg'));

  let rootExtra = 0;
  for (const file of rootFiles) {
    const kebabName = file.replace(/_/g, '-');
    if (!outlineNames.has(kebabName)) {
      await copyFile(join(PUBLIC_ICONS, file), join(iconsDir, kebabName));
      rootExtra++;
    }
  }
  total += rootExtra;
  console.log(`  root (extras) → icons/ (${rootExtra} icons not in outline/)`);

  console.log(`\n✅ Copied ${total} SVGs total`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

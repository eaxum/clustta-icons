/**
 * Clustta Icons — Build Pipeline
 *
 * Reads source SVGs from /icons/, optimizes them with SVGO,
 * parses them into icon node data, and generates:
 *   1. Core package exports (icon data arrays)
 *   2. Vue package exports (Vue components)
 *   3. Barrel index files for both packages
 */

import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, basename, resolve } from 'node:path';
import { optimize } from 'svgo';
import { parseSvg } from './parse-svg.mjs';
import { generateCoreIcon } from './generate-core.mjs';
import { generateVueIcon } from './generate-vue.mjs';
import { toPascalCase } from './utils.mjs';

const ROOT = resolve(import.meta.dirname, '../..');
const ICONS_DIR = join(ROOT, 'icons');
const CORE_DIST = join(ROOT, 'packages/clustta-icons/src/icons');
const VUE_DIST = join(ROOT, 'packages/clustta-icons-vue/src/icons');

async function loadSvgoConfig() {
  const configPath = join(ROOT, 'svgo.config.mjs');
  const config = await import(`file://${configPath}`);
  return config.default;
}

async function build() {
  console.log('🔨 Clustta Icons — Build starting...\n');

  // Ensure icons directory exists
  if (!existsSync(ICONS_DIR)) {
    console.error(`❌ Icons directory not found: ${ICONS_DIR}`);
    console.error('   Create SVG files in /icons/ and run again.');
    process.exit(1);
  }

  // Read all SVG files
  const files = (await readdir(ICONS_DIR)).filter(f => f.endsWith('.svg'));

  if (files.length === 0) {
    console.error('❌ No SVG files found in /icons/');
    process.exit(1);
  }

  console.log(`📦 Found ${files.length} icon(s)\n`);

  // Ensure output directories
  await mkdir(CORE_DIST, { recursive: true });
  await mkdir(VUE_DIST, { recursive: true });

  const svgoConfig = await loadSvgoConfig();
  const icons = [];

  for (const file of files) {
    const name = basename(file, '.svg');
    const componentName = `Ci${toPascalCase(name)}`;
    const raw = await readFile(join(ICONS_DIR, file), 'utf-8');

    // Optimize with SVGO
    const result = optimize(raw, {
      ...svgoConfig,
      path: join(ICONS_DIR, file),
    });

    // Parse SVG into node tree
    const nodes = parseSvg(result.data);

    if (!nodes) {
      console.warn(`  ⚠️  Skipping ${file} — could not parse SVG`);
      continue;
    }

    // Generate core icon module
    const coreCode = generateCoreIcon(name, componentName, nodes);
    await writeFile(join(CORE_DIST, `${name}.ts`), coreCode);

    // Generate Vue icon module
    const vueCode = generateVueIcon(name, componentName, nodes);
    await writeFile(join(VUE_DIST, `${componentName}.ts`), vueCode);

    icons.push({ name, componentName });
    console.log(`  ✓ ${name} → ${componentName}`);
  }

  // Generate barrel exports
  await generateCoreIndex(icons);
  await generateVueIndex(icons);

  console.log(`\n✅ Built ${icons.length} icons successfully`);
}

async function generateCoreIndex(icons) {
  const lines = [
    '// Auto-generated — do not edit manually',
    "export { defaultAttributes } from './types.js';",
    "export type { IconData, IconNode, IconNodeChild, CreateIconOptions } from './types.js';",
    "export { toSvg, createElement } from './create-icon.js';",
    '',
    '// Icon data exports',
    ...icons.map(({ name, componentName }) =>
      `export { ${componentName} } from './icons/${name}.js';`
    ),
    '',
  ];

  const indexPath = join(ROOT, 'packages/clustta-icons/src/index.generated.ts');
  await writeFile(indexPath, lines.join('\n'));
}

async function generateVueIndex(icons) {
  const lines = [
    '// Auto-generated — do not edit manually',
    "export { createCiIcon } from './create-ci-icon.js';",
    "export type { CiIconProps } from './create-ci-icon.js';",
    '',
    '// Icon component exports',
    ...icons.map(({ componentName }) =>
      `export { default as ${componentName} } from './icons/${componentName}.js';`
    ),
    '',
  ];

  const indexPath = join(ROOT, 'packages/clustta-icons-vue/src/index.generated.ts');
  await writeFile(indexPath, lines.join('\n'));
}

build().catch((err) => {
  console.error('Build failed:', err);
  process.exit(1);
});

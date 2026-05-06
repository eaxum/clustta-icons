/**
 * Clustta Icons — Build Pipeline
 *
 * Reads source SVGs from /icons/ (and variant directories),
 * optimizes them with SVGO, and generates:
 *   1. Core package exports (raw SVG data)
 *   2. Vue package exports (Vue components with raw SVG innerHTML)
 *   3. Barrel index files for both packages
 *
 * Variant directories:
 *   icons/           → default variant (outline-1.5)
 *   icons-outline-1/ → outline-1 variant (future)
 *   icons-solid/     → solid variant (future)
 *   icons-twotone/   → twotone variant (future)
 */

import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, basename, resolve } from 'node:path';
import { optimize } from 'svgo';
import { generateCoreIcon } from './generate-core.mjs';
import { generateVueIcon } from './generate-vue.mjs';
import { toPascalCase } from './utils.mjs';

const ROOT = resolve(import.meta.dirname, '../..');
const CORE_DIST = join(ROOT, 'packages/clustta-icons/src/icons');
const VUE_DIST = join(ROOT, 'packages/clustta-icons-vue/src/icons');

// Variant directory mapping: folder name → variant key
const VARIANT_DIRS = {
  'icons': 'outline-1.5',
  'icons-outline-1': 'outline-1',
  'icons-solid': 'solid',
  'icons-twotone': 'twotone',
};

async function loadSvgoConfig() {
  const configPath = join(ROOT, 'svgo.config.mjs');
  const config = await import(`file://${configPath}`);
  return config.default;
}

/**
 * Extracts SVG root attributes and inner content from an optimized SVG string.
 */
function extractSvgParts(svgString) {
  const attrMatch = svgString.match(/<svg([^>]*)>([\s\S]*)<\/svg>/);
  if (!attrMatch) return null;

  const attrsString = attrMatch[1];
  const innerHTML = attrMatch[2].trim();

  // Parse attributes
  const attrs = {};
  const attrRegex = /([\w-:]+)="([^"]*)"/g;
  let match;
  while ((match = attrRegex.exec(attrsString)) !== null) {
    // Skip xmlns as we add it in the component
    if (match[1] !== 'xmlns') {
      attrs[match[1]] = match[2];
    }
  }

  return { innerHTML, attrs };
}

async function build() {
  console.log('🔨 Clustta Icons — Build starting...\n');

  // Discover available variant directories
  const availableVariants = {};
  for (const [dir, variantKey] of Object.entries(VARIANT_DIRS)) {
    const dirPath = join(ROOT, dir);
    if (existsSync(dirPath)) {
      availableVariants[variantKey] = dirPath;
    }
  }

  if (Object.keys(availableVariants).length === 0) {
    console.error('❌ No icon directories found');
    process.exit(1);
  }

  console.log(`📁 Variants found: ${Object.keys(availableVariants).join(', ')}\n`);

  // Ensure output directories
  await mkdir(CORE_DIST, { recursive: true });
  await mkdir(VUE_DIST, { recursive: true });

  const svgoConfig = await loadSvgoConfig();

  // Collect all icon names from the default variant first
  const defaultDir = availableVariants['outline-1.5'];
  if (!defaultDir) {
    console.error('❌ Default variant (icons/) directory not found');
    process.exit(1);
  }

  const files = (await readdir(defaultDir)).filter(f => f.endsWith('.svg'));
  if (files.length === 0) {
    console.error('❌ No SVG files found in default variant');
    process.exit(1);
  }

  console.log(`📦 Found ${files.length} icon(s) in default variant\n`);

  const icons = [];

  for (const file of files) {
    const name = basename(file, '.svg');
    const componentName = `Ci${toPascalCase(name)}`;

    // Collect all available variants for this icon
    const variants = {};

    for (const [variantKey, dirPath] of Object.entries(availableVariants)) {
      const filePath = join(dirPath, file);
      if (!existsSync(filePath)) continue;

      const raw = await readFile(filePath, 'utf-8');

      // Optimize with SVGO
      const result = optimize(raw, {
        ...svgoConfig,
        path: filePath,
      });

      const parts = extractSvgParts(result.data);
      if (!parts) {
        console.warn(`  ⚠️  Could not parse ${file} (${variantKey})`);
        continue;
      }

      variants[variantKey] = parts;
    }

    if (Object.keys(variants).length === 0) {
      console.warn(`  ⚠️  Skipping ${file} — no parseable variants`);
      continue;
    }

    // Generate core icon module (still uses the default variant data for backwards compat)
    const defaultVariant = variants['outline-1.5'] || Object.values(variants)[0];
    const coreCode = generateCoreIcon(name, componentName, defaultVariant.innerHTML);
    await writeFile(join(CORE_DIST, `${name}.ts`), coreCode);

    // Generate Vue icon module with all variants
    const vueCode = generateVueIcon(name, componentName, variants);
    await writeFile(join(VUE_DIST, `${componentName}.ts`), vueCode);

    icons.push({ name, componentName });
    const variantNames = Object.keys(variants).join(', ');
    console.log(`  ✓ ${name} → ${componentName} [${variantNames}]`);
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

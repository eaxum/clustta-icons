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

/**
 * Extracts SVG root attributes and inner content from a raw SVG string.
 */
function extractSvgParts(svgString) {
  const attrMatch = svgString.match(/<svg([^>]*)>([\s\S]*)<\/svg>/);
  if (!attrMatch) return null;

  const attrsString = attrMatch[1];
  let innerHTML = attrMatch[2].trim();

  // Remove Serif/Affinity Designer bounding-box rects (artboard markers)
  // These are rects whose only visual purpose is a container boundary:
  // - rects with fill:none in style (with any other non-stroke rules)
  // - rects with no style/fill/stroke attributes at all (inherit nothing useful)
  innerHTML = innerHTML.replace(/<rect[^>]*\/?>\s*/g, (match) => {
    // Keep rects that have a meaningful fill or stroke (actual visual elements)
    const hasFillColor = /fill="(?!none)[^"]+"|style="[^"]*fill:(?!none)[^;"]*/.test(match);
    const hasStroke = /stroke="[^"]+"|style="[^"]*stroke:[^;"]*/.test(match);
    if (hasFillColor || hasStroke) return match;
    return '';
  });

  // Replace hardcoded colors with currentColor (stroke/fill in inline styles and attributes)
  innerHTML = normalizeColors(innerHTML);

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

/**
 * Replaces hardcoded stroke/fill colors with currentColor.
 * Preserves 'none' and already-currentColor values.
 * Handles both attributes (stroke="white") and inline styles (stroke:white).
 */
function normalizeColors(svg) {
  // Replace stroke/fill attributes with hardcoded colors
  svg = svg.replace(/(stroke|fill)="(?!none|currentColor)([^"]*)"/g, '$1="currentColor"');

  // Replace stroke/fill in inline style attributes
  svg = svg.replace(/style="([^"]*)"/g, (match, styleContent) => {
    const normalized = styleContent
      .replace(/(stroke)\s*:\s*(?!none|currentColor)[^;"]*/g, '$1:currentColor')
      .replace(/(fill)\s*:\s*(?!none|currentColor)[^;"]*/g, '$1:currentColor');
    return `style="${normalized}"`;
  });

  return svg;
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

      const parts = extractSvgParts(raw);
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

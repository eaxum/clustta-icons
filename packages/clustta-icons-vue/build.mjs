/**
 * Build script for @clustta/icons-vue
 * Compiles TypeScript source to ESM + CJS bundles with type declarations.
 */

import { build } from 'esbuild';
import { writeFile, mkdir, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve, join } from 'node:path';

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
  external: ['vue', '@clustta/icons'],
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
  external: ['vue', '@clustta/icons'],
});

// Generate type declarations manually (avoids rootDir issues with tsc)
await generateTypes();

console.log('✅ @clustta/icons-vue built successfully');

async function generateTypes() {
  const typesDir = resolve(ROOT, 'dist/types');
  await mkdir(typesDir, { recursive: true });

  // Main declaration file
  const mainDts = `import { type Component } from 'vue';
import { type IconNode } from '@clustta/icons';

export interface CiIconProps {
  size?: number | string;
  strokeWidth?: number | string;
  color?: string;
  absoluteStrokeWidth?: boolean;
}

export declare function createCiIcon(name: string, iconNodes: IconNode): Component<CiIconProps>;

`;

  // Read generated icons to create component declarations
  const iconsDir = resolve(SRC, 'icons');
  const iconFiles = (await readdir(iconsDir)).filter(f => f.endsWith('.ts'));
  const iconExports = iconFiles.map(f => {
    const name = f.replace('.ts', '');
    return `export declare const ${name}: Component<CiIconProps>;`;
  });

  const indexDts = `${mainDts}${iconExports.join('\n')}\n`;
  await writeFile(join(typesDir, 'index.d.ts'), indexDts);
}

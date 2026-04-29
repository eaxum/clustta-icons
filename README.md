# Clustta Icons

Open-source icon toolkit for creative workflows. Beautiful, consistent SVG icons as framework components.

## Packages

| Package | Description |
|---------|-------------|
| [`@clustta/icons`](packages/clustta-icons) | Framework-agnostic icon data and utilities |
| [`@clustta/icons-vue`](packages/clustta-icons-vue) | Vue 3 icon components |

## Usage

### Vue 3

```bash
pnpm add @clustta/icons-vue
```

```vue
<script setup>
import { CiEdit, CiFolder, CiTrash } from '@clustta/icons-vue';
</script>

<template>
  <CiEdit />
  <CiFolder :size="20" :stroke-width="1.5" color="#ff6b00" />
  <CiTrash :size="16" />
</template>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `number \| string` | `24` | Width and height in px |
| `strokeWidth` | `number \| string` | `2` | Stroke width |
| `color` | `string` | `currentColor` | Stroke color |
| `absoluteStrokeWidth` | `boolean` | `false` | Prevent stroke scaling with size |

### Vanilla JS

```bash
pnpm add @clustta/icons
```

```js
import { CiEdit, toSvg } from '@clustta/icons';

// Get SVG string
const svg = toSvg(CiEdit, { size: 20, strokeWidth: 1.5 });

// Or create a DOM element
import { createElement } from '@clustta/icons';
const el = createElement(CiEdit, { size: 20 });
document.body.appendChild(el);
```

## Contributing Icons

1. Design your icon on a **24×24** grid
2. Use **2px stroke**, `round` caps and joins, no fill
3. Export as SVG, place in `/icons/` with kebab-case name
4. Run `pnpm run build` to generate packages
5. Submit a PR

### Icon Design Guidelines

- **Grid**: 24×24px with 1px padding (content area 22×22)
- **Stroke**: 2px, round linecap, round linejoin
- **Style**: Outline only (filled variants are generated)
- **Colors**: Use `currentColor` — never hardcode colors
- **Naming**: kebab-case, descriptive (`arrow-left`, not `al`)

## Development

```bash
# Install dependencies
pnpm install

# Build icons from /icons/ source SVGs
pnpm run build

# Optimize SVGs in-place
pnpm run optimize

# Clean build artifacts
pnpm run clean
```

## Project Structure

```
icons/                          # Source SVGs (canonical outline format)
packages/
  clustta-icons/                # Core: icon data + utilities
  clustta-icons-vue/            # Vue 3 components
tools/
  build/                        # Build pipeline (SVG → packages)
```

## License

[ISC](LICENSE) — free for commercial and personal use.

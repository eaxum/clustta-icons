# Contributing to Clustta Icons

Thank you for your interest in contributing!

## Adding a New Icon

1. **Design** your icon on a 24×24 grid in your preferred vector editor
2. **Follow the guidelines**:
   - 2px stroke width
   - Round linecap and linejoin
   - No fill (outline style only — solid variants are auto-generated)
   - Keep within the 22×22 content area (1px padding on all sides)
   - Use `currentColor` for all strokes
3. **Export** as SVG and clean up:
   - Remove all metadata (editor namespaces, comments, etc.)
   - Remove `width`/`height` attributes (keep `viewBox="0 0 24 24"`)
   - Remove any `fill`, `stroke`, or `stroke-width` attributes (the build adds them)
4. **Name** the file in kebab-case: `my-icon-name.svg`
5. **Place** in the `/icons/` directory
6. **Run** `pnpm run build` to verify it generates correctly
7. **Submit** a pull request

## Icon Naming Rules

- Use kebab-case: `arrow-left`, `chevron-down`, `file-text`
- Be descriptive: prefer `magnifying-glass` over `search` if ambiguous
- Use common prefixes for groups: `arrow-*`, `chevron-*`, `file-*`
- Avoid abbreviations: `document` not `doc`

## SVG Template

```svg
<svg viewBox="0 0 24 24">
  <!-- Your paths here, no attributes on svg except viewBox -->
  <path d="..."/>
</svg>
```

The build pipeline will automatically add:
- `stroke="currentColor"`
- `stroke-width="2"`
- `stroke-linecap="round"`
- `stroke-linejoin="round"`
- `fill="none"`

## Code Contributions

- Run `pnpm install` at the root
- Run `pnpm run build` to verify changes
- Keep PRs focused on a single icon or feature

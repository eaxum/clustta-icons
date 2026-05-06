/**
 * Generates a Vue icon component module from raw SVG content.
 * Embeds the SVG innerHTML directly for pixel-perfect rendering.
 *
 * @param name - kebab-case icon name
 * @param componentName - PascalCase component name (e.g. 'CiArchive')
 * @param variants - Object mapping variant keys to { innerHTML, attrs }
 */
export function generateVueIcon(name, componentName, variants) {
  const variantEntries = Object.entries(variants);

  const innerHTMLObj = {};
  const attrsObj = {};

  for (const [variant, { innerHTML, attrs }] of variantEntries) {
    innerHTMLObj[variant] = innerHTML;
    attrsObj[variant] = attrs;
  }

  return `import { createCiIcon } from '../create-ci-icon.js';

export default createCiIcon('${componentName}', ${JSON.stringify(innerHTMLObj)}, ${JSON.stringify(attrsObj)});
`;
}

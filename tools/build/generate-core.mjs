/**
 * Generates a core icon module (TypeScript) from raw SVG innerHTML.
 *
 * Output:
 *   export const CiEdit: IconData = ['edit', defaultAttributes, '<path .../>'];
 */

export function generateCoreIcon(name, componentName, innerHTML) {
  return `import type { IconData } from '../types.js';
import { defaultAttributes } from '../types.js';

export const ${componentName}: IconData = [
  '${name}',
  defaultAttributes,
  ${JSON.stringify(innerHTML)},
];
`;
}

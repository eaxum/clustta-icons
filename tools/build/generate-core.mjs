/**
 * Generates a core icon module (TypeScript) from parsed SVG nodes.
 *
 * Output:
 *   export const CiEdit: IconData = ['edit', defaultAttributes, [...]];
 */

export function generateCoreIcon(name, componentName, nodes) {
  const nodesJson = JSON.stringify(nodes, null, 2);

  return `import type { IconData } from '../types.js';
import { defaultAttributes } from '../types.js';

export const ${componentName}: IconData = [
  '${name}',
  defaultAttributes,
  ${nodesJson},
];
`;
}

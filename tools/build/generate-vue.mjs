/**
 * Generates a Vue icon component module from parsed SVG nodes.
 *
 * Output:
 *   import { createCiIcon } from '../create-ci-icon.js';
 *   export default createCiIcon('CiEdit', [...]);
 */

export function generateVueIcon(name, componentName, nodes) {
  const nodesJson = JSON.stringify(nodes, null, 2);

  return `import { createCiIcon } from '../create-ci-icon.js';

export default createCiIcon('${componentName}', ${nodesJson});
`;
}

/**
 * Utility functions for the build pipeline.
 */

/**
 * Converts kebab-case to PascalCase.
 * e.g. "arrow-left" → "ArrowLeft"
 *      "checkpoint-stone" → "CheckpointStone"
 */
export function toPascalCase(str) {
  return str
    .split(/[-_]/)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join('');
}

/**
 * Converts PascalCase to kebab-case.
 * e.g. "ArrowLeft" → "arrow-left"
 */
export function toKebabCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .toLowerCase();
}

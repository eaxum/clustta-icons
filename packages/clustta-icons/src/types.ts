/**
 * An icon node is a tuple of [elementName, attributes, children?]
 * This recursive structure represents the SVG DOM tree.
 */
export type IconNodeChild = [string, Record<string, string>, IconNodeChild[]?];
export type IconNode = IconNodeChild[];

/**
 * Each icon is represented as a tuple:
 * [name, defaultAttributes, iconNodes]
 */
export type IconData = [string, Record<string, string>, IconNode];

export interface CreateIconOptions {
  size?: number | string;
  strokeWidth?: number | string;
  color?: string;
  class?: string;
  attrs?: Record<string, string>;
}

export const defaultAttributes: Record<string, string> = {
  xmlns: 'http://www.w3.org/2000/svg',
  width: '24',
  height: '24',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  'stroke-width': '2',
  'stroke-linecap': 'round',
  'stroke-linejoin': 'round',
};

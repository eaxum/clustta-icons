import { defaultAttributes, type CreateIconOptions, type IconData } from './types.js';

/**
 * Creates an SVG string from icon data with optional overrides.
 */
export function toSvg(iconData: IconData, options: CreateIconOptions = {}): string {
  const [, , nodes] = iconData;
  const size = options.size ?? defaultAttributes.width;
  const strokeWidth = options.strokeWidth ?? defaultAttributes['stroke-width'];
  const color = options.color ?? defaultAttributes.stroke;

  const attrs: Record<string, string> = {
    ...defaultAttributes,
    width: String(size),
    height: String(size),
    stroke: color,
    'stroke-width': String(strokeWidth),
    ...(options.class ? { class: options.class } : {}),
    ...(options.attrs ?? {}),
  };

  const attrsString = Object.entries(attrs)
    .map(([key, value]) => `${key}="${escapeAttr(value)}"`)
    .join(' ');

  const childrenString = renderNodes(nodes);
  return `<svg ${attrsString}>${childrenString}</svg>`;
}

/**
 * Creates a DOM SVGElement (browser only).
 */
export function createElement(iconData: IconData, options: CreateIconOptions = {}): SVGSVGElement {
  const [, , nodes] = iconData;
  const size = options.size ?? defaultAttributes.width;
  const strokeWidth = options.strokeWidth ?? defaultAttributes['stroke-width'];
  const color = options.color ?? defaultAttributes.stroke;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

  const attrs: Record<string, string> = {
    ...defaultAttributes,
    width: String(size),
    height: String(size),
    stroke: color,
    'stroke-width': String(strokeWidth),
    ...(options.class ? { class: options.class } : {}),
    ...(options.attrs ?? {}),
  };

  for (const [key, value] of Object.entries(attrs)) {
    svg.setAttribute(key, value);
  }

  appendNodes(svg, nodes);
  return svg;
}

function renderNodes(nodes: IconData[2]): string {
  return nodes
    .map(([tag, attrs, children]) => {
      const attrsString = Object.entries(attrs)
        .map(([key, value]) => `${key}="${escapeAttr(value)}"`)
        .join(' ');
      const childrenString = children ? renderNodes(children) : '';
      return childrenString
        ? `<${tag} ${attrsString}>${childrenString}</${tag}>`
        : `<${tag} ${attrsString}/>`;
    })
    .join('');
}

function appendNodes(parent: Element, nodes: IconData[2]): void {
  for (const [tag, attrs, children] of nodes) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const [key, value] of Object.entries(attrs)) {
      el.setAttribute(key, value);
    }
    if (children) {
      appendNodes(el, children);
    }
    parent.appendChild(el);
  }
}

function escapeAttr(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

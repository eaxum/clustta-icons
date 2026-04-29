/**
 * Parses an optimized SVG string into an icon node tree.
 * Extracts child elements from the <svg> root — ignores the root <svg> element itself.
 *
 * Returns: IconNode[] (array of [tag, attrs, children?] tuples)
 */

export function parseSvg(svgString) {
  const nodes = [];
  // Match all top-level elements inside <svg>...</svg>
  const innerContent = svgString.replace(/<svg[^>]*>([\s\S]*)<\/svg>/, '$1').trim();

  if (!innerContent) return null;

  parseElements(innerContent, nodes);
  return nodes;
}

/**
 * Simple recursive XML element parser.
 * Handles self-closing tags and nested elements.
 */
function parseElements(content, result) {
  // Match opening tags (self-closing or with content)
  const tagRegex = /<(\w+)((?:\s+[\w-]+="[^"]*")*)\s*(?:\/>|>([\s\S]*?)<\/\1>)/g;
  let match;

  while ((match = tagRegex.exec(content)) !== null) {
    const [, tag, attrsString, innerContent] = match;
    const attrs = parseAttributes(attrsString);
    const children = [];

    if (innerContent) {
      parseElements(innerContent, children);
    }

    if (children.length > 0) {
      result.push([tag, attrs, children]);
    } else {
      result.push([tag, attrs]);
    }
  }
}

/**
 * Parses attribute string into key-value object.
 */
function parseAttributes(attrsString) {
  const attrs = {};
  const attrRegex = /([\w-]+)="([^"]*)"/g;
  let match;

  while ((match = attrRegex.exec(attrsString)) !== null) {
    const [, key, value] = match;
    attrs[key] = value;
  }

  return attrs;
}

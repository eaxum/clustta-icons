/** @type {import('svgo').Config} */
export default {
  multipass: true,
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          removeViewBox: false,
          removeTitle: true,
          minifyStyles: false,
          inlineStyles: false,
          // Preserve path data fidelity — don't convert curves to arcs
          convertPathData: {
            makeArcs: false,
            convertArcs: false,
          },
        },
      },
    },
    'removeDimensions',
    'removeXMLNS',
    'removeXMLProcInst',
    'removeDoctype',
    'removeComments',
    {
      name: 'removeAttrs',
      params: {
        attrs: [
          'xml:space',
          'data-name',
          'class',
          'xmlns:serif',
          'xmlns:xlink',
          'version',
        ],
      },
    },
    {
      name: 'removeAttributesBySelector',
      params: {
        selectors: [
          { selector: 'svg', attributes: ['style', 'width', 'height'] },
        ],
      },
    },
    // Replace white/hardcoded colors with currentColor
    {
      name: 'custom-replace-colors',
      type: 'visitor',
      fn: () => ({
        element: {
          enter: (node) => {
            // Remove xml:space from all elements
            if (node.attributes['xml:space']) {
              delete node.attributes['xml:space'];
            }
            // Replace any hardcoded stroke color with currentColor
            if (node.attributes.stroke) {
              const s = node.attributes.stroke.toLowerCase().replace(/\s/g, '');
              if (s !== 'none' && s !== 'currentcolor') {
                node.attributes.stroke = 'currentColor';
              }
            }
            // Replace any hardcoded fill color with currentColor (but keep "none")
            if (node.attributes.fill && node.attributes.fill !== 'none') {
              const f = node.attributes.fill.toLowerCase().replace(/\s/g, '');
              if (f !== 'currentcolor') {
                node.attributes.fill = 'currentColor';
              }
            }
            // Handle inline styles
            if (node.attributes.style) {
              node.attributes.style = node.attributes.style
                .replace(/fill:\s*none\s*;?/gi, '')
                .replace(/stroke:\s*[^;]+;?/gi, '')
                .replace(/fill:\s*[^;]+;?/gi, '')
                .replace(/fill-rule:\s*[^;]+;?/gi, '')
                .replace(/clip-rule:\s*[^;]+;?/gi, '')
                .replace(/stroke-linecap:\s*[^;]+;?/gi, '')
                .replace(/stroke-linejoin:\s*[^;]+;?/gi, '')
                .replace(/stroke-miterlimit:\s*[^;]+;?/gi, '')
                .replace(/stroke-width:\s*[^;]+;?/gi, '')
                .trim();
              // Remove empty or semicolon-only style attributes
              if (!node.attributes.style || node.attributes.style === ';' || node.attributes.style === '') {
                delete node.attributes.style;
              }
            }
            // Remove clip-rule from svg root (redundant)
            if (node.name === 'svg' && node.attributes['clip-rule']) {
              delete node.attributes['clip-rule'];
            }
            // Remove stroke-width from individual elements (set globally)
            if (node.name !== 'svg' && node.attributes['stroke-width']) {
              delete node.attributes['stroke-width'];
            }
            // Remove fill="none" from non-svg elements (set globally)
            if (node.name !== 'svg' && node.attributes.fill === 'none') {
              delete node.attributes.fill;
            }
            // Remove stroke="currentColor" from non-svg elements (inherited)
            if (node.name !== 'svg' && node.attributes.stroke === 'currentColor') {
              delete node.attributes.stroke;
            }
          },
        },
      }),
    },
    'sortAttrs',
    {
      name: 'addAttributesToSVGElement',
      params: {
        attributes: [
          { fill: 'none' },
          { stroke: 'currentColor' },
          { 'stroke-width': '1.5' },
          { 'stroke-linecap': 'round' },
          { 'stroke-linejoin': 'round' },
        ],
      },
    },
  ],
};

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
            // Replace stroke color values
            if (node.attributes.stroke) {
              const s = node.attributes.stroke.toLowerCase();
              if (s === 'white' || s === '#ffffff' || s === '#fff' || s === 'rgb(247,247,247)' || s === '#f7f7f7') {
                node.attributes.stroke = 'currentColor';
              }
            }
            // Replace fill color values (but keep "none")
            if (node.attributes.fill && node.attributes.fill !== 'none') {
              const f = node.attributes.fill.toLowerCase();
              if (f === 'white' || f === '#ffffff' || f === '#fff' || f === 'rgb(247,247,247)' || f === '#f7f7f7') {
                node.attributes.fill = 'currentColor';
              }
            }
            // Handle inline styles
            if (node.attributes.style) {
              node.attributes.style = node.attributes.style
                .replace(/fill:\s*none\s*;?/gi, '')
                .replace(/stroke:\s*(white|#ffffff|#fff|currentColor|rgb\(247,247,247\)|#f7f7f7)\s*;?/gi, '')
                .replace(/fill:\s*(white|#ffffff|#fff|rgb\(247,247,247\)|#f7f7f7)\s*;?/gi, '')
                .replace(/fill-rule:\s*\w+\s*;?/gi, '')
                .replace(/clip-rule:\s*\w+\s*;?/gi, '')
                .replace(/stroke-linecap:\s*\w+\s*;?/gi, '')
                .replace(/stroke-linejoin:\s*\w+\s*;?/gi, '')
                .replace(/stroke-miterlimit:[\d.]+;?/gi, '')
                .replace(/stroke-width:[\d.]+px;?/gi, '')
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

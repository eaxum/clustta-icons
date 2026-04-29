/** @type {import('svgo').Config} */
export default {
  multipass: true,
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          removeViewBox: false,
          removeTitle: false,
        },
      },
    },
    'removeDimensions',
    'sortAttrs',
    'removeXMLNS',
    {
      name: 'removeAttrs',
      params: {
        attrs: ['xml:space', 'data-name', 'class'],
      },
    },
    {
      name: 'addAttributesToSVGElement',
      params: {
        attributes: [
          { stroke: 'currentColor' },
          { 'stroke-width': '2' },
          { 'stroke-linecap': 'round' },
          { 'stroke-linejoin': 'round' },
          { fill: 'none' },
        ],
      },
    },
  ],
};

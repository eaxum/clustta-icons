import { h, defineComponent, type PropType, type SVGAttributes, type VNode } from 'vue';
import { defaultAttributes, type IconNode } from '@clustta/icons';

export interface CiIconProps extends /* @vue-ignore */ SVGAttributes {
  size?: number | string;
  strokeWidth?: number | string;
  color?: string;
  absoluteStrokeWidth?: boolean;
}

/**
 * Creates a Vue component from icon node data.
 * Each icon module calls this to produce its named export.
 */
export function createCiIcon(
  name: string,
  iconNodes: IconNode
) {
  const component = defineComponent({
    name,
    props: {
      size: {
        type: [Number, String] as PropType<number | string>,
        default: 24,
      },
      strokeWidth: {
        type: [Number, String] as PropType<number | string>,
        default: 2,
      },
      color: {
        type: String,
        default: 'currentColor',
      },
      absoluteStrokeWidth: {
        type: Boolean,
        default: false,
      },
    },
    setup(props, { attrs, slots }) {
      return () => {
        const size = Number(props.size);
        const computedStrokeWidth = props.absoluteStrokeWidth
          ? (Number(props.strokeWidth) * 24) / size
          : Number(props.strokeWidth);

        return h(
          'svg',
          {
            ...defaultAttributes,
            width: size,
            height: size,
            stroke: props.color,
            'stroke-width': computedStrokeWidth,
            class: ['ci-icon', `ci-${toKebab(name)}`],
            ...attrs,
          },
          [
            ...iconNodes.map(([tag, nodeAttrs, children]) =>
              renderNode(tag, nodeAttrs, children)
            ),
            ...(slots.default ? [slots.default()] : []),
          ]
        );
      };
    },
  });

  return component;
}

function renderNode(
  tag: string,
  attrs: Record<string, string>,
  children?: IconNode
): VNode {
  if (children && children.length > 0) {
    return h(
      tag,
      attrs,
      children.map(([childTag, childAttrs, childChildren]) =>
        renderNode(childTag, childAttrs, childChildren)
      )
    );
  }
  return h(tag, attrs);
}

function toKebab(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/^Ci/, '')
    .toLowerCase();
}

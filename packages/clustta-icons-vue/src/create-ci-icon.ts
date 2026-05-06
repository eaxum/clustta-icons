import { h, defineComponent, inject, type PropType, type SVGAttributes } from 'vue';

export interface CiIconProps extends /* @vue-ignore */ SVGAttributes {
  size?: number | string;
  color?: string;
  variant?: string;
}

export const CI_ICON_VARIANT_KEY = 'ci-icon-variant';
export const CI_ICON_SIZE_KEY = 'ci-icon-size';

/**
 * Creates a Vue component from raw SVG inner HTML per variant.
 * Each icon module calls this to produce its named export.
 *
 * @param name - Component name (e.g. 'CiArchive')
 * @param variants - Object mapping variant keys to raw SVG innerHTML
 * @param svgAttrs - Base SVG attributes (viewBox, fill, stroke, etc.) per variant
 */
export function createCiIcon(
  name: string,
  variants: Record<string, string>,
  svgAttrs: Record<string, Record<string, string>>
) {
  const component = defineComponent({
    name,
    props: {
      size: {
        type: [Number, String] as PropType<number | string>,
        default: undefined,
      },
      color: {
        type: String,
        default: undefined,
      },
      variant: {
        type: String,
        default: undefined,
      },
    },
    setup(props, { attrs }) {
      return () => {
        const globalVariant = inject<{ value: string } | string>(CI_ICON_VARIANT_KEY, 'outline-1.5');
        const globalSize = inject<{ value: number | string } | number | string>(CI_ICON_SIZE_KEY, 20);
        const activeVariant = props.variant
          || (typeof globalVariant === 'object' && 'value' in globalVariant ? globalVariant.value : globalVariant)
          || 'outline-1.5';

        // Fallback to first available variant if requested isn't available
        const resolvedVariant = variants[activeVariant] ? activeVariant : Object.keys(variants)[0];
        const innerHTML = variants[resolvedVariant];
        const baseAttrs = svgAttrs[resolvedVariant] || {};
        const resolvedSize = props.size !== undefined
          ? Number(props.size)
          : Number(typeof globalSize === 'object' && 'value' in globalSize ? globalSize.value : globalSize);
        const size = resolvedSize || 20;

        return h('svg', {
          ...baseAttrs,
          xmlns: 'http://www.w3.org/2000/svg',
          width: size,
          height: size,
          ...(props.color ? { stroke: props.color } : {}),
          class: ['ci-icon', `ci-${toKebab(name)}`],
          ...attrs,
          innerHTML,
        });
      };
    },
  });

  return component;
}

function toKebab(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/^Ci/, '')
    .toLowerCase();
}


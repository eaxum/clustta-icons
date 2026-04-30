import { type CreateIconOptions, type IconData } from './types.js';
/**
 * Creates an SVG string from icon data with optional overrides.
 */
export declare function toSvg(iconData: IconData, options?: CreateIconOptions): string;
/**
 * Creates a DOM SVGElement (browser only).
 */
export declare function createElement(iconData: IconData, options?: CreateIconOptions): SVGSVGElement;
//# sourceMappingURL=create-icon.d.ts.map
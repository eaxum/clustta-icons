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
export declare const defaultAttributes: Record<string, string>;
//# sourceMappingURL=types.d.ts.map
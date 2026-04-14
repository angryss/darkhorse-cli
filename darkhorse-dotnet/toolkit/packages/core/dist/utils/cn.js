/**
 * Simple classname utility for combining CSS classes
 * Similar to clsx/classnames but minimal
 */
export function cn(...classes) {
    return classes
        .filter(Boolean)
        .map(c => String(c).trim())
        .filter(Boolean)
        .join(' ');
}
//# sourceMappingURL=cn.js.map
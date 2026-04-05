/**
 * TreeMap Utility Functions
 */
/**
 * Default color palette
 */
const DEFAULT_PALETTE = [
    '#3b82f6', // blue
    '#10b981', // green
    '#f59e0b', // amber
    '#ef4444', // red
    '#8b5cf6', // violet
    '#ec4899', // pink
    '#14b8a6', // teal
    '#f97316', // orange
];
/**
 * Get color for a node
 */
export function getColor(node, _depth, colorScale = 'byGroup', palette, rangeColors, colorPath) {
    const colors = palette || DEFAULT_PALETTE;
    const value = node.item.value || 0;
    switch (colorScale) {
        case 'continuous':
        case 'discrete':
            if (rangeColors && rangeColors.length > 0) {
                const range = rangeColors.find(r => value >= r.from && value <= r.to);
                if (range)
                    return range.color;
            }
            // Fallback to palette
            const colorIndex = Math.floor((value / (node.totalValue || 1)) * colors.length) % colors.length;
            return colors[colorIndex] ?? colors[0] ?? '#3b82f6';
        case 'byGroup':
        default:
            const groupValue = colorPath ? node.item[colorPath] : node.item.group || node.item.id;
            const hash = typeof groupValue === 'string'
                ? groupValue.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
                : Number(groupValue);
            const groupColorIndex = hash % colors.length;
            return colors[groupColorIndex] ?? colors[0] ?? '#3b82f6';
    }
}
/**
 * Combine class names
 */
export function cn(...classes) {
    return classes.filter(Boolean).join(' ');
}
/**
 * Format number with optional grouping separator
 */
export function formatNumber(value, useGrouping = true) {
    return useGrouping ? value.toLocaleString() : value.toString();
}
//# sourceMappingURL=utils.js.map
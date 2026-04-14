/**
 * TreeMap Utility Functions
 */
import type { TreeMapNode, TreeMapColorScale, TreeMapRangeColor } from './types';
/**
 * Get color for a node
 */
export declare function getColor(node: TreeMapNode, _depth: number, colorScale?: TreeMapColorScale, palette?: string[], rangeColors?: TreeMapRangeColor[], colorPath?: string): string;
/**
 * Combine class names
 */
export declare function cn(...classes: (string | boolean | undefined | null)[]): string;
/**
 * Format number with optional grouping separator
 */
export declare function formatNumber(value: number, useGrouping?: boolean): string;
//# sourceMappingURL=utils.d.ts.map
/**
 * Squarified Treemap Algorithm
 * Based on: Bruls, M., Huizing, K., & van Wijk, J. J. (2000)
 */
import type { TreeMapNode, TreeMapRect, TreeMapDataItem } from './types';
/**
 * Build hierarchical tree from flat data
 */
export declare function buildHierarchy(data: TreeMapDataItem[], parentIdPath?: keyof TreeMapDataItem): TreeMapNode[];
/**
 * Layout rectangles using squarified treemap algorithm
 */
export declare function layoutTreeMap(nodes: TreeMapNode[], x: number, y: number, width: number, height: number, depth: number | undefined, gap: number | undefined, getColor: (node: TreeMapNode, depth: number) => string): TreeMapRect[];
/**
 * Flatten rectangle tree for rendering
 */
export declare function flattenRects(rects: TreeMapRect[]): TreeMapRect[];
//# sourceMappingURL=treemapAlgorithm.d.ts.map
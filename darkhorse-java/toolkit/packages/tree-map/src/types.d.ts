/**
 * TreeMap Component Types
 * @packageDocumentation
 */
import { ReactNode, CSSProperties } from 'react';
/**
 * TreeMap data item
 */
export interface TreeMapDataItem {
    /** Unique identifier */
    id: string | number;
    /** Display label */
    label: string;
    /** Numeric value (weight) */
    value: number;
    /** Parent item ID (for hierarchy) */
    parentId?: string | number | null;
    /** Group/category for color assignment */
    group?: string;
    /** Additional metadata */
    [key: string]: unknown;
}
/**
 * Color scale type
 */
export type TreeMapColorScale = 'continuous' | 'discrete' | 'byGroup';
/**
 * Range color definition
 */
export interface TreeMapRangeColor {
    /** Start of range */
    from: number;
    /** End of range */
    to: number;
    /** Color for this range */
    color: string;
    /** Optional label */
    label?: string;
}
/**
 * Title settings
 */
export interface TreeMapTitleSettings {
    /** Title text */
    text: string;
    /** Font size */
    fontSize?: string;
    /** Font weight */
    fontWeight?: string | number;
}
/**
 * Legend settings
 */
export interface TreeMapLegendSettings {
    /** Show legend */
    visible: boolean;
    /** Legend position */
    position?: 'Top' | 'Bottom' | 'Left' | 'Right';
    /** Legend item shape */
    shape?: 'Rectangle' | 'Circle' | 'Square' | 'Bar';
    /** Format label function */
    formatLabel?: (value: number | string) => string;
}
/**
 * Tooltip settings
 */
export interface TreeMapTooltipSettings {
    /** Show tooltip */
    visible: boolean;
    /** Custom template */
    template?: (item: TreeMapDataItem) => ReactNode | string;
    /** Value format string */
    valueFormat?: string;
    /** Use grouping separator */
    useGroupingSeparator?: boolean;
}
/**
 * Level settings
 */
export interface TreeMapLevelSettings {
    /** Group path field */
    groupPath: string;
    /** Border color */
    borderColor?: string;
    /** Border width */
    borderWidth?: number;
    /** Show label */
    showLabel?: boolean;
}
/**
 * Leaf settings
 */
export interface TreeMapLeafSettings {
    /** Label path field */
    labelPath: string;
    /** Border color */
    borderColor?: string;
    /** Border width */
    borderWidth?: number;
    /** Label overflow behavior */
    labelOverflow?: 'Clip' | 'Ellipsis' | 'Wrap';
}
/**
 * TreeMap component props
 */
export interface TreeMapProps {
    /** Component ID */
    id?: string;
    /** Data items */
    data: TreeMapDataItem[];
    /** Value field path */
    valuePath?: keyof TreeMapDataItem;
    /** Parent ID field path */
    parentIdPath?: keyof TreeMapDataItem;
    /** Color field path */
    colorPath?: keyof TreeMapDataItem;
    /** Level settings */
    levels?: TreeMapLevelSettings[];
    /** Leaf settings */
    leafSettings?: TreeMapLeafSettings;
    /** Title settings */
    title?: TreeMapTitleSettings;
    /** Legend settings */
    legend?: TreeMapLegendSettings;
    /** Tooltip settings */
    tooltip?: TreeMapTooltipSettings;
    /** Color scale type */
    colorScale?: TreeMapColorScale;
    /** Color palette */
    palette?: string[];
    /** Range colors */
    rangeColors?: TreeMapRangeColor[];
    /** Show borders */
    showBorder?: boolean;
    /** Border color */
    borderColor?: string;
    /** Border width */
    borderWidth?: number;
    /** Gap between rectangles */
    gap?: number;
    /** Enable drill-down */
    drillDown?: boolean;
    /** Chart height */
    height?: number | string;
    /** Chart width */
    width?: number | string;
    /** Item click handler */
    onItemClick?: (item: TreeMapDataItem) => void;
    /** Item hover handler */
    onItemHover?: (item: TreeMapDataItem | null) => void;
    /** Error handler */
    onError?: (error: unknown) => void;
    /** Additional CSS class */
    className?: string;
    /** Inline styles */
    style?: CSSProperties;
}
/**
 * Rectangle for rendering
 */
export interface TreeMapRect {
    /** Item data */
    item: TreeMapDataItem;
    /** X position */
    x: number;
    /** Y position */
    y: number;
    /** Width */
    width: number;
    /** Height */
    height: number;
    /** Fill color */
    color: string;
    /** Depth in hierarchy */
    depth: number;
    /** Children rectangles */
    children?: TreeMapRect[];
}
/**
 * Hierarchical node
 */
export interface TreeMapNode {
    /** Item data */
    item: TreeMapDataItem;
    /** Children nodes */
    children: TreeMapNode[];
    /** Total value (sum of children or own value) */
    totalValue: number;
}
//# sourceMappingURL=types.d.ts.map
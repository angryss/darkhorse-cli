/**
 * Pivot Table Component Stories
 */
import type { StoryObj } from '@storybook/react';
declare const meta: {
    title: string;
    component: import("react").ForwardRefExoticComponent<import("./types").PivotTableProps & import("react").RefAttributes<HTMLDivElement>>;
    parameters: {
        layout: string;
    };
    tags: string[];
};
export default meta;
type Story = StoryObj<typeof meta>;
/**
 * Basic pivot table showing sales by region and product
 */
export declare const Basic: Story;
/**
 * Pivot table with multiple aggregations
 */
export declare const MultipleAggregations: Story;
/**
 * Pivot table with hierarchical rows
 */
export declare const HierarchicalRows: Story;
/**
 * Pivot table showing average aggregation
 */
export declare const AverageAggregation: Story;
/**
 * Pivot table showing min/max aggregations
 */
export declare const MinMaxAggregation: Story;
/**
 * Pivot table with filters
 */
export declare const WithFilters: Story;
/**
 * Pivot table with exclude filters
 */
export declare const WithExcludeFilters: Story;
/**
 * Pivot table with export enabled
 */
export declare const WithExport: Story;
/**
 * Pivot table with drill-through functionality
 */
export declare const WithDrillThrough: Story;
/**
 * Pivot table with cell click handler
 */
export declare const WithCellClick: Story;
/**
 * Pivot table without toolbar
 */
export declare const NoToolbar: Story;
/**
 * Compact pivot table
 */
export declare const Compact: Story;
/**
 * Large dataset pivot table
 */
export declare const LargeDataset: Story;
/**
 * Empty state
 */
export declare const Empty: Story;
/**
 * Count aggregation
 */
export declare const CountAggregation: Story;
/**
 * Distinct count aggregation
 */
export declare const DistinctCountAggregation: Story;
/**
 * Custom styling with className
 */
export declare const CustomStyling: Story;
//# sourceMappingURL=PivotTable.stories.d.ts.map
/**
 * TreeMap Component Stories
 */
import type { StoryObj } from '@storybook/react';
declare const meta: {
    title: string;
    component: import("react").ForwardRefExoticComponent<import("./types").TreeMapProps & import("react").RefAttributes<HTMLDivElement>>;
    parameters: {
        layout: string;
    };
    tags: string[];
};
export default meta;
type Story = StoryObj<typeof meta>;
/**
 * Basic treemap visualization
 */
export declare const Basic: Story;
/**
 * Treemap with title
 */
export declare const WithTitle: Story;
/**
 * Treemap with byGroup color scale
 */
export declare const ByGroupColorScale: Story;
/**
 * Treemap with continuous color scale
 */
export declare const ContinuousColorScale: Story;
/**
 * Treemap with discrete color scale
 */
export declare const DiscreteColorScale: Story;
/**
 * Treemap with tooltips
 */
export declare const WithTooltips: Story;
/**
 * Treemap with custom tooltip template
 */
export declare const CustomTooltip: Story;
/**
 * Treemap with drill-down navigation
 */
export declare const WithDrillDown: Story;
/**
 * Treemap without borders
 */
export declare const NoBorders: Story;
/**
 * Treemap with custom borders
 */
export declare const CustomBorders: Story;
/**
 * Treemap with custom gap
 */
export declare const CustomGap: Story;
/**
 * Treemap with legend
 */
export declare const WithLegend: Story;
/**
 * Compact treemap
 */
export declare const Compact: Story;
/**
 * Large treemap
 */
export declare const Large: Story;
/**
 * Empty state
 */
export declare const Empty: Story;
/**
 * Custom styling
 */
export declare const CustomStyling: Story;
/**
 * Interactive example
 */
export declare const Interactive: Story;
//# sourceMappingURL=TreeMap.stories.d.ts.map
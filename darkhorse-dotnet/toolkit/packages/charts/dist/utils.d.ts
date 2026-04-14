/**
 * Chart utility functions
 */
/**
 * Combines class names, filtering out falsy values
 */
export declare function cn(...classes: (string | boolean | undefined | null)[]): string;
/**
 * Calculate percentage from value and total
 */
export declare function calculatePercentage(value: number, total: number): number;
/**
 * Format number with commas
 */
export declare function formatNumber(value: number, decimals?: number): string;
/**
 * Generate color palette from theme
 */
export declare function getChartColors(count: number, theme: 'light' | 'dark'): string[];
/**
 * Calculate scale for axis
 */
export declare function calculateScale(min: number, max: number, tickCount?: number): {
    min: number;
    max: number;
    ticks: number[];
};
/**
 * Generate SVG path for spline (Catmull-Rom)
 */
export declare function generateSplinePath(points: Array<{
    x: number;
    y: number;
}>): string;
/**
 * Calculate pie slice path
 */
export declare function calculatePieSlicePath(centerX: number, centerY: number, radius: number, innerRadius: number, startAngle: number, endAngle: number): string;
/**
 * Calculate label position for pie slice
 */
export declare function calculatePieLabelPosition(centerX: number, centerY: number, radius: number, angle: number, offset?: number): {
    x: number;
    y: number;
};
//# sourceMappingURL=utils.d.ts.map
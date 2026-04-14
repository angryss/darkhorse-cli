/**
 * Timeline calculation utilities
 */
import type { TimelineViewMode, TimelineScale } from '../types';
/**
 * Get timeline scale configuration based on view mode
 */
export declare function getTimelineScale(viewMode: TimelineViewMode): TimelineScale;
/**
 * Calculate pixel position for a date on the timeline
 */
export declare function dateToPixel(date: Date, timelineStart: Date, pixelsPerDay: number): number;
/**
 * Calculate date from pixel position on timeline
 */
export declare function pixelToDate(pixel: number, timelineStart: Date, pixelsPerDay: number): Date;
/**
 * Generate timeline cells for rendering
 */
export declare function generateTimelineCells(start: Date, end: Date, viewMode: TimelineViewMode): Array<{
    date: Date;
    label: string;
    type: 'major' | 'minor';
}>;
/**
 * Format timeline label based on view mode
 */
export declare function formatTimelineLabel(date: Date, viewMode: TimelineViewMode): string;
/**
 * Get week number of year
 */
export declare function getWeekNumber(date: Date): number;
/**
 * Calculate timeline bounds from tasks
 */
export declare function calculateTimelineBounds(tasks: Array<{
    startDate?: string | Date;
    endDate?: string | Date;
}>, projectStart?: string | Date, projectEnd?: string | Date): {
    start: Date;
    end: Date;
};
//# sourceMappingURL=timelineUtils.d.ts.map
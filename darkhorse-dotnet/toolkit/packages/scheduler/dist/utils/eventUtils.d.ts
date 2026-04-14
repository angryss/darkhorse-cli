/**
 * Event utility functions for Scheduler
 */
import { SchedulerEvent } from '../types';
/**
 * Filter events by date range
 */
export declare function filterEventsByDateRange(events: SchedulerEvent[], startDate: Date, endDate: Date): SchedulerEvent[];
/**
 * Filter events by resource
 */
export declare function filterEventsByResource(events: SchedulerEvent[], resourceId: string | number): SchedulerEvent[];
/**
 * Group overlapping events
 */
export declare function groupOverlappingEvents(events: SchedulerEvent[]): SchedulerEvent[][];
/**
 * Calculate event position and dimensions for time grid
 */
export declare function calculateEventLayout(events: SchedulerEvent[], dayStart: Date, dayEnd: Date, _slotHeight: number): Array<{
    event: SchedulerEvent;
    top: number;
    height: number;
    left: number;
    width: number;
}>;
/**
 * Sort events by start time
 */
export declare function sortEventsByStart(events: SchedulerEvent[]): SchedulerEvent[];
/**
 * Check if event is recurring
 */
export declare function isRecurring(event: SchedulerEvent): boolean;
/**
 * Check if event is all-day
 */
export declare function isAllDay(event: SchedulerEvent): boolean;
//# sourceMappingURL=eventUtils.d.ts.map
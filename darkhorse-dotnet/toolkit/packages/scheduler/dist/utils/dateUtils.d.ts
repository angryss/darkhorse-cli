/**
 * Date utility functions for Scheduler
 */
/**
 * Parse time string to hours and minutes
 */
export declare function parseTime(timeStr: string): {
    hours: number;
    minutes: number;
};
/**
 * Format date for display
 */
export declare function formatDate(date: Date, format?: string): string;
/**
 * Format time for display
 */
export declare function formatTime(date: Date, format?: string): string;
/**
 * Get start of day
 */
export declare function startOfDay(date: Date): Date;
/**
 * Get end of day
 */
export declare function endOfDay(date: Date): Date;
/**
 * Get start of week
 */
export declare function startOfWeek(date: Date, firstDayOfWeek?: number): Date;
/**
 * Get end of week
 */
export declare function endOfWeek(date: Date, firstDayOfWeek?: number): Date;
/**
 * Get start of month
 */
export declare function startOfMonth(date: Date): Date;
/**
 * Get end of month
 */
export declare function endOfMonth(date: Date): Date;
/**
 * Get start of year
 */
export declare function startOfYear(date: Date): Date;
/**
 * Get end of year
 */
export declare function endOfYear(date: Date): Date;
/**
 * Add days to date
 */
export declare function addDays(date: Date, days: number): Date;
/**
 * Add months to date
 */
export declare function addMonths(date: Date, months: number): Date;
/**
 * Add years to date
 */
export declare function addYears(date: Date, years: number): Date;
/**
 * Check if date is same day
 */
export declare function isSameDay(date1: Date, date2: Date): boolean;
/**
 * Check if date is today
 */
export declare function isToday(date: Date): boolean;
/**
 * Check if date is a work day
 */
export declare function isWorkDay(date: Date, workDays?: number[]): boolean;
/**
 * Get days in month
 */
export declare function getDaysInMonth(date: Date): number;
/**
 * Get week number
 */
export declare function getWeekNumber(date: Date): number;
/**
 * Parse date from string or Date object
 */
export declare function parseDate(dateInput: string | Date): Date;
/**
 * Check if events overlap
 */
export declare function eventsOverlap(event1: {
    start: Date;
    end: Date;
}, event2: {
    start: Date;
    end: Date;
}): boolean;
/**
 * Get time slots for a day
 */
export declare function getTimeSlots(startHour: string, endHour: string, majorSlot: number, minorSlotCount: number): Date[];
/**
 * Get date range for view
 */
export declare function getViewDateRange(date: Date, view: string, firstDayOfWeek?: number): {
    start: Date;
    end: Date;
};
//# sourceMappingURL=dateUtils.d.ts.map
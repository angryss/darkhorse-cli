/**
 * Date utility functions for Gantt chart
 */
/**
 * Convert string or Date to Date object
 */
export declare function toDate(date: string | Date | undefined): Date | null;
/**
 * Add days to a date
 */
export declare function addDays(date: Date, days: number): Date;
/**
 * Calculate difference in days between two dates
 */
export declare function diffInDays(start: Date, end: Date): number;
/**
 * Check if date is weekend
 */
export declare function isWeekend(date: Date): boolean;
/**
 * Check if date is within range
 */
export declare function isDateInRange(date: Date, start: Date, end: Date): boolean;
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
export declare function startOfWeek(date: Date): Date;
/**
 * Get start of month
 */
export declare function startOfMonth(date: Date): Date;
/**
 * Get start of year
 */
export declare function startOfYear(date: Date): Date;
/**
 * Format date for display
 */
export declare function formatDate(date: Date, format: string): string;
/**
 * Generate date range
 */
export declare function generateDateRange(start: Date, end: Date): Date[];
/**
 * Calculate working days between two dates
 */
export declare function calculateWorkingDays(start: Date, end: Date, holidays?: Date[]): number;
/**
 * Check if two dates are the same day
 */
export declare function isSameDay(date1: Date, date2: Date): boolean;
//# sourceMappingURL=dateUtils.d.ts.map
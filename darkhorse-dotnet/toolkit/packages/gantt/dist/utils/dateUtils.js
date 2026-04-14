/**
 * Date utility functions for Gantt chart
 */
/**
 * Convert string or Date to Date object
 */
export function toDate(date) {
    if (!date)
        return null;
    if (date instanceof Date)
        return date;
    const parsed = new Date(date);
    return isNaN(parsed.getTime()) ? null : parsed;
}
/**
 * Add days to a date
 */
export function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}
/**
 * Calculate difference in days between two dates
 */
export function diffInDays(start, end) {
    const msPerDay = 1000 * 60 * 60 * 24;
    const utc1 = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
    const utc2 = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
    return Math.floor((utc2 - utc1) / msPerDay);
}
/**
 * Check if date is weekend
 */
export function isWeekend(date) {
    const day = date.getDay();
    return day === 0 || day === 6;
}
/**
 * Check if date is within range
 */
export function isDateInRange(date, start, end) {
    return date >= start && date <= end;
}
/**
 * Get start of day
 */
export function startOfDay(date) {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
}
/**
 * Get end of day
 */
export function endOfDay(date) {
    const result = new Date(date);
    result.setHours(23, 59, 59, 999);
    return result;
}
/**
 * Get start of week
 */
export function startOfWeek(date) {
    const result = new Date(date);
    const day = result.getDay();
    const diff = result.getDate() - day;
    result.setDate(diff);
    return startOfDay(result);
}
/**
 * Get start of month
 */
export function startOfMonth(date) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
}
/**
 * Get start of year
 */
export function startOfYear(date) {
    return new Date(date.getFullYear(), 0, 1);
}
/**
 * Format date for display
 */
export function formatDate(date, format) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return format
        .replace('YYYY', String(year))
        .replace('MM', month)
        .replace('DD', day);
}
/**
 * Generate date range
 */
export function generateDateRange(start, end) {
    const dates = [];
    const current = new Date(start);
    while (current <= end) {
        dates.push(new Date(current));
        current.setDate(current.getDate() + 1);
    }
    return dates;
}
/**
 * Calculate working days between two dates
 */
export function calculateWorkingDays(start, end, holidays = []) {
    let workingDays = 0;
    const current = new Date(start);
    while (current <= end) {
        if (!isWeekend(current) && !holidays.some(h => isSameDay(h, current))) {
            workingDays++;
        }
        current.setDate(current.getDate() + 1);
    }
    return workingDays;
}
/**
 * Check if two dates are the same day
 */
export function isSameDay(date1, date2) {
    return (date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate());
}
//# sourceMappingURL=dateUtils.js.map
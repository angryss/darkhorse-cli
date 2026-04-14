/**
 * Timeline calculation utilities
 */
import { startOfMonth, addDays, formatDate } from './dateUtils';
/**
 * Get timeline scale configuration based on view mode
 */
export function getTimelineScale(viewMode) {
    const scales = {
        Day: {
            majorUnit: 'Week',
            minorUnit: 'Day',
            majorFormat: 'MMM DD',
            minorFormat: 'DD',
            pixelsPerUnit: 50,
        },
        Week: {
            majorUnit: 'Month',
            minorUnit: 'Week',
            majorFormat: 'MMM YYYY',
            minorFormat: 'Wk',
            pixelsPerUnit: 60,
        },
        Month: {
            majorUnit: 'Year',
            minorUnit: 'Month',
            majorFormat: 'YYYY',
            minorFormat: 'MMM',
            pixelsPerUnit: 80,
        },
        Year: {
            majorUnit: 'Year',
            minorUnit: 'Month',
            majorFormat: 'YYYY',
            minorFormat: 'M',
            pixelsPerUnit: 40,
        },
    };
    return scales[viewMode];
}
/**
 * Calculate pixel position for a date on the timeline
 */
export function dateToPixel(date, timelineStart, pixelsPerDay) {
    const diffTime = date.getTime() - timelineStart.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return Math.round(diffDays * pixelsPerDay);
}
/**
 * Calculate date from pixel position on timeline
 */
export function pixelToDate(pixel, timelineStart, pixelsPerDay) {
    const days = pixel / pixelsPerDay;
    return addDays(timelineStart, Math.round(days));
}
/**
 * Generate timeline cells for rendering
 */
export function generateTimelineCells(start, end, viewMode) {
    const cells = [];
    const current = new Date(start);
    while (current <= end) {
        const label = formatTimelineLabel(current, viewMode);
        cells.push({
            date: new Date(current),
            label,
            type: 'minor',
        });
        // Increment based on view mode
        switch (viewMode) {
            case 'Day':
                current.setDate(current.getDate() + 1);
                break;
            case 'Week':
                current.setDate(current.getDate() + 7);
                break;
            case 'Month':
                current.setMonth(current.getMonth() + 1);
                break;
            case 'Year':
                current.setFullYear(current.getFullYear() + 1);
                break;
        }
    }
    return cells;
}
/**
 * Format timeline label based on view mode
 */
export function formatTimelineLabel(date, viewMode) {
    switch (viewMode) {
        case 'Day':
            return formatDate(date, 'DD');
        case 'Week':
            return `W${getWeekNumber(date)}`;
        case 'Month':
            return date.toLocaleString('default', { month: 'short' });
        case 'Year':
            return date.getFullYear().toString();
    }
}
/**
 * Get week number of year
 */
export function getWeekNumber(date) {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}
/**
 * Calculate timeline bounds from tasks
 */
export function calculateTimelineBounds(tasks, projectStart, projectEnd) {
    let minDate = projectStart ? new Date(projectStart) : null;
    let maxDate = projectEnd ? new Date(projectEnd) : null;
    for (const task of tasks) {
        if (task.startDate) {
            const start = new Date(task.startDate);
            if (!minDate || start < minDate) {
                minDate = start;
            }
        }
        if (task.endDate) {
            const end = new Date(task.endDate);
            if (!maxDate || end > maxDate) {
                maxDate = end;
            }
        }
    }
    // Default to current month if no dates
    if (!minDate) {
        minDate = startOfMonth(new Date());
    }
    if (!maxDate) {
        maxDate = addDays(minDate, 30);
    }
    // Add padding
    minDate = addDays(minDate, -7);
    maxDate = addDays(maxDate, 7);
    return { start: minDate, end: maxDate };
}
//# sourceMappingURL=timelineUtils.js.map
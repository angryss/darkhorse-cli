import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Month View - Calendar grid with events
 */
import { useMemo } from 'react';
import { parseDate, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isToday, } from '../utils/dateUtils';
import { filterEventsByDateRange, sortEventsByStart } from '../utils/eventUtils';
import styles from '../Scheduler.module.css';
export const MonthView = ({ currentDate, events, firstDayOfWeek = 0, eventTemplate, onEventClick, onSlotClick, }) => {
    const monthStart = useMemo(() => startOfMonth(currentDate), [currentDate]);
    const monthEnd = useMemo(() => endOfMonth(currentDate), [currentDate]);
    // Get calendar grid (includes days from previous/next month to fill weeks)
    const calendarStart = useMemo(() => startOfWeek(monthStart, firstDayOfWeek), [monthStart, firstDayOfWeek]);
    const calendarEnd = useMemo(() => endOfWeek(monthEnd, firstDayOfWeek), [monthEnd, firstDayOfWeek]);
    // Generate all days in the calendar grid
    const calendarDays = useMemo(() => {
        const days = [];
        let current = new Date(calendarStart);
        while (current <= calendarEnd) {
            days.push(new Date(current));
            current = addDays(current, 1);
        }
        return days;
    }, [calendarStart, calendarEnd]);
    // Filter events for the calendar range
    const calendarEvents = useMemo(() => {
        return filterEventsByDateRange(events, calendarStart, calendarEnd);
    }, [events, calendarStart, calendarEnd]);
    // Group events by day
    const eventsByDay = useMemo(() => {
        const grouped = new Map();
        calendarEvents.forEach(event => {
            const eventStart = parseDate(event.start);
            const eventEnd = parseDate(event.end);
            // Handle multi-day events
            let currentDay = new Date(eventStart);
            currentDay.setHours(0, 0, 0, 0);
            const endDay = new Date(eventEnd);
            endDay.setHours(0, 0, 0, 0);
            while (currentDay <= endDay) {
                const dayKey = currentDay.toISOString().split('T')[0] || '';
                if (!grouped.has(dayKey)) {
                    grouped.set(dayKey, []);
                }
                const dayEvents = grouped.get(dayKey);
                if (dayEvents) {
                    dayEvents.push(event);
                }
                currentDay = addDays(currentDay, 1);
            }
        });
        return grouped;
    }, [calendarEvents]);
    // Get week day names
    const weekDayNames = useMemo(() => {
        const names = [];
        for (let i = 0; i < 7; i++) {
            const day = addDays(calendarStart, i);
            names.push(day.toLocaleDateString('en-US', { weekday: 'short' }));
        }
        return names;
    }, [calendarStart]);
    const isCurrentMonth = (day) => {
        return day.getMonth() === currentDate.getMonth();
    };
    const getDayEvents = (day) => {
        const dayKey = day.toISOString().split('T')[0] || '';
        const dayEvents = eventsByDay.get(dayKey) || [];
        return sortEventsByStart(dayEvents);
    };
    const handleDayClick = (day) => {
        if (onSlotClick) {
            onSlotClick(day);
        }
    };
    const handleEventClick = (e, event) => {
        e.stopPropagation();
        if (onEventClick) {
            onEventClick(event);
        }
    };
    const MAX_VISIBLE_EVENTS = 3;
    return (_jsxs("div", { className: styles.month_view, role: "grid", "aria-label": "Month view", children: [_jsx("div", { className: styles.month_view__header, role: "row", children: weekDayNames.map((name, index) => (_jsx("div", { className: styles.month_view__header__day, role: "columnheader", children: name }, index))) }), _jsx("div", { className: styles.month_view__grid, children: calendarDays.map((day, index) => {
                    const dayEvents = getDayEvents(day);
                    const visibleEvents = dayEvents.slice(0, MAX_VISIBLE_EVENTS);
                    const moreCount = Math.max(0, dayEvents.length - MAX_VISIBLE_EVENTS);
                    return (_jsxs("div", { className: `${styles.month_view__cell} ${!isCurrentMonth(day) ? styles['month_view__cell--other_month'] : ''} ${isToday(day) ? styles['month_view__cell--today'] : ''}`, onClick: () => handleDayClick(day), role: "gridcell", tabIndex: 0, "aria-label": day.toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        }), onKeyDown: (e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handleDayClick(day);
                            }
                        }, children: [_jsx("div", { className: styles.month_view__cell__date, children: day.getDate() }), _jsxs("div", { className: styles.month_view__cell__events, children: [visibleEvents.map(event => (_jsx("div", { className: styles.month_view__event, onClick: (e) => handleEventClick(e, event), title: event.subject, role: "button", tabIndex: 0, onKeyDown: (e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault();
                                                handleEventClick(e, event);
                                            }
                                        }, children: eventTemplate ? eventTemplate(event) : event.subject }, event.id))), moreCount > 0 && (_jsxs("div", { className: `${styles.month_view__event} ${styles['month_view__event--more']}`, onClick: (e) => {
                                            e.stopPropagation();
                                            // Could open a modal showing all events for this day
                                        }, children: ["+", moreCount, " more"] }))] })] }, index));
                }) })] }));
};
MonthView.displayName = 'MonthView';
//# sourceMappingURL=MonthView.js.map
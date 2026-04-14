import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Timeline View - Horizontal time axis with resource rows
 * Supports Day, Week, WorkWeek, Month, and Year scales
 */
import { useMemo } from 'react';
import { parseDate, formatDate, formatTime, getViewDateRange, addDays, startOfMonth, getDaysInMonth, } from '../utils/dateUtils';
import { filterEventsByDateRange, filterEventsByResource } from '../utils/eventUtils';
import styles from '../Scheduler.module.css';
export const TimelineView = ({ view, currentDate, events, resources = [], firstDayOfWeek = 0, timeFormat = 'hh:mm a', eventTemplate, onEventClick, onSlotClick, }) => {
    // Get date range based on view type
    const dateRange = useMemo(() => {
        return getViewDateRange(currentDate, view, firstDayOfWeek);
    }, [currentDate, view, firstDayOfWeek]);
    // Generate time slots based on view
    const timeSlots = useMemo(() => {
        const slots = [];
        switch (view) {
            case 'TimelineDay': {
                // Show hours for a single day
                for (let hour = 0; hour < 24; hour++) {
                    const date = new Date(currentDate);
                    date.setHours(hour, 0, 0, 0);
                    slots.push({
                        date,
                        label: formatTime(date, timeFormat),
                    });
                }
                break;
            }
            case 'TimelineWeek':
            case 'TimelineWorkWeek': {
                // Show days in the week
                let current = new Date(dateRange.start);
                while (current <= dateRange.end) {
                    slots.push({
                        date: new Date(current),
                        label: current.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
                    });
                    current = addDays(current, 1);
                }
                break;
            }
            case 'TimelineMonth': {
                // Show days in the month
                const monthStart = startOfMonth(currentDate);
                const daysInMonth = getDaysInMonth(currentDate);
                for (let day = 1; day <= daysInMonth; day++) {
                    const date = new Date(monthStart);
                    date.setDate(day);
                    slots.push({
                        date,
                        label: String(day),
                    });
                }
                break;
            }
            case 'TimelineYear': {
                // Show months in the year
                for (let month = 0; month < 12; month++) {
                    const date = new Date(currentDate.getFullYear(), month, 1);
                    slots.push({
                        date,
                        label: date.toLocaleDateString('en-US', { month: 'short' }),
                    });
                }
                break;
            }
        }
        return slots;
    }, [view, currentDate, dateRange, firstDayOfWeek, timeFormat]);
    // Filter events for the current date range
    const visibleEvents = useMemo(() => {
        return filterEventsByDateRange(events, dateRange.start, dateRange.end);
    }, [events, dateRange]);
    // If no resources, create a single "default" resource
    const displayResources = useMemo(() => {
        if (resources.length === 0) {
            return [{ id: 'default', label: 'Events', color: '#3b82f6' }];
        }
        return resources;
    }, [resources]);
    // Group events by resource
    const eventsByResource = useMemo(() => {
        const grouped = new Map();
        displayResources.forEach(resource => {
            if (resources.length === 0) {
                // No resource grouping - show all events
                grouped.set(resource.id, visibleEvents);
            }
            else {
                const resourceEvents = filterEventsByResource(visibleEvents, resource.id);
                grouped.set(resource.id, resourceEvents);
            }
        });
        return grouped;
    }, [displayResources, visibleEvents, resources]);
    // Calculate event position and width
    const getEventStyle = (event) => {
        const eventStart = parseDate(event.start);
        const eventEnd = parseDate(event.end);
        const rangeStart = dateRange.start.getTime();
        const rangeEnd = dateRange.end.getTime();
        const rangeDuration = rangeEnd - rangeStart;
        // Clamp event to visible range
        const visibleStart = Math.max(eventStart.getTime(), rangeStart);
        const visibleEnd = Math.min(eventEnd.getTime(), rangeEnd);
        const left = ((visibleStart - rangeStart) / rangeDuration) * 100;
        const width = ((visibleEnd - visibleStart) / rangeDuration) * 100;
        return {
            left: `${left}%`,
            width: `${width}%`,
        };
    };
    const handleEventClick = (event) => {
        if (onEventClick) {
            onEventClick(event);
        }
    };
    const handleSlotClick = (slotDate, resourceId) => {
        if (onSlotClick) {
            onSlotClick(slotDate, displayResources.find(r => r.id === resourceId));
        }
    };
    return (_jsxs("div", { className: styles.timeline, role: "grid", "aria-label": `${view} view`, children: [_jsxs("div", { className: styles.timeline__header, children: [_jsx("div", { className: styles.timeline__resource_header, children: "Resource" }), _jsx("div", { className: styles.timeline__time_header, children: timeSlots.map((slot, index) => (_jsx("div", { className: styles.timeline__time_slot_header, children: slot.label }, index))) })] }), _jsxs("div", { className: styles.timeline__body, children: [_jsx("div", { className: styles.timeline__resources, children: displayResources.map(resource => (_jsx("div", { className: styles.timeline__resource, style: { borderLeft: `4px solid ${resource.color || '#3b82f6'}` }, children: resource.label }, resource.id))) }), _jsx("div", { className: styles.timeline__content, children: displayResources.map(resource => {
                            const resourceEvents = eventsByResource.get(resource.id) || [];
                            return (_jsx("div", { className: styles.timeline__row, onClick: () => handleSlotClick(dateRange.start, resource.id), role: "row", children: resourceEvents.map(event => {
                                    const eventStart = parseDate(event.start);
                                    const eventEnd = parseDate(event.end);
                                    return (_jsx("div", { className: styles.timeline__event, style: {
                                            ...getEventStyle(event),
                                            background: resource.color || '#3b82f6',
                                        }, onClick: (e) => {
                                            e.stopPropagation();
                                            handleEventClick(event);
                                        }, role: "button", tabIndex: 0, title: `${event.subject}\n${formatDate(eventStart, 'MMM D')} - ${formatDate(eventEnd, 'MMM D')}`, onKeyDown: (e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault();
                                                handleEventClick(event);
                                            }
                                        }, children: eventTemplate ? eventTemplate(event) : event.subject }, event.id));
                                }) }, resource.id));
                        }) })] })] }));
};
TimelineView.displayName = 'TimelineView';
//# sourceMappingURL=TimelineView.js.map
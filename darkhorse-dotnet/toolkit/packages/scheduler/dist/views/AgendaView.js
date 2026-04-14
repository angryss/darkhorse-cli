import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { parseDate, formatDate, formatTime, isSameDay } from '../utils/dateUtils';
import { filterEventsByDateRange, sortEventsByStart } from '../utils/eventUtils';
import styles from '../Scheduler.module.css';
export const AgendaView = ({ currentDate, events, resources, timeFormat = 'hh:mm a', eventTemplate, onEventClick, }) => {
    // Get events for next 30 days
    const startDate = new Date(currentDate);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(currentDate);
    endDate.setDate(endDate.getDate() + 30);
    endDate.setHours(23, 59, 59, 999);
    const visibleEvents = filterEventsByDateRange(events, startDate, endDate);
    const sortedEvents = sortEventsByStart(visibleEvents);
    // Group events by date
    const eventsByDate = new Map();
    sortedEvents.forEach(event => {
        const eventDate = parseDate(event.start);
        const dateKey = formatDate(eventDate, 'YYYY-MM-DD');
        if (!eventsByDate.has(dateKey)) {
            eventsByDate.set(dateKey, []);
        }
        eventsByDate.get(dateKey).push(event);
    });
    // Convert to array and sort by date
    const groupedEvents = Array.from(eventsByDate.entries()).sort((a, b) => {
        return new Date(a[0]).getTime() - new Date(b[0]).getTime();
    });
    if (groupedEvents.length === 0) {
        return (_jsxs("div", { className: styles.agenda__empty, children: [_jsx("div", { className: styles.agenda__empty__icon, children: "\uD83D\uDCC5" }), _jsx("div", { className: styles.agenda__empty__text, children: "No events scheduled in the next 30 days" })] }));
    }
    return (_jsx("div", { className: styles.agenda, children: groupedEvents.map(([dateKey, dateEvents]) => {
            const date = new Date(dateKey);
            const isCurrentDay = isSameDay(date, new Date());
            return (_jsxs("div", { className: styles.agenda__group, children: [_jsxs("div", { className: `${styles.agenda__date} ${isCurrentDay ? styles['agenda__date--today'] : ''}`, children: [_jsx("div", { className: styles.agenda__date__day, children: date.toLocaleDateString('en-US', { weekday: 'short' }) }), _jsx("div", { className: styles.agenda__date__date, children: date.getDate() }), _jsx("div", { className: styles.agenda__date__month, children: date.toLocaleDateString('en-US', { month: 'short' }) })] }), _jsx("div", { className: styles.agenda__events, children: dateEvents.map(event => {
                            const eventStart = parseDate(event.start);
                            const eventEnd = parseDate(event.end);
                            const resourceLabel = resources?.find(r => r.id === event.resourceId)?.label;
                            return (_jsxs("div", { className: styles.agenda__event, onClick: () => onEventClick?.(event), role: "button", tabIndex: 0, onKeyDown: (e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        onEventClick?.(event);
                                    }
                                }, children: [_jsx("div", { className: styles.agenda__event__time, children: event.isAllDay ? (_jsx("span", { children: "All Day" })) : (_jsxs(_Fragment, { children: [_jsx("span", { children: formatTime(eventStart, timeFormat) }), _jsx("span", { className: styles.agenda__event__time__separator, children: "-" }), _jsx("span", { children: formatTime(eventEnd, timeFormat) })] })) }), _jsx("div", { className: styles.agenda__event__content, children: eventTemplate ? (eventTemplate(event)) : (_jsxs(_Fragment, { children: [_jsx("div", { className: styles.agenda__event__subject, children: event.subject }), event.location && (_jsxs("div", { className: styles.agenda__event__location, children: ["\uD83D\uDCCD ", event.location] })), resourceLabel && (_jsxs("div", { className: styles.agenda__event__resource, children: ["\uD83D\uDC64 ", resourceLabel] })), event.description && (_jsx("div", { className: styles.agenda__event__description, children: event.description }))] })) })] }, event.id));
                        }) })] }, dateKey));
        }) }));
};
AgendaView.displayName = 'AgendaView';
//# sourceMappingURL=AgendaView.js.map
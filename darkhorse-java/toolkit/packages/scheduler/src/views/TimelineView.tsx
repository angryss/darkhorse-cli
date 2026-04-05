/**
 * Timeline View - Horizontal time axis with resource rows
 * Supports Day, Week, WorkWeek, Month, and Year scales
 */

import React, { useMemo } from 'react';
import { SchedulerViewProps, SchedulerEvent, SchedulerView } from '../types';
import {
  parseDate,
  formatDate,
  formatTime,
  getViewDateRange,
  addDays,
  startOfMonth,
  getDaysInMonth,
} from '../utils/dateUtils';
import { filterEventsByDateRange, filterEventsByResource } from '../utils/eventUtils';
import styles from '../Scheduler.module.css';

interface TimelineViewProps extends SchedulerViewProps {
  view: SchedulerView;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  view,
  currentDate,
  events,
  resources = [],
  firstDayOfWeek = 0,
  timeFormat = 'hh:mm a',
  eventTemplate,
  onEventClick,
  onSlotClick,
}) => {
  // Get date range based on view type
  const dateRange = useMemo(() => {
    return getViewDateRange(currentDate, view, firstDayOfWeek);
  }, [currentDate, view, firstDayOfWeek]);

  // Generate time slots based on view
  const timeSlots = useMemo(() => {
    const slots: { date: Date; label: string }[] = [];

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
    const grouped = new Map<string | number, SchedulerEvent[]>();

    displayResources.forEach(resource => {
      if (resources.length === 0) {
        // No resource grouping - show all events
        grouped.set(resource.id, visibleEvents);
      } else {
        const resourceEvents = filterEventsByResource(visibleEvents, resource.id);
        grouped.set(resource.id, resourceEvents);
      }
    });

    return grouped;
  }, [displayResources, visibleEvents, resources]);

  // Calculate event position and width
  const getEventStyle = (event: SchedulerEvent): React.CSSProperties => {
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

  const handleEventClick = (event: SchedulerEvent) => {
    if (onEventClick) {
      onEventClick(event);
    }
  };

  const handleSlotClick = (slotDate: Date, resourceId: string | number) => {
    if (onSlotClick) {
      onSlotClick(slotDate, displayResources.find(r => r.id === resourceId));
    }
  };

  return (
    <div className={styles.timeline} role="grid" aria-label={`${view} view`}>
      {/* Header */}
      <div className={styles.timeline__header}>
        <div className={styles.timeline__resource_header}>
          Resource
        </div>
        <div className={styles.timeline__time_header}>
          {timeSlots.map((slot, index) => (
            <div key={index} className={styles.timeline__time_slot_header}>
              {slot.label}
            </div>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className={styles.timeline__body}>
        {/* Resource labels */}
        <div className={styles.timeline__resources}>
          {displayResources.map(resource => (
            <div
              key={resource.id}
              className={styles.timeline__resource}
              style={{ borderLeft: `4px solid ${resource.color || '#3b82f6'}` }}
            >
              {resource.label}
            </div>
          ))}
        </div>

        {/* Timeline content */}
        <div className={styles.timeline__content}>
          {displayResources.map(resource => {
            const resourceEvents = eventsByResource.get(resource.id) || [];

            return (
              <div
                key={resource.id}
                className={styles.timeline__row}
                onClick={() => handleSlotClick(dateRange.start, resource.id)}
                role="row"
              >
                {resourceEvents.map(event => {
                  const eventStart = parseDate(event.start);
                  const eventEnd = parseDate(event.end);

                  return (
                    <div
                      key={event.id}
                      className={styles.timeline__event}
                      style={{
                        ...getEventStyle(event),
                        background: resource.color || '#3b82f6',
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEventClick(event);
                      }}
                      role="button"
                      tabIndex={0}
                      title={`${event.subject}\n${formatDate(eventStart, 'MMM D')} - ${formatDate(eventEnd, 'MMM D')}`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleEventClick(event);
                        }
                      }}
                    >
                      {eventTemplate ? eventTemplate(event) : event.subject}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

TimelineView.displayName = 'TimelineView';


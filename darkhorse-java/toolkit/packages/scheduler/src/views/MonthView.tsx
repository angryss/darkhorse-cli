/**
 * Month View - Calendar grid with events
 */

import React, { useMemo } from 'react';
import { SchedulerViewProps, SchedulerEvent } from '../types';
import {
  parseDate,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isToday,
} from '../utils/dateUtils';
import { filterEventsByDateRange, sortEventsByStart } from '../utils/eventUtils';
import styles from '../Scheduler.module.css';

export const MonthView: React.FC<SchedulerViewProps> = ({
  currentDate,
  events,
  firstDayOfWeek = 0,
  eventTemplate,
  onEventClick,
  onSlotClick,
}) => {
  const monthStart = useMemo(() => startOfMonth(currentDate), [currentDate]);
  const monthEnd = useMemo(() => endOfMonth(currentDate), [currentDate]);

  // Get calendar grid (includes days from previous/next month to fill weeks)
  const calendarStart = useMemo(() => startOfWeek(monthStart, firstDayOfWeek), [monthStart, firstDayOfWeek]);
  const calendarEnd = useMemo(() => endOfWeek(monthEnd, firstDayOfWeek), [monthEnd, firstDayOfWeek]);

  // Generate all days in the calendar grid
  const calendarDays = useMemo(() => {
    const days: Date[] = [];
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
    const grouped = new Map<string, SchedulerEvent[]>();

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
    const names: string[] = [];
    for (let i = 0; i < 7; i++) {
      const day = addDays(calendarStart, i);
      names.push(day.toLocaleDateString('en-US', { weekday: 'short' }));
    }
    return names;
  }, [calendarStart]);

  const isCurrentMonth = (day: Date): boolean => {
    return day.getMonth() === currentDate.getMonth();
  };

  const getDayEvents = (day: Date): SchedulerEvent[] => {
    const dayKey = day.toISOString().split('T')[0] || '';
    const dayEvents = eventsByDay.get(dayKey) || [];
    return sortEventsByStart(dayEvents);
  };

  const handleDayClick = (day: Date) => {
    if (onSlotClick) {
      onSlotClick(day);
    }
  };

  const handleEventClick = (e: React.MouseEvent, event: SchedulerEvent) => {
    e.stopPropagation();
    if (onEventClick) {
      onEventClick(event);
    }
  };

  const MAX_VISIBLE_EVENTS = 3;

  return (
    <div className={styles.month_view} role="grid" aria-label="Month view">
      {/* Header with day names */}
      <div className={styles.month_view__header} role="row">
        {weekDayNames.map((name, index) => (
          <div
            key={index}
            className={styles.month_view__header__day}
            role="columnheader"
          >
            {name}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className={styles.month_view__grid}>
        {calendarDays.map((day, index) => {
          const dayEvents = getDayEvents(day);
          const visibleEvents = dayEvents.slice(0, MAX_VISIBLE_EVENTS);
          const moreCount = Math.max(0, dayEvents.length - MAX_VISIBLE_EVENTS);

          return (
            <div
              key={index}
              className={`${styles.month_view__cell} ${
                !isCurrentMonth(day) ? styles['month_view__cell--other_month'] : ''
              } ${isToday(day) ? styles['month_view__cell--today'] : ''}`}
              onClick={() => handleDayClick(day)}
              role="gridcell"
              tabIndex={0}
              aria-label={day.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleDayClick(day);
                }
              }}
            >
              <div className={styles.month_view__cell__date}>
                {day.getDate()}
              </div>

              <div className={styles.month_view__cell__events}>
                {visibleEvents.map(event => (
                  <div
                    key={event.id}
                    className={styles.month_view__event}
                    onClick={(e) => handleEventClick(e, event)}
                    title={event.subject}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleEventClick(e as unknown as React.MouseEvent, event);
                      }
                    }}
                  >
                    {eventTemplate ? eventTemplate(event) : event.subject}
                  </div>
                ))}

                {moreCount > 0 && (
                  <div
                    className={`${styles.month_view__event} ${styles['month_view__event--more']}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      // Could open a modal showing all events for this day
                    }}
                  >
                    +{moreCount} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

MonthView.displayName = 'MonthView';


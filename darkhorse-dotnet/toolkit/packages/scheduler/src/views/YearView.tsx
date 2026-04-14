/**
 * Year View - Overview of all months in a year
 */

import React, { useMemo } from 'react';
import { SchedulerViewProps, SchedulerEvent } from '../types';
import {
  parseDate,
  startOfYear,
  endOfYear,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isToday,
} from '../utils/dateUtils';
import { filterEventsByDateRange } from '../utils/eventUtils';
import styles from '../Scheduler.module.css';

export const YearView: React.FC<SchedulerViewProps> = ({
  currentDate,
  events,
  firstDayOfWeek = 0,
  onSlotClick,
}) => {
  const yearStart = useMemo(() => startOfYear(currentDate), [currentDate]);
  const yearEnd = useMemo(() => endOfYear(currentDate), [currentDate]);

  // Get all months in the year
  const months = useMemo(() => {
    const monthList: Date[] = [];
    for (let i = 0; i < 12; i++) {
      const month = new Date(currentDate.getFullYear(), i, 1);
      monthList.push(month);
    }
    return monthList;
  }, [currentDate]);

  // Filter events for the year
  const yearEvents = useMemo(() => {
    return filterEventsByDateRange(events, yearStart, yearEnd);
  }, [events, yearStart, yearEnd]);

  // Group events by date
  const eventsByDate = useMemo(() => {
    const grouped = new Map<string, SchedulerEvent[]>();

    yearEvents.forEach(event => {
      const eventStart = parseDate(event.start);
      const eventEnd = parseDate(event.end);

      // Handle multi-day events
      let currentDay = new Date(eventStart);
      currentDay.setHours(0, 0, 0, 0);
      const endDay = new Date(eventEnd);
      endDay.setHours(0, 0, 0, 0);

      while (currentDay <= endDay) {
        const dayKey = currentDay.toISOString().split('T')[0] || '';
        grouped.set(dayKey, [...(grouped.get(dayKey) || []), event]);
        currentDay = addDays(currentDay, 1);
      }
    });

    return grouped;
  }, [yearEvents]);

  // Generate days for a month including previous/next month to fill weeks
  const getMonthDays = (monthDate: Date): Date[] => {
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);
    const calendarStart = startOfWeek(monthStart, firstDayOfWeek);
    const calendarEnd = endOfWeek(monthEnd, firstDayOfWeek);

    const days: Date[] = [];
    let current = new Date(calendarStart);

    while (current <= calendarEnd) {
      days.push(new Date(current));
      current = addDays(current, 1);
    }

    return days;
  };

  const isCurrentMonth = (day: Date, monthDate: Date): boolean => {
    return day.getMonth() === monthDate.getMonth();
  };

  const hasEvents = (day: Date): boolean => {
    const dayKey = day.toISOString().split('T')[0] || '';
    return eventsByDate.has(dayKey);
  };

  const handleDayClick = (day: Date) => {
    if (onSlotClick) {
      onSlotClick(day);
    }
  };

  // Get week day initials
  const weekDayInitials = useMemo(() => {
    const start = startOfWeek(new Date(), firstDayOfWeek);
    const initials: string[] = [];
    for (let i = 0; i < 7; i++) {
      const day = addDays(start, i);
      initials.push(day.toLocaleDateString('en-US', { weekday: 'narrow' }));
    }
    return initials;
  }, [firstDayOfWeek]);

  return (
    <div className={styles.year_view} role="grid" aria-label="Year view">
      <div className={styles.year_view__title}>
        {currentDate.getFullYear()}
      </div>

      <div className={styles.year_view__grid}>
        {months.map((month, monthIndex) => {
          const monthDays = getMonthDays(month);

          return (
            <div key={monthIndex} className={styles.year_view__month}>
              <div className={styles.year_view__month__title}>
                {month.toLocaleDateString('en-US', { month: 'long' })}
              </div>

              {/* Week day headers */}
              <div className={styles.year_view__month__grid}>
                {weekDayInitials.map((initial, index) => (
                  <div
                    key={`header-${index}`}
                    style={{
                      fontSize: '10px',
                      color: '#6b7280',
                      textAlign: 'center',
                      fontWeight: 600,
                    }}
                  >
                    {initial}
                  </div>
                ))}
              </div>

              {/* Days grid */}
              <div className={styles.year_view__month__grid}>
                {monthDays.map((day, dayIndex) => {
                  const isInCurrentMonth = isCurrentMonth(day, month);
                  const isTodayDate = isToday(day);
                  const hasEventsOnDay = hasEvents(day);

                  return (
                    <div
                      key={dayIndex}
                      className={`${styles.year_view__month__day} ${
                        isTodayDate ? styles['year_view__month__day--today'] : ''
                      } ${hasEventsOnDay && isInCurrentMonth ? styles['year_view__month__day--has_events'] : ''}`}
                      style={{
                        opacity: isInCurrentMonth ? 1 : 0.3,
                      }}
                      onClick={() => isInCurrentMonth && handleDayClick(day)}
                      role="gridcell"
                      tabIndex={isInCurrentMonth ? 0 : -1}
                      aria-label={day.toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                      })}
                      onKeyDown={(e) => {
                        if (isInCurrentMonth && (e.key === 'Enter' || e.key === ' ')) {
                          e.preventDefault();
                          handleDayClick(day);
                        }
                      }}
                    >
                      {day.getDate()}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

YearView.displayName = 'YearView';


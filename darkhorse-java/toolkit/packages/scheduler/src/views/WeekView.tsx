/**
 * Week View - Full week time grid
 */

import React, { useMemo } from 'react';
import { SchedulerViewProps, SchedulerEvent } from '../types';
import {
  parseDate,
  formatTime,
  getTimeSlots,
  startOfWeek,
  endOfWeek,
  addDays,
  parseTime,
  isToday,
  isWorkDay,
} from '../utils/dateUtils';
import { filterEventsByDateRange, calculateEventLayout, isAllDay } from '../utils/eventUtils';
import styles from '../Scheduler.module.css';

export const WeekView: React.FC<SchedulerViewProps> = ({
  currentDate,
  events,
  workDays = [1, 2, 3, 4, 5],
  firstDayOfWeek = 0,
  dayStartHour = '00:00',
  dayEndHour = '23:59',
  workStartHour = '09:00',
  workEndHour = '18:00',
  timeScale = { majorSlot: 60, minorSlotCount: 2 },
  timeFormat = 'hh:mm a',
  eventTemplate,
  dateHeaderTemplate,
  onEventClick,
  onSlotClick,
}) => {
  const weekStart = useMemo(() => startOfWeek(currentDate, firstDayOfWeek), [currentDate, firstDayOfWeek]);
  const weekEnd = useMemo(() => endOfWeek(currentDate, firstDayOfWeek), [currentDate, firstDayOfWeek]);

  // Get all days in the week
  const weekDays = useMemo(() => {
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      days.push(addDays(weekStart, i));
    }
    return days;
  }, [weekStart]);

  // Get time slots for the day
  const timeSlots = useMemo(
    () => getTimeSlots(dayStartHour, dayEndHour, timeScale.majorSlot, timeScale.minorSlotCount),
    [dayStartHour, dayEndHour, timeScale]
  );

  // Filter events for this week
  const weekEvents = useMemo(() => {
    return filterEventsByDateRange(events, weekStart, weekEnd);
  }, [events, weekStart, weekEnd]);

  // Group events by day
  const eventsByDay = useMemo(() => {
    return weekDays.map(day => {
      const dayStart = new Date(day);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(day);
      dayEnd.setHours(23, 59, 59, 999);

      const dayEvents = weekEvents.filter(event => {
        const eventStart = parseDate(event.start);
        const eventEnd = parseDate(event.end);
        return eventStart < dayEnd && eventEnd > dayStart;
      });

      const allDayEvents = dayEvents.filter(isAllDay);
      const timedEvents = dayEvents.filter(e => !isAllDay(e));

      const workStart = parseTime(dayStartHour);
      const workEnd = parseTime(dayEndHour);
      const startDate = new Date(day);
      startDate.setHours(workStart.hours, workStart.minutes, 0, 0);
      const endDate = new Date(day);
      endDate.setHours(workEnd.hours, workEnd.minutes, 0, 0);

      const layout = calculateEventLayout(timedEvents, startDate, endDate, 60);

      return { day, allDayEvents, timedEvents, layout };
    });
  }, [weekDays, weekEvents, dayStartHour, dayEndHour]);

  // Check if time is within work hours
  const isWorkHour = (time: Date): boolean => {
    const workStart = parseTime(workStartHour);
    const workEnd = parseTime(workEndHour);
    const hours = time.getHours();
    const minutes = time.getMinutes();
    const timeInMinutes = hours * 60 + minutes;
    const workStartMinutes = workStart.hours * 60 + workStart.minutes;
    const workEndMinutes = workEnd.hours * 60 + workEnd.minutes;
    return timeInMinutes >= workStartMinutes && timeInMinutes < workEndMinutes;
  };

  // Get current time indicator position
  const getCurrentTimePosition = (day: Date): number | null => {
    if (!isToday(day)) return null;

    const now = new Date();
    const workStart = parseTime(dayStartHour);
    const workEnd = parseTime(dayEndHour);
    const startDate = new Date(day);
    startDate.setHours(workStart.hours, workStart.minutes, 0, 0);
    const endDate = new Date(day);
    endDate.setHours(workEnd.hours, workEnd.minutes, 0, 0);

    if (now < startDate || now > endDate) return null;

    const duration = endDate.getTime() - startDate.getTime();
    const offset = now.getTime() - startDate.getTime();
    return (offset / duration) * 100;
  };

  const handleSlotClick = (slotTime: Date, day: Date) => {
    if (onSlotClick) {
      const dateTime = new Date(day);
      dateTime.setHours(slotTime.getHours(), slotTime.getMinutes(), 0, 0);
      onSlotClick(dateTime);
    }
  };

  const handleEventClick = (event: SchedulerEvent) => {
    if (onEventClick) {
      onEventClick(event);
    }
  };

  return (
    <div className={styles.time_grid} role="grid" aria-label="Week view">
      {/* Header */}
      <div className={styles.time_grid__header}>
        <div className={styles.time_grid__time_header} aria-label="Time">
          Time
        </div>
        <div className={styles.time_grid__day_headers}>
          {weekDays.map((day, index) => (
            <div
              key={index}
              className={`${styles.time_grid__day_header} ${
                isToday(day) ? styles['time_grid__day_header--today'] : ''
              }`}
            >
              {dateHeaderTemplate ? (
                dateHeaderTemplate({ date: day })
              ) : (
                <>
                  <div className={styles.time_grid__day_header__day}>
                    {day.toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div className={styles.time_grid__day_header__date}>
                    {day.getDate()}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className={styles.time_grid__body}>
        {/* Time column */}
        <div className={styles.time_grid__time_column}>
          {timeSlots.map((slot, index) => (
            <div
              key={index}
              className={styles.time_grid__time_slot}
              style={{ height: 60 / timeScale.minorSlotCount }}
            >
              {slot.getMinutes() === 0 && formatTime(slot, timeFormat)}
            </div>
          ))}
        </div>

        {/* Day columns */}
        <div className={styles.time_grid__days}>
          {eventsByDay.map(({ day, layout }, dayIndex) => {
            const currentTimePosition = getCurrentTimePosition(day);
            const isWeekendDay = !isWorkDay(day, workDays);

            return (
              <div
                key={dayIndex}
                className={`${styles.time_grid__day} ${
                  isWeekendDay ? styles['time_grid__day--weekend'] : ''
                }`}
              >
                {/* Time slots */}
                <div className={styles.time_grid__day__slots}>
                  {timeSlots.map((slot, slotIndex) => (
                    <div
                      key={slotIndex}
                      className={`${styles.time_grid__slot} ${
                        isWorkHour(slot) && !isWeekendDay
                          ? styles['time_grid__slot--work_hours']
                          : styles['time_grid__slot--non_work_hours']
                      }`}
                      style={{ height: 60 / timeScale.minorSlotCount }}
                      onClick={() => handleSlotClick(slot, day)}
                      role="gridcell"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleSlotClick(slot, day);
                        }
                      }}
                    />
                  ))}
                </div>

                {/* Current time indicator */}
                {currentTimePosition !== null && (
                  <div
                    className={styles.time_grid__current_time}
                    style={{ top: `${currentTimePosition}%` }}
                    aria-label="Current time"
                  />
                )}

                {/* Events */}
                <div className={styles.time_grid__events}>
                  {layout.map(({ event, top, height, left, width }) => {
                    const eventStart = parseDate(event.start);
                    const eventEnd = parseDate(event.end);

                    return (
                      <div
                        key={event.id}
                        className={`${styles.time_grid__event} ${
                          event.isReadonly ? styles['time_grid__event--readonly'] : ''
                        } ${event.recurrenceRule ? styles['time_grid__event--recurring'] : ''}`}
                        style={{
                          top: `${top}%`,
                          height: `${height}%`,
                          left: `${left}%`,
                          width: `${width}%`,
                        }}
                        onClick={() => handleEventClick(event)}
                        role="button"
                        tabIndex={0}
                        title={`${event.subject}\n${formatTime(eventStart, timeFormat)} - ${formatTime(
                          eventEnd,
                          timeFormat
                        )}`}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleEventClick(event);
                          }
                        }}
                      >
                        {eventTemplate ? (
                          eventTemplate(event)
                        ) : (
                          <>
                            <div className={styles.time_grid__event__subject}>{event.subject}</div>
                            <div className={styles.time_grid__event__time}>
                              {formatTime(eventStart, timeFormat)}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

WeekView.displayName = 'WeekView';


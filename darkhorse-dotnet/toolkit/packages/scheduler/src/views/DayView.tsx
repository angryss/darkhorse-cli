/**
 * Day View - Single day time grid
 */

import React, { useMemo } from 'react';
import { SchedulerViewProps, SchedulerEvent } from '../types';
import {
  parseDate,
  formatDate,
  formatTime,
  getTimeSlots,
  startOfDay,
  endOfDay,
  parseTime,
  isToday,
} from '../utils/dateUtils';
import { filterEventsByDateRange, calculateEventLayout, isAllDay } from '../utils/eventUtils';
import styles from '../Scheduler.module.css';

export const DayView: React.FC<SchedulerViewProps> = ({
  currentDate,
  events,
  dayStartHour = '00:00',
  dayEndHour = '23:59',
  workStartHour = '09:00',
  workEndHour = '18:00',
  timeScale = { majorSlot: 60, minorSlotCount: 2 },
  timeFormat = 'hh:mm a',
  eventTemplate,
  onEventClick,
  onSlotClick,
}) => {
  const dayStart = useMemo(() => startOfDay(currentDate), [currentDate]);
  const dayEnd = useMemo(() => endOfDay(currentDate), [currentDate]);

  // Get time slots for the day
  const timeSlots = useMemo(
    () => getTimeSlots(dayStartHour, dayEndHour, timeScale.majorSlot, timeScale.minorSlotCount),
    [dayStartHour, dayEndHour, timeScale]
  );

  // Filter events for this day
  const dayEvents = useMemo(() => {
    return filterEventsByDateRange(events, dayStart, dayEnd);
  }, [events, dayStart, dayEnd]);

  // Separate all-day and timed events
  const allDayEvents = dayEvents.filter(isAllDay);
  const timedEvents = dayEvents.filter(e => !isAllDay(e));

  // Calculate event layout
  const eventLayout = useMemo(() => {
    const workStart = parseTime(dayStartHour);
    const workEnd = parseTime(dayEndHour);
    const startDate = new Date(currentDate);
    startDate.setHours(workStart.hours, workStart.minutes, 0, 0);
    const endDate = new Date(currentDate);
    endDate.setHours(workEnd.hours, workEnd.minutes, 0, 0);

    return calculateEventLayout(timedEvents, startDate, endDate, 60);
  }, [timedEvents, currentDate, dayStartHour, dayEndHour]);

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
  const getCurrentTimePosition = (): number | null => {
    if (!isToday(currentDate)) return null;

    const now = new Date();
    const workStart = parseTime(dayStartHour);
    const workEnd = parseTime(dayEndHour);
    const startDate = new Date(currentDate);
    startDate.setHours(workStart.hours, workStart.minutes, 0, 0);
    const endDate = new Date(currentDate);
    endDate.setHours(workEnd.hours, workEnd.minutes, 0, 0);

    if (now < startDate || now > endDate) return null;

    const duration = endDate.getTime() - startDate.getTime();
    const offset = now.getTime() - startDate.getTime();
    return (offset / duration) * 100;
  };

  const currentTimePosition = getCurrentTimePosition();

  const handleSlotClick = (slotTime: Date) => {
    if (onSlotClick) {
      onSlotClick(slotTime);
    }
  };

  const handleEventClick = (event: SchedulerEvent) => {
    if (onEventClick) {
      onEventClick(event);
    }
  };

  return (
    <div className={styles.time_grid} role="grid" aria-label="Day view">
      {/* All-day events row */}
      {allDayEvents.length > 0 && (
        <div style={{ borderBottom: '1px solid #e5e7eb', padding: '8px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
            All Day
          </div>
          {allDayEvents.map(event => (
            <div
              key={event.id}
              className={`${styles.time_grid__event} ${styles['time_grid__event--all_day']}`}
              onClick={() => handleEventClick(event)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleEventClick(event);
                }
              }}
            >
              {eventTemplate ? eventTemplate(event) : event.subject}
            </div>
          ))}
        </div>
      )}

      {/* Header */}
      <div className={styles.time_grid__header}>
        <div className={styles.time_grid__time_header} aria-label="Time">
          Time
        </div>
        <div className={styles.time_grid__day_headers}>
          <div
            className={`${styles.time_grid__day_header} ${
              isToday(currentDate) ? styles['time_grid__day_header--today'] : ''
            }`}
          >
            <div className={styles.time_grid__day_header__day}>
              {currentDate.toLocaleDateString('en-US', { weekday: 'short' })}
            </div>
            <div className={styles.time_grid__day_header__date}>
              {formatDate(currentDate, 'MMM D, YYYY')}
            </div>
          </div>
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

        {/* Day column */}
        <div className={styles.time_grid__days}>
          <div className={styles.time_grid__day}>
            {/* Time slots */}
            <div className={styles.time_grid__day__slots}>
              {timeSlots.map((slot, index) => (
                <div
                  key={index}
                  className={`${styles.time_grid__slot} ${
                    isWorkHour(slot)
                      ? styles['time_grid__slot--work_hours']
                      : styles['time_grid__slot--non_work_hours']
                  }`}
                  style={{ height: 60 / timeScale.minorSlotCount }}
                  onClick={() => handleSlotClick(slot)}
                  role="gridcell"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSlotClick(slot);
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
              {eventLayout.map(({ event, top, height, left, width }) => {
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
                          {formatTime(eventStart, timeFormat)} - {formatTime(eventEnd, timeFormat)}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

DayView.displayName = 'DayView';


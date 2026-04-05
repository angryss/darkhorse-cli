/**
 * Agenda View - List of events grouped by date
 */

import React from 'react';
import { SchedulerViewProps, SchedulerEvent } from '../types';
import { parseDate, formatDate, formatTime, isSameDay } from '../utils/dateUtils';
import { filterEventsByDateRange, sortEventsByStart } from '../utils/eventUtils';
import styles from '../Scheduler.module.css';

export const AgendaView: React.FC<SchedulerViewProps> = ({
  currentDate,
  events,
  resources,
  timeFormat = 'hh:mm a',
  eventTemplate,
  onEventClick,
}) => {
  // Get events for next 30 days
  const startDate = new Date(currentDate);
  startDate.setHours(0, 0, 0, 0);
  
  const endDate = new Date(currentDate);
  endDate.setDate(endDate.getDate() + 30);
  endDate.setHours(23, 59, 59, 999);
  
  const visibleEvents = filterEventsByDateRange(events, startDate, endDate);
  const sortedEvents = sortEventsByStart(visibleEvents);
  
  // Group events by date
  const eventsByDate = new Map<string, SchedulerEvent[]>();
  
  sortedEvents.forEach(event => {
    const eventDate = parseDate(event.start);
    const dateKey = formatDate(eventDate, 'YYYY-MM-DD');
    
    if (!eventsByDate.has(dateKey)) {
      eventsByDate.set(dateKey, []);
    }
    
    eventsByDate.get(dateKey)!.push(event);
  });
  
  // Convert to array and sort by date
  const groupedEvents = Array.from(eventsByDate.entries()).sort((a, b) => {
    return new Date(a[0]).getTime() - new Date(b[0]).getTime();
  });
  
  if (groupedEvents.length === 0) {
    return (
      <div className={styles.agenda__empty}>
        <div className={styles.agenda__empty__icon}>📅</div>
        <div className={styles.agenda__empty__text}>
          No events scheduled in the next 30 days
        </div>
      </div>
    );
  }
  
  return (
    <div className={styles.agenda}>
      {groupedEvents.map(([dateKey, dateEvents]) => {
        const date = new Date(dateKey);
        const isCurrentDay = isSameDay(date, new Date());
        
        return (
          <div key={dateKey} className={styles.agenda__group}>
            <div className={`${styles.agenda__date} ${isCurrentDay ? styles['agenda__date--today'] : ''}`}>
              <div className={styles.agenda__date__day}>
                {date.toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
              <div className={styles.agenda__date__date}>
                {date.getDate()}
              </div>
              <div className={styles.agenda__date__month}>
                {date.toLocaleDateString('en-US', { month: 'short' })}
              </div>
            </div>
            
            <div className={styles.agenda__events}>
              {dateEvents.map(event => {
                const eventStart = parseDate(event.start);
                const eventEnd = parseDate(event.end);
                const resourceLabel = resources?.find(r => r.id === event.resourceId)?.label;
                
                return (
                  <div
                    key={event.id}
                    className={styles.agenda__event}
                    onClick={() => onEventClick?.(event)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onEventClick?.(event);
                      }
                    }}
                  >
                    <div className={styles.agenda__event__time}>
                      {event.isAllDay ? (
                        <span>All Day</span>
                      ) : (
                        <>
                          <span>{formatTime(eventStart, timeFormat)}</span>
                          <span className={styles.agenda__event__time__separator}>-</span>
                          <span>{formatTime(eventEnd, timeFormat)}</span>
                        </>
                      )}
                    </div>
                    
                    <div className={styles.agenda__event__content}>
                      {eventTemplate ? (
                        eventTemplate(event)
                      ) : (
                        <>
                          <div className={styles.agenda__event__subject}>
                            {event.subject}
                          </div>
                          
                          {event.location && (
                            <div className={styles.agenda__event__location}>
                              📍 {event.location}
                            </div>
                          )}
                          
                          {resourceLabel && (
                            <div className={styles.agenda__event__resource}>
                              👤 {resourceLabel}
                            </div>
                          )}
                          
                          {event.description && (
                            <div className={styles.agenda__event__description}>
                              {event.description}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

AgendaView.displayName = 'AgendaView';


/**
 * Event utility functions for Scheduler
 */

import { SchedulerEvent } from '../types';
import { parseDate, eventsOverlap } from './dateUtils';

/**
 * Filter events by date range
 */
export function filterEventsByDateRange(
  events: SchedulerEvent[],
  startDate: Date,
  endDate: Date
): SchedulerEvent[] {
  return events.filter(event => {
    const eventStart = parseDate(event.start);
    const eventEnd = parseDate(event.end);
    
    return eventStart < endDate && eventEnd > startDate;
  });
}

/**
 * Filter events by resource
 */
export function filterEventsByResource(
  events: SchedulerEvent[],
  resourceId: string | number
): SchedulerEvent[] {
  return events.filter(event => {
    if (!event.resourceId) return false;
    
    if (Array.isArray(event.resourceId)) {
      return event.resourceId.includes(resourceId);
    }
    
    return event.resourceId === resourceId;
  });
}

/**
 * Group overlapping events
 */
export function groupOverlappingEvents(events: SchedulerEvent[]): SchedulerEvent[][] {
  const sortedEvents = [...events].sort((a, b) => {
    const aStart = parseDate(a.start);
    const bStart = parseDate(b.start);
    return aStart.getTime() - bStart.getTime();
  });

  const groups: SchedulerEvent[][] = [];
  
  sortedEvents.forEach(event => {
    const eventStart = parseDate(event.start);
    const eventEnd = parseDate(event.end);
    
    let placed = false;
    
    for (const group of groups) {
      const canPlace = group.every(existingEvent => {
        const existingStart = parseDate(existingEvent.start);
        const existingEnd = parseDate(existingEvent.end);
        return !eventsOverlap(
          { start: eventStart, end: eventEnd },
          { start: existingStart, end: existingEnd }
        );
      });
      
      if (canPlace) {
        group.push(event);
        placed = true;
        break;
      }
    }
    
    if (!placed) {
      groups.push([event]);
    }
  });
  
  return groups;
}

/**
 * Calculate event position and dimensions for time grid
 */
export function calculateEventLayout(
  events: SchedulerEvent[],
  dayStart: Date,
  dayEnd: Date,
  _slotHeight: number
): Array<{
  event: SchedulerEvent;
  top: number;
  height: number;
  left: number;
  width: number;
}> {
  const dayDuration = dayEnd.getTime() - dayStart.getTime();
  const groups = groupOverlappingEvents(events);
  const totalColumns = groups.length;
  
  return events.map(event => {
    const eventStart = parseDate(event.start);
    const eventEnd = parseDate(event.end);
    
    // Calculate vertical position
    const startOffset = eventStart.getTime() - dayStart.getTime();
    const duration = eventEnd.getTime() - eventStart.getTime();
    
    const top = (startOffset / dayDuration) * 100;
    const height = (duration / dayDuration) * 100;
    
    // Find which column this event belongs to
    let columnIndex = 0;
    for (let i = 0; i < groups.length; i++) {
      const group = groups[i];
      if (group && group.includes(event)) {
        columnIndex = i;
        break;
      }
    }
    
    const left = totalColumns > 0 ? (columnIndex / totalColumns) * 100 : 0;
    const width = totalColumns > 0 ? (1 / totalColumns) * 100 : 100;
    
    return {
      event,
      top,
      height,
      left,
      width
    };
  });
}

/**
 * Sort events by start time
 */
export function sortEventsByStart(events: SchedulerEvent[]): SchedulerEvent[] {
  return [...events].sort((a, b) => {
    const aStart = parseDate(a.start).getTime();
    const bStart = parseDate(b.start).getTime();
    return aStart - bStart;
  });
}

/**
 * Check if event is recurring
 */
export function isRecurring(event: SchedulerEvent): boolean {
  return Boolean(event.recurrenceRule || event.recurrenceSeriesId);
}

/**
 * Check if event is all-day
 */
export function isAllDay(event: SchedulerEvent): boolean {
  return Boolean(event.isAllDay);
}


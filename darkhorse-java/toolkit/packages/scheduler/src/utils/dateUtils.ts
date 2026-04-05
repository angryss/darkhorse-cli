/**
 * Date utility functions for Scheduler
 */

/**
 * Parse time string to hours and minutes
 */
export function parseTime(timeStr: string): { hours: number; minutes: number } {
  const parts = timeStr.split(':').map(Number);
  const hours = parts[0] || 0;
  const minutes = parts[1] || 0;
  return { hours, minutes };
}

/**
 * Format date for display
 */
export function formatDate(date: Date, format = 'MMM D, YYYY'): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthsList = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const month = months[date.getMonth()] || 'Jan';
  const fullMonth = monthsList[date.getMonth()] || 'January';
  const day = date.getDate();
  const year = date.getFullYear();
  
  let result = format;
  result = result.replace('MMMM', fullMonth);
  result = result.replace('MMM', month);
  result = result.replace('MM', String(date.getMonth() + 1).padStart(2, '0'));
  result = result.replace('DD', String(day).padStart(2, '0'));
  result = result.replace('D', String(day));
  result = result.replace('YYYY', String(year));
  result = result.replace('YY', String(year).slice(-2));
  
  return result;
}

/**
 * Format time for display
 */
export function formatTime(date: Date, format: string = 'hh:mm a'): string {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  
  if (format === 'HH:mm') {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }
  
  // 12-hour format
  const hours12 = hours % 12 || 12;
  const period = hours < 12 ? 'AM' : 'PM';
  return `${hours12}:${String(minutes).padStart(2, '0')} ${period}`;
}

/**
 * Get start of day
 */
export function startOfDay(date: Date): Date {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
}

/**
 * Get end of day
 */
export function endOfDay(date: Date): Date {
  const newDate = new Date(date);
  newDate.setHours(23, 59, 59, 999);
  return newDate;
}

/**
 * Get start of week
 */
export function startOfWeek(date: Date, firstDayOfWeek: number = 0): Date {
  const newDate = new Date(date);
  const day = newDate.getDay();
  const diff = (day < firstDayOfWeek ? 7 : 0) + day - firstDayOfWeek;
  newDate.setDate(newDate.getDate() - diff);
  return startOfDay(newDate);
}

/**
 * Get end of week
 */
export function endOfWeek(date: Date, firstDayOfWeek: number = 0): Date {
  const start = startOfWeek(date, firstDayOfWeek);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return endOfDay(end);
}

/**
 * Get start of month
 */
export function startOfMonth(date: Date): Date {
  const newDate = new Date(date);
  newDate.setDate(1);
  return startOfDay(newDate);
}

/**
 * Get end of month
 */
export function endOfMonth(date: Date): Date {
  const newDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return endOfDay(newDate);
}

/**
 * Get start of year
 */
export function startOfYear(date: Date): Date {
  const newDate = new Date(date.getFullYear(), 0, 1);
  return startOfDay(newDate);
}

/**
 * Get end of year
 */
export function endOfYear(date: Date): Date {
  const newDate = new Date(date.getFullYear(), 11, 31);
  return endOfDay(newDate);
}

/**
 * Add days to date
 */
export function addDays(date: Date, days: number): Date {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + days);
  return newDate;
}

/**
 * Add months to date
 */
export function addMonths(date: Date, months: number): Date {
  const newDate = new Date(date);
  newDate.setMonth(newDate.getMonth() + months);
  return newDate;
}

/**
 * Add years to date
 */
export function addYears(date: Date, years: number): Date {
  const newDate = new Date(date);
  newDate.setFullYear(newDate.getFullYear() + years);
  return newDate;
}

/**
 * Check if date is same day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
}

/**
 * Check if date is today
 */
export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

/**
 * Check if date is a work day
 */
export function isWorkDay(date: Date, workDays: number[] = [1, 2, 3, 4, 5]): boolean {
  return workDays.includes(date.getDay());
}

/**
 * Get days in month
 */
export function getDaysInMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

/**
 * Get week number
 */
export function getWeekNumber(date: Date): number {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

/**
 * Parse date from string or Date object
 */
export function parseDate(dateInput: string | Date): Date {
  return typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
}

/**
 * Check if events overlap
 */
export function eventsOverlap(event1: { start: Date; end: Date }, event2: { start: Date; end: Date }): boolean {
  return event1.start < event2.end && event1.end > event2.start;
}

/**
 * Get time slots for a day
 */
export function getTimeSlots(startHour: string, endHour: string, majorSlot: number, minorSlotCount: number): Date[] {
  const startTime = parseTime(startHour);
  const endTime = parseTime(endHour);
  const slots: Date[] = [];
  const today = new Date();
  today.setHours(startTime.hours, startTime.minutes, 0, 0);
  
  const endDate = new Date();
  endDate.setHours(endTime.hours, endTime.minutes, 0, 0);
  
  const intervalMinutes = majorSlot / minorSlotCount;
  
  while (today <= endDate) {
    slots.push(new Date(today));
    today.setMinutes(today.getMinutes() + intervalMinutes);
  }
  
  return slots;
}

/**
 * Get date range for view
 */
export function getViewDateRange(
  date: Date,
  view: string,
  firstDayOfWeek: number = 0
): { start: Date; end: Date } {
  switch (view) {
    case 'Day':
    case 'TimelineDay':
      return { start: startOfDay(date), end: endOfDay(date) };
    
    case 'Week':
    case 'WorkWeek':
    case 'TimelineWeek':
    case 'TimelineWorkWeek':
      return { start: startOfWeek(date, firstDayOfWeek), end: endOfWeek(date, firstDayOfWeek) };
    
    case 'Month':
    case 'TimelineMonth':
      // Include days from previous/next month to fill week rows
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      const calendarStart = startOfWeek(monthStart, firstDayOfWeek);
      const calendarEnd = endOfWeek(monthEnd, firstDayOfWeek);
      return { start: calendarStart, end: calendarEnd };
    
    case 'Year':
    case 'TimelineYear':
      return { start: startOfYear(date), end: endOfYear(date) };
    
    case 'Agenda':
      // Show 30 days for agenda
      return { start: startOfDay(date), end: addDays(endOfDay(date), 30) };
    
    default:
      return { start: startOfDay(date), end: endOfDay(date) };
  }
}


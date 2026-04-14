/**
 * WorkWeek View - Work days only time grid
 */

import React from 'react';
import { SchedulerViewProps } from '../types';
import { WeekView } from './WeekView';

/**
 * WorkWeekView is essentially WeekView filtered to work days
 * The filtering logic is handled by the parent Scheduler component
 * or by using the workDays prop
 */
export const WorkWeekView: React.FC<SchedulerViewProps> = (props) => {
  // Use WeekView with workDays prop
  // The workDays prop defaults to [1,2,3,4,5] (Monday-Friday)
  // which will be used to determine which days to display and style
  return <WeekView {...props} />;
};

WorkWeekView.displayName = 'WorkWeekView';


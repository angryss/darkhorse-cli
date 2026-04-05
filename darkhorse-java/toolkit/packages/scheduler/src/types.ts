/**
 * Scheduler Component Types
 * @packageDocumentation
 */

import { CSSProperties, ReactNode } from 'react';

/**
 * Scheduler event data
 */
export interface SchedulerEvent {
  /** Unique event identifier */
  id: string | number;
  
  /** Event title/subject */
  subject: string;
  
  /** Start date/time */
  start: string | Date;
  
  /** End date/time */
  end: string | Date;
  
  /** Event location */
  location?: string;
  
  /** Event description */
  description?: string;
  
  /** All-day event flag */
  isAllDay?: boolean;
  
  /** Read-only event (no editing/dragging) */
  isReadonly?: boolean;
  
  /** iCalendar recurrence rule (RRULE) */
  recurrenceRule?: string;
  
  /** Occurrence identifier for recurring events */
  recurrenceId?: string | number;
  
  /** Parent series identifier for recurring events */
  recurrenceSeriesId?: string | number;
  
  /** Resource ID(s) this event belongs to */
  resourceId?: string | number | Array<string | number>;
  
  /** Additional metadata */
  meta?: Record<string, unknown>;
}

/**
 * Resource data for resource-based scheduling
 */
export interface SchedulerResource {
  /** Unique resource identifier */
  id: string | number;
  
  /** Resource label/name */
  label: string;
  
  /** Resource color for visual distinction */
  color?: string;
  
  /** Additional metadata */
  meta?: Record<string, unknown>;
}

/**
 * Available scheduler views
 */
export type SchedulerView =
  | 'Day'
  | 'Week'
  | 'WorkWeek'
  | 'Month'
  | 'Year'
  | 'Agenda'
  | 'TimelineDay'
  | 'TimelineWeek'
  | 'TimelineWorkWeek'
  | 'TimelineMonth'
  | 'TimelineYear';

/**
 * Time scale configuration for time-grid views
 */
export interface SchedulerTimeScale {
  /** Minutes per major time slot (e.g., 60 for 1 hour) */
  majorSlot: number;
  
  /** Number of minor slots per major slot (e.g., 2 for 30-minute intervals) */
  minorSlotCount: number;
  
  /** Show gridlines between time slots */
  showGridlines?: boolean;
}

/**
 * Week number display rules
 */
export type WeekNumberRule = 'Off' | 'FirstDay' | 'FirstFullWeek' | 'FirstFourDayWeek';

/**
 * Tooltip display mode
 */
export type SchedulerTooltipMode = 'Off' | 'On';

/**
 * Resource grouping configuration
 */
export interface SchedulerGroupSettings {
  /** Resource IDs to group by */
  resourceIds?: Array<string | number>;
  
  /** Enable/disable grouping */
  enabled?: boolean;
}

/**
 * iCalendar import options
 */
export interface SchedulerICalendarImportOptions {
  /** Enable import functionality */
  enabled: boolean;
  
  /** Host callback to parse .ics file */
  onImport: (file: File) => Promise<SchedulerEvent[]>;
}

/**
 * iCalendar export options
 */
export interface SchedulerICalendarExportOptions {
  /** Enable export functionality */
  enabled: boolean;
  
  /** Host callback to export events */
  onExport: (events: SchedulerEvent[]) => Promise<void> | void;
}

/**
 * Excel export options
 */
export interface SchedulerExcelExportOptions {
  /** Enable Excel export */
  enabled: boolean;
  
  /** Host callback to export to Excel */
  onExport: (events: SchedulerEvent[]) => Promise<void> | void;
}

/**
 * Print options
 */
export interface SchedulerPrintOptions {
  /** Enable print functionality */
  enabled: boolean;
  
  /** Callback before printing */
  onBeforePrint?: () => void;
  
  /** Callback after printing */
  onAfterPrint?: () => void;
}

/**
 * Date header template arguments
 */
export interface SchedulerDateHeaderTemplateArgs {
  /** Date for this header */
  date: Date;
}

/**
 * Main scheduler component props
 */
export interface SchedulerProps {
  /** Current displayed date */
  currentDate: Date;
  
  /** Initial view mode */
  initialView?: SchedulerView;
  
  /** Available views (defaults to all if not specified) */
  views?: SchedulerView[];
  
  /** Timezone for display (e.g., 'America/New_York') */
  timezone?: string;
  
  /** Events to display */
  events: SchedulerEvent[];
  
  /** Resources for resource-based scheduling */
  resources?: SchedulerResource[];
  
  /** Resource grouping configuration */
  group?: SchedulerGroupSettings;
  
  /** Work days (0=Sunday, 6=Saturday), e.g., [1,2,3,4,5] */
  workDays?: number[];
  
  /** First day of week (0=Sunday) */
  firstDayOfWeek?: number;
  
  /** Day start time (e.g., '00:00') */
  dayStartHour?: string;
  
  /** Day end time (e.g., '23:59') */
  dayEndHour?: string;
  
  /** Work start time (e.g., '09:00') */
  workStartHour?: string;
  
  /** Work end time (e.g., '18:00') */
  workEndHour?: string;
  
  /** Time scale configuration */
  timeScale?: SchedulerTimeScale;
  
  /** Time format ('hh:mm a' for 12h, 'HH:mm' for 24h) */
  timeFormat?: string;
  
  /** Week number display rule */
  weekNumbers?: WeekNumberRule;
  
  /** Tooltip display mode */
  tooltipMode?: SchedulerTooltipMode;
  
  /** Auto-height rows */
  rowAutoHeight?: boolean;
  
  /** iCalendar import configuration */
  icalImport?: SchedulerICalendarImportOptions;
  
  /** iCalendar export configuration */
  icalExport?: SchedulerICalendarExportOptions;
  
  /** Excel export configuration */
  excelExport?: SchedulerExcelExportOptions;
  
  /** Print configuration */
  printOptions?: SchedulerPrintOptions;
  
  /** Allow drag and drop */
  allowDragAndDrop?: boolean;
  
  /** Allow event resizing */
  allowResize?: boolean;
  
  /** Custom date header template */
  dateHeaderTemplate?: (args: SchedulerDateHeaderTemplateArgs) => ReactNode;
  
  /** Custom event template */
  eventTemplate?: (event: SchedulerEvent) => ReactNode;
  
  /** Callback when event is created */
  onEventCreate?: (event: SchedulerEvent) => void;
  
  /** Callback when event is updated */
  onEventUpdate?: (event: SchedulerEvent) => void;
  
  /** Callback when events are deleted */
  onEventDelete?: (eventIds: Array<string | number>) => void;
  
  /** Callback when view changes */
  onViewChange?: (view: SchedulerView) => void;
  
  /** Callback when date changes */
  onDateChange?: (date: Date) => void;
  
  /** Callback before event edit (can cancel) */
  onBeforeEventEdit?: (event: SchedulerEvent) => { cancel?: boolean } | void;
  
  /** Error handler */
  onError?: (error: unknown) => void;
  
  /** Additional CSS class */
  className?: string;
  
  /** Inline styles */
  style?: CSSProperties;
}

/**
 * Scheduler imperative handle for ref access
 */
export interface SchedulerHandle {
  /** Navigate to a specific date */
  goToDate: (date: Date) => void;
  
  /** Switch to a specific view */
  setView: (view: SchedulerView) => void;
  
  /** Open event editor */
  openEditor: (
    event: Partial<SchedulerEvent>,
    mode: 'Add' | 'Edit' | 'EditOccurrence' | 'EditSeries'
  ) => void;
  
  /** Close event editor */
  closeEditor: () => void;
  
  /** Get currently visible events */
  getVisibleEvents: () => SchedulerEvent[];
  
  /** Trigger print */
  print: () => void;
  
  /** Export to iCalendar */
  exportICalendar: () => void;
  
  /** Export to Excel */
  exportExcel: () => void;
}

/**
 * Internal view component props
 */
export interface SchedulerViewProps {
  currentDate: Date;
  events: SchedulerEvent[];
  resources?: SchedulerResource[];
  workDays?: number[];
  firstDayOfWeek?: number;
  dayStartHour?: string;
  dayEndHour?: string;
  workStartHour?: string;
  workEndHour?: string;
  timeScale?: SchedulerTimeScale;
  timeFormat?: string;
  timezone?: string;
  allowDragAndDrop?: boolean;
  allowResize?: boolean;
  eventTemplate?: (event: SchedulerEvent) => ReactNode;
  dateHeaderTemplate?: (args: SchedulerDateHeaderTemplateArgs) => ReactNode;
  onEventClick?: (event: SchedulerEvent) => void;
  onEventUpdate?: (event: SchedulerEvent) => void;
  onSlotClick?: (date: Date, resource?: SchedulerResource) => void;
}

/**
 * Toolbar props
 */
export interface SchedulerToolbarProps {
  currentDate: Date;
  currentView: SchedulerView;
  availableViews: SchedulerView[];
  onDateChange: (date: Date) => void;
  onViewChange: (view: SchedulerView) => void;
  onToday: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onNewEvent?: () => void;
  onImport?: () => void;
  onExportICal?: () => void;
  onExportExcel?: () => void;
  onPrint?: () => void;
}

/**
 * Event editor props
 */
export interface SchedulerEventEditorProps {
  event: Partial<SchedulerEvent>;
  mode: 'Add' | 'Edit' | 'EditOccurrence' | 'EditSeries';
  resources?: SchedulerResource[];
  isOpen: boolean;
  onSave: (event: SchedulerEvent) => void;
  onDelete?: (eventId: string | number) => void;
  onClose: () => void;
  timezone?: string;
  timeFormat?: string;
}


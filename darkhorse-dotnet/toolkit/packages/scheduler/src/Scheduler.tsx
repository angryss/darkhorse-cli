/**
 * Main Scheduler Component
 * Multi-view calendar with resource management
 */

import React, { useState, useImperativeHandle, forwardRef, useCallback, useRef } from 'react';
import { SchedulerProps, SchedulerHandle, SchedulerView, SchedulerEvent } from './types';
import { SchedulerToolbar } from './components/SchedulerToolbar';
import { EventEditor } from './components/EventEditor';
import { DayView } from './views/DayView';
import { WeekView } from './views/WeekView';
import { WorkWeekView } from './views/WorkWeekView';
import { MonthView } from './views/MonthView';
import { YearView } from './views/YearView';
import { AgendaView } from './views/AgendaView';
import { TimelineView } from './views/TimelineView';
import { addDays, addMonths, addYears } from './utils/dateUtils';
import styles from './Scheduler.module.css';

export const Scheduler = forwardRef<SchedulerHandle, SchedulerProps>(
  (
    {
      currentDate: initialDate,
      initialView = 'Week',
      views = [
        'Day',
        'Week',
        'WorkWeek',
        'Month',
        'Year',
        'Agenda',
        'TimelineDay',
        'TimelineWeek',
        'TimelineWorkWeek',
        'TimelineMonth',
        'TimelineYear',
      ],
      timezone,
      events,
      resources,
      workDays = [1, 2, 3, 4, 5],
      firstDayOfWeek = 0,
      dayStartHour = '00:00',
      dayEndHour = '23:59',
      workStartHour = '09:00',
      workEndHour = '18:00',
      timeScale = { majorSlot: 60, minorSlotCount: 2 },
      timeFormat = 'hh:mm a',
      icalImport,
      icalExport,
      excelExport,
      printOptions,
      allowDragAndDrop = true,
      allowResize = true,
      dateHeaderTemplate,
      eventTemplate,
      onEventCreate,
      onEventUpdate,
      onEventDelete,
      onViewChange,
      onDateChange,
      onBeforeEventEdit,
      onError,
      className,
      style,
    },
    ref
  ) => {
    const [currentView, setCurrentView] = useState<SchedulerView>(initialView);
    const [currentDate, setCurrentDate] = useState<Date>(initialDate);
    const [editorState, setEditorState] = useState<{
      isOpen: boolean;
      event: Partial<SchedulerEvent>;
      mode: 'Add' | 'Edit' | 'EditOccurrence' | 'EditSeries';
    }>({
      isOpen: false,
      event: {},
      mode: 'Add',
    });

    // File input ref for import
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Handle view change
    const handleViewChange = useCallback(
      (view: SchedulerView) => {
        setCurrentView(view);
        if (onViewChange) {
          onViewChange(view);
        }
      },
      [onViewChange]
    );

    // Handle date change
    const handleDateChange = useCallback(
      (date: Date) => {
        setCurrentDate(date);
        if (onDateChange) {
          onDateChange(date);
        }
      },
      [onDateChange]
    );

    // Navigation handlers
    const handleToday = useCallback(() => {
      handleDateChange(new Date());
    }, [handleDateChange]);

    const handlePrevious = useCallback(() => {
      let newDate: Date;

      switch (currentView) {
        case 'Day':
        case 'TimelineDay':
          newDate = addDays(currentDate, -1);
          break;
        case 'Week':
        case 'WorkWeek':
        case 'TimelineWeek':
        case 'TimelineWorkWeek':
          newDate = addDays(currentDate, -7);
          break;
        case 'Month':
        case 'Agenda':
        case 'TimelineMonth':
          newDate = addMonths(currentDate, -1);
          break;
        case 'Year':
        case 'TimelineYear':
          newDate = addYears(currentDate, -1);
          break;
        default:
          newDate = addDays(currentDate, -1);
      }

      handleDateChange(newDate);
    }, [currentView, currentDate, handleDateChange]);

    const handleNext = useCallback(() => {
      let newDate: Date;

      switch (currentView) {
        case 'Day':
        case 'TimelineDay':
          newDate = addDays(currentDate, 1);
          break;
        case 'Week':
        case 'WorkWeek':
        case 'TimelineWeek':
        case 'TimelineWorkWeek':
          newDate = addDays(currentDate, 7);
          break;
        case 'Month':
        case 'Agenda':
        case 'TimelineMonth':
          newDate = addMonths(currentDate, 1);
          break;
        case 'Year':
        case 'TimelineYear':
          newDate = addYears(currentDate, 1);
          break;
        default:
          newDate = addDays(currentDate, 1);
      }

      handleDateChange(newDate);
    }, [currentView, currentDate, handleDateChange]);

    // Event handlers
    const handleSlotClick = useCallback(
      (date: Date) => {
        // Open editor for new event
        const endDate = new Date(date);
        endDate.setHours(date.getHours() + 1); // Default 1 hour duration

        setEditorState({
          isOpen: true,
          event: {
            start: date,
            end: endDate,
            isAllDay: false,
          },
          mode: 'Add',
        });
      },
      []
    );

    const handleEventClick = useCallback(
      (event: SchedulerEvent) => {
        // Check if editing is allowed
        if (onBeforeEventEdit) {
          const result = onBeforeEventEdit(event);
          if (result && result.cancel) {
            return;
          }
        }

        // Determine edit mode based on recurrence
        let mode: 'Edit' | 'EditOccurrence' | 'EditSeries' = 'Edit';
        if (event.recurrenceRule) {
          mode = 'EditSeries';
        } else if (event.recurrenceSeriesId) {
          mode = 'EditOccurrence';
        }

        setEditorState({
          isOpen: true,
          event,
          mode,
        });
      },
      [onBeforeEventEdit]
    );

    const handleEventSave = useCallback(
      (event: SchedulerEvent) => {
        if (editorState.mode === 'Add') {
          if (onEventCreate) {
            onEventCreate(event);
          }
        } else {
          if (onEventUpdate) {
            onEventUpdate(event);
          }
        }

        setEditorState({
          isOpen: false,
          event: {},
          mode: 'Add',
        });
      },
      [editorState.mode, onEventCreate, onEventUpdate]
    );

    const handleEventDelete = useCallback(
      (eventId: string | number) => {
        if (onEventDelete) {
          onEventDelete([eventId]);
        }

        setEditorState({
          isOpen: false,
          event: {},
          mode: 'Add',
        });
      },
      [onEventDelete]
    );

    const handleEditorClose = useCallback(() => {
      setEditorState({
        isOpen: false,
        event: {},
        mode: 'Add',
      });
    }, []);

    // Import/Export handlers
    const handleImport = useCallback(() => {
      if (icalImport && icalImport.enabled) {
        fileInputRef.current?.click();
      }
    }, [icalImport]);

    const handleFileChange = useCallback(
      async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !icalImport) return;

        try {
          await icalImport.onImport(file);
          // Host handles adding imported events to state
        } catch (error) {
          if (onError) {
            onError(error);
          }
        }

        // Clear file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      },
      [icalImport, onError]
    );

    const handleExportICal = useCallback(() => {
      if (icalExport && icalExport.enabled) {
        try {
          icalExport.onExport(events);
        } catch (error) {
          if (onError) {
            onError(error);
          }
        }
      }
    }, [icalExport, events, onError]);

    const handleExportExcel = useCallback(() => {
      if (excelExport && excelExport.enabled) {
        try {
          excelExport.onExport(events);
        } catch (error) {
          if (onError) {
            onError(error);
          }
        }
      }
    }, [excelExport, events, onError]);

    const handlePrint = useCallback(() => {
      if (printOptions && printOptions.enabled) {
        try {
          if (printOptions.onBeforePrint) {
            printOptions.onBeforePrint();
          }

          window.print();

          if (printOptions.onAfterPrint) {
            printOptions.onAfterPrint();
          }
        } catch (error) {
          if (onError) {
            onError(error);
          }
        }
      }
    }, [printOptions, onError]);

    // Imperative handle for ref
    useImperativeHandle(ref, () => ({
      goToDate: (date: Date) => {
        handleDateChange(date);
      },
      setView: (view: SchedulerView) => {
        handleViewChange(view);
      },
      openEditor: (event: Partial<SchedulerEvent>, mode: 'Add' | 'Edit' | 'EditOccurrence' | 'EditSeries') => {
        setEditorState({
          isOpen: true,
          event,
          mode,
        });
      },
      closeEditor: () => {
        handleEditorClose();
      },
      getVisibleEvents: () => {
        // Return events visible in current view
        return events;
      },
      print: () => {
        handlePrint();
      },
      exportICalendar: () => {
        handleExportICal();
      },
      exportExcel: () => {
        handleExportExcel();
      },
    }));

    // Render current view
    const renderView = () => {
      const viewProps = {
        currentDate,
        events,
        resources,
        workDays,
        firstDayOfWeek,
        dayStartHour,
        dayEndHour,
        workStartHour,
        workEndHour,
        timeScale,
        timeFormat,
        timezone,
        allowDragAndDrop,
        allowResize,
        eventTemplate,
        dateHeaderTemplate,
        onEventClick: handleEventClick,
        onEventUpdate,
        onSlotClick: handleSlotClick,
      };

      switch (currentView) {
        case 'Day':
          return <DayView {...viewProps} />;
        case 'Week':
          return <WeekView {...viewProps} />;
        case 'WorkWeek':
          return <WorkWeekView {...viewProps} />;
        case 'Month':
          return <MonthView {...viewProps} />;
        case 'Year':
          return <YearView {...viewProps} />;
        case 'Agenda':
          return <AgendaView {...viewProps} />;
        case 'TimelineDay':
        case 'TimelineWeek':
        case 'TimelineWorkWeek':
        case 'TimelineMonth':
        case 'TimelineYear':
          return <TimelineView {...viewProps} view={currentView} />;
        default:
          return <DayView {...viewProps} />;
      }
    };

    return (
      <div className={`${styles.scheduler} ${className || ''}`} style={style}>
        {/* Toolbar */}
        <SchedulerToolbar
          currentDate={currentDate}
          currentView={currentView}
          availableViews={views}
          onDateChange={handleDateChange}
          onViewChange={handleViewChange}
          onToday={handleToday}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onNewEvent={onEventCreate ? () => handleSlotClick(currentDate) : undefined}
          onImport={icalImport?.enabled ? handleImport : undefined}
          onExportICal={icalExport?.enabled ? handleExportICal : undefined}
          onExportExcel={excelExport?.enabled ? handleExportExcel : undefined}
          onPrint={printOptions?.enabled ? handlePrint : undefined}
        />

        {/* View Container */}
        <div className={styles.scheduler__view}>
          {renderView()}
        </div>

        {/* Event Editor Dialog */}
        <EventEditor
          event={editorState.event}
          mode={editorState.mode}
          resources={resources}
          isOpen={editorState.isOpen}
          onSave={handleEventSave}
          onDelete={onEventDelete ? handleEventDelete : undefined}
          onClose={handleEditorClose}
          timezone={timezone}
          timeFormat={timeFormat}
        />

        {/* Hidden file input for import */}
        {icalImport?.enabled && (
          <input
            ref={fileInputRef}
            type="file"
            accept=".ics,.ical"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
        )}
      </div>
    );
  }
);

Scheduler.displayName = 'Scheduler';

export default Scheduler;


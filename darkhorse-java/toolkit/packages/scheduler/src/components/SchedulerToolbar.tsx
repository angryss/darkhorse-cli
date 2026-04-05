/**
 * Scheduler Toolbar Component
 * Navigation and view switching
 */

import React from 'react';
import { SchedulerToolbarProps } from '../types';
import { formatDate } from '../utils/dateUtils';
import styles from '../Scheduler.module.css';

export const SchedulerToolbar: React.FC<SchedulerToolbarProps> = ({
  currentDate,
  currentView,
  availableViews,
  onDateChange,
  onViewChange,
  onToday,
  onPrevious,
  onNext,
  onNewEvent,
  onImport,
  onExportICal,
  onExportExcel,
  onPrint,
}) => {
  const handleDateInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    if (!isNaN(newDate.getTime())) {
      onDateChange(newDate);
    }
  };
  
  return (
    <div className={styles.scheduler__toolbar}>
      {/* Navigation */}
      <div className={styles.scheduler__toolbar__section}>
        <button
          className={styles.scheduler__toolbar__button}
          onClick={onToday}
          title="Go to today"
        >
          Today
        </button>
        
        <button
          className={`${styles.scheduler__toolbar__button} ${styles['scheduler__toolbar__button--icon']}`}
          onClick={onPrevious}
          title="Previous"
          aria-label="Previous"
        >
          ‹
        </button>
        
        <button
          className={`${styles.scheduler__toolbar__button} ${styles['scheduler__toolbar__button--icon']}`}
          onClick={onNext}
          title="Next"
          aria-label="Next"
        >
          ›
        </button>
        
        <div className={styles.scheduler__toolbar__date}>
          <input
            type="date"
            value={currentDate.toISOString().split('T')[0]}
            onChange={handleDateInput}
            className={styles.scheduler__toolbar__date_input}
            title="Select date"
          />
          <span className={styles.scheduler__toolbar__date_display}>
            {formatDate(currentDate, 'MMM D, YYYY')}
          </span>
        </div>
      </div>
      
      {/* View Switcher */}
      <div className={styles.scheduler__toolbar__section}>
        <div className={styles.scheduler__toolbar__view_switcher}>
          {availableViews.map(view => (
            <button
              key={view}
              className={`${styles.scheduler__toolbar__view_button} ${
                currentView === view ? styles['scheduler__toolbar__view_button--active'] : ''
              }`}
              onClick={() => onViewChange(view)}
              title={`Switch to ${view} view`}
            >
              {view}
            </button>
          ))}
        </div>
      </div>
      
      {/* Actions */}
      <div className={styles.scheduler__toolbar__section}>
        {onNewEvent && (
          <button
            className={styles.scheduler__toolbar__button}
            onClick={onNewEvent}
            title="Create new event"
          >
            + New Event
          </button>
        )}
        
        {onImport && (
          <button
            className={styles.scheduler__toolbar__button}
            onClick={onImport}
            title="Import calendar"
          >
            Import
          </button>
        )}
        
        {(onExportICal || onExportExcel) && (
          <div className={styles.scheduler__toolbar__dropdown}>
            <button
              className={styles.scheduler__toolbar__button}
              title="Export"
            >
              Export ▾
            </button>
            <div className={styles.scheduler__toolbar__dropdown__menu}>
              {onExportICal && (
                <button onClick={onExportICal}>iCalendar</button>
              )}
              {onExportExcel && (
                <button onClick={onExportExcel}>Excel</button>
              )}
            </div>
          </div>
        )}
        
        {onPrint && (
          <button
            className={styles.scheduler__toolbar__button}
            onClick={onPrint}
            title="Print"
          >
            Print
          </button>
        )}
      </div>
    </div>
  );
};

SchedulerToolbar.displayName = 'SchedulerToolbar';


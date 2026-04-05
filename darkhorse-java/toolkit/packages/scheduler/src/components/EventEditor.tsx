/**
 * Event Editor Dialog Component
 * For creating and editing scheduler events
 */

import React, { useState, useEffect } from 'react';
import { SchedulerEventEditorProps, SchedulerEvent } from '../types';
import { parseDate } from '../utils/dateUtils';
import styles from '../Scheduler.module.css';

export const EventEditor: React.FC<SchedulerEventEditorProps> = ({
  event: initialEvent,
  mode,
  resources,
  isOpen,
  onSave,
  onDelete,
  onClose,
  timezone,
}) => {
  const [eventData, setEventData] = useState<Partial<SchedulerEvent>>({
    id: '',
    subject: '',
    start: new Date(),
    end: new Date(),
    location: '',
    description: '',
    isAllDay: false,
    resourceId: undefined,
    ...initialEvent,
  });

  useEffect(() => {
    if (isOpen) {
      setEventData({
        id: '',
        subject: '',
        start: new Date(),
        end: new Date(),
        location: '',
        description: '',
        isAllDay: false,
        resourceId: undefined,
        ...initialEvent,
      });
    }
  }, [isOpen, initialEvent]);

  if (!isOpen) return null;

  const handleChange = (field: keyof SchedulerEvent, value: unknown) => {
    setEventData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!eventData.subject || !eventData.start || !eventData.end) {
      return;
    }

    const completeEvent: SchedulerEvent = {
      id: eventData.id || `event_${Date.now()}`,
      subject: eventData.subject,
      start: eventData.start,
      end: eventData.end,
      location: eventData.location,
      description: eventData.description,
      isAllDay: eventData.isAllDay,
      resourceId: eventData.resourceId,
      recurrenceRule: eventData.recurrenceRule,
      recurrenceId: eventData.recurrenceId,
      recurrenceSeriesId: eventData.recurrenceSeriesId,
      isReadonly: eventData.isReadonly,
      meta: eventData.meta,
    };

    onSave(completeEvent);
    onClose();
  };

  const handleDelete = () => {
    if (eventData.id && onDelete) {
      onDelete(eventData.id);
      onClose();
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const formatDateTimeForInput = (date: string | Date): string => {
    const d = parseDate(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const getTitle = () => {
    switch (mode) {
      case 'Add':
        return 'New Event';
      case 'Edit':
        return 'Edit Event';
      case 'EditOccurrence':
        return 'Edit Occurrence';
      case 'EditSeries':
        return 'Edit Series';
      default:
        return 'Event';
    }
  };

  return (
    <div
      className={styles.event_editor}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="event-editor-title"
    >
      <div className={styles.event_editor__dialog}>
        <div className={styles.event_editor__header}>
          <h2 id="event-editor-title" className={styles.event_editor__title}>
            {getTitle()}
          </h2>
        </div>

        <div className={styles.event_editor__body}>
          {/* Subject */}
          <div className={styles.event_editor__field}>
            <label htmlFor="event-subject" className={styles.event_editor__label}>
              Subject *
            </label>
            <input
              id="event-subject"
              type="text"
              className={styles.event_editor__input}
              value={eventData.subject || ''}
              onChange={(e) => handleChange('subject', e.target.value)}
              required
              autoFocus
            />
          </div>

          {/* All Day */}
          <div className={styles.event_editor__field}>
            <label className={styles.event_editor__checkbox}>
              <input
                type="checkbox"
                checked={eventData.isAllDay || false}
                onChange={(e) => handleChange('isAllDay', e.target.checked)}
              />
              <span>All Day Event</span>
            </label>
          </div>

          {/* Start Date/Time */}
          <div className={styles.event_editor__field}>
            <label htmlFor="event-start" className={styles.event_editor__label}>
              Start {timezone ? `(${timezone})` : ''} *
            </label>
            <input
              id="event-start"
              type={eventData.isAllDay ? 'date' : 'datetime-local'}
              className={styles.event_editor__input}
              value={
                eventData.start
                  ? eventData.isAllDay
                    ? parseDate(eventData.start).toISOString().split('T')[0]
                    : formatDateTimeForInput(eventData.start)
                  : ''
              }
              onChange={(e) => handleChange('start', new Date(e.target.value))}
              required
            />
          </div>

          {/* End Date/Time */}
          <div className={styles.event_editor__field}>
            <label htmlFor="event-end" className={styles.event_editor__label}>
              End {timezone ? `(${timezone})` : ''} *
            </label>
            <input
              id="event-end"
              type={eventData.isAllDay ? 'date' : 'datetime-local'}
              className={styles.event_editor__input}
              value={
                eventData.end
                  ? eventData.isAllDay
                    ? parseDate(eventData.end).toISOString().split('T')[0]
                    : formatDateTimeForInput(eventData.end)
                  : ''
              }
              onChange={(e) => handleChange('end', new Date(e.target.value))}
              required
            />
          </div>

          {/* Resource */}
          {resources && resources.length > 0 && (
            <div className={styles.event_editor__field}>
              <label htmlFor="event-resource" className={styles.event_editor__label}>
                Resource
              </label>
              <select
                id="event-resource"
                className={styles.event_editor__select}
                value={eventData.resourceId as string | number | undefined}
                onChange={(e) => handleChange('resourceId', e.target.value || undefined)}
              >
                <option value="">None</option>
                {resources.map((resource) => (
                  <option key={resource.id} value={resource.id}>
                    {resource.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Location */}
          <div className={styles.event_editor__field}>
            <label htmlFor="event-location" className={styles.event_editor__label}>
              Location
            </label>
            <input
              id="event-location"
              type="text"
              className={styles.event_editor__input}
              value={eventData.location || ''}
              onChange={(e) => handleChange('location', e.target.value)}
            />
          </div>

          {/* Description */}
          <div className={styles.event_editor__field}>
            <label htmlFor="event-description" className={styles.event_editor__label}>
              Description
            </label>
            <textarea
              id="event-description"
              className={styles.event_editor__textarea}
              value={eventData.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
            />
          </div>

          {/* Recurrence Info (read-only) */}
          {eventData.recurrenceRule && (
            <div className={styles.event_editor__field}>
              <div className={styles.event_editor__label}>
                Recurrence
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>
                {eventData.recurrenceRule}
              </div>
            </div>
          )}

          {/* Series Warning */}
          {(mode === 'EditSeries' || mode === 'EditOccurrence') && (
            <div
              style={{
                padding: '12px',
                background: '#fef3c7',
                border: '1px solid #fbbf24',
                borderRadius: '4px',
                fontSize: '14px',
                marginTop: '16px',
              }}
            >
              {mode === 'EditSeries'
                ? '⚠️ Changes will affect all occurrences in the series.'
                : 'ℹ️ Changes will only affect this occurrence.'}
            </div>
          )}
        </div>

        <div className={styles.event_editor__footer}>
          <div>
            {onDelete && mode !== 'Add' && (
              <button
                type="button"
                className={`${styles.event_editor__button} ${styles['event_editor__button--danger']}`}
                onClick={handleDelete}
              >
                Delete
              </button>
            )}
          </div>
          <div className={styles.event_editor__actions}>
            <button
              type="button"
              className={`${styles.event_editor__button} ${styles['event_editor__button--secondary']}`}
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className={`${styles.event_editor__button} ${styles['event_editor__button--primary']}`}
              onClick={handleSave}
              disabled={!eventData.subject || !eventData.start || !eventData.end}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

EventEditor.displayName = 'EventEditor';


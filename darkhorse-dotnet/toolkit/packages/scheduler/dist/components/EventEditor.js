import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Event Editor Dialog Component
 * For creating and editing scheduler events
 */
import { useState, useEffect } from 'react';
import { parseDate } from '../utils/dateUtils';
import styles from '../Scheduler.module.css';
export const EventEditor = ({ event: initialEvent, mode, resources, isOpen, onSave, onDelete, onClose, timezone, }) => {
    const [eventData, setEventData] = useState({
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
    if (!isOpen)
        return null;
    const handleChange = (field, value) => {
        setEventData(prev => ({ ...prev, [field]: value }));
    };
    const handleSave = () => {
        if (!eventData.subject || !eventData.start || !eventData.end) {
            return;
        }
        const completeEvent = {
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
    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };
    const formatDateTimeForInput = (date) => {
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
    return (_jsx("div", { className: styles.event_editor, onClick: handleOverlayClick, role: "dialog", "aria-modal": "true", "aria-labelledby": "event-editor-title", children: _jsxs("div", { className: styles.event_editor__dialog, children: [_jsx("div", { className: styles.event_editor__header, children: _jsx("h2", { id: "event-editor-title", className: styles.event_editor__title, children: getTitle() }) }), _jsxs("div", { className: styles.event_editor__body, children: [_jsxs("div", { className: styles.event_editor__field, children: [_jsx("label", { htmlFor: "event-subject", className: styles.event_editor__label, children: "Subject *" }), _jsx("input", { id: "event-subject", type: "text", className: styles.event_editor__input, value: eventData.subject || '', onChange: (e) => handleChange('subject', e.target.value), required: true, autoFocus: true })] }), _jsx("div", { className: styles.event_editor__field, children: _jsxs("label", { className: styles.event_editor__checkbox, children: [_jsx("input", { type: "checkbox", checked: eventData.isAllDay || false, onChange: (e) => handleChange('isAllDay', e.target.checked) }), _jsx("span", { children: "All Day Event" })] }) }), _jsxs("div", { className: styles.event_editor__field, children: [_jsxs("label", { htmlFor: "event-start", className: styles.event_editor__label, children: ["Start ", timezone ? `(${timezone})` : '', " *"] }), _jsx("input", { id: "event-start", type: eventData.isAllDay ? 'date' : 'datetime-local', className: styles.event_editor__input, value: eventData.start
                                        ? eventData.isAllDay
                                            ? parseDate(eventData.start).toISOString().split('T')[0]
                                            : formatDateTimeForInput(eventData.start)
                                        : '', onChange: (e) => handleChange('start', new Date(e.target.value)), required: true })] }), _jsxs("div", { className: styles.event_editor__field, children: [_jsxs("label", { htmlFor: "event-end", className: styles.event_editor__label, children: ["End ", timezone ? `(${timezone})` : '', " *"] }), _jsx("input", { id: "event-end", type: eventData.isAllDay ? 'date' : 'datetime-local', className: styles.event_editor__input, value: eventData.end
                                        ? eventData.isAllDay
                                            ? parseDate(eventData.end).toISOString().split('T')[0]
                                            : formatDateTimeForInput(eventData.end)
                                        : '', onChange: (e) => handleChange('end', new Date(e.target.value)), required: true })] }), resources && resources.length > 0 && (_jsxs("div", { className: styles.event_editor__field, children: [_jsx("label", { htmlFor: "event-resource", className: styles.event_editor__label, children: "Resource" }), _jsxs("select", { id: "event-resource", className: styles.event_editor__select, value: eventData.resourceId, onChange: (e) => handleChange('resourceId', e.target.value || undefined), children: [_jsx("option", { value: "", children: "None" }), resources.map((resource) => (_jsx("option", { value: resource.id, children: resource.label }, resource.id)))] })] })), _jsxs("div", { className: styles.event_editor__field, children: [_jsx("label", { htmlFor: "event-location", className: styles.event_editor__label, children: "Location" }), _jsx("input", { id: "event-location", type: "text", className: styles.event_editor__input, value: eventData.location || '', onChange: (e) => handleChange('location', e.target.value) })] }), _jsxs("div", { className: styles.event_editor__field, children: [_jsx("label", { htmlFor: "event-description", className: styles.event_editor__label, children: "Description" }), _jsx("textarea", { id: "event-description", className: styles.event_editor__textarea, value: eventData.description || '', onChange: (e) => handleChange('description', e.target.value) })] }), eventData.recurrenceRule && (_jsxs("div", { className: styles.event_editor__field, children: [_jsx("div", { className: styles.event_editor__label, children: "Recurrence" }), _jsx("div", { style: { fontSize: '14px', color: '#6b7280' }, children: eventData.recurrenceRule })] })), (mode === 'EditSeries' || mode === 'EditOccurrence') && (_jsx("div", { style: {
                                padding: '12px',
                                background: '#fef3c7',
                                border: '1px solid #fbbf24',
                                borderRadius: '4px',
                                fontSize: '14px',
                                marginTop: '16px',
                            }, children: mode === 'EditSeries'
                                ? '⚠️ Changes will affect all occurrences in the series.'
                                : 'ℹ️ Changes will only affect this occurrence.' }))] }), _jsxs("div", { className: styles.event_editor__footer, children: [_jsx("div", { children: onDelete && mode !== 'Add' && (_jsx("button", { type: "button", className: `${styles.event_editor__button} ${styles['event_editor__button--danger']}`, onClick: handleDelete, children: "Delete" })) }), _jsxs("div", { className: styles.event_editor__actions, children: [_jsx("button", { type: "button", className: `${styles.event_editor__button} ${styles['event_editor__button--secondary']}`, onClick: onClose, children: "Cancel" }), _jsx("button", { type: "button", className: `${styles.event_editor__button} ${styles['event_editor__button--primary']}`, onClick: handleSave, disabled: !eventData.subject || !eventData.start || !eventData.end, children: "Save" })] })] })] }) }));
};
EventEditor.displayName = 'EventEditor';
//# sourceMappingURL=EventEditor.js.map
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * KanbanCardDialog Component
 * @module @react-toolkit/kanban
 */
import { useState, useCallback, useEffect } from 'react';
import styles from './KanbanBoard.module.css';
export const KanbanCardDialog = ({ card, fields, open, onSave, onDelete, onClose, }) => {
    const [formData, setFormData] = useState(card);
    const [errors, setErrors] = useState({});
    // Reset form when card changes
    useEffect(() => {
        setFormData(card);
        setErrors({});
    }, [card]);
    // Handle field change
    const handleFieldChange = useCallback((key, value) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
        // Clear error for this field
        setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[key];
            return newErrors;
        });
    }, []);
    // Validate form
    const validateForm = useCallback(() => {
        const newErrors = {};
        fields.forEach((field) => {
            if (field.required && !formData[field.key]) {
                newErrors[field.key] = `${field.label || field.key} is required`;
            }
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [fields, formData]);
    // Handle save
    const handleSave = useCallback(() => {
        if (!validateForm()) {
            return;
        }
        onSave(formData);
    }, [formData, validateForm, onSave]);
    // Handle delete
    const handleDelete = useCallback(() => {
        if (window.confirm('Are you sure you want to delete this card?')) {
            onDelete(card.id);
        }
    }, [card.id, onDelete]);
    // Handle key press
    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Escape') {
            onClose();
        }
        else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            handleSave();
        }
    }, [onClose, handleSave]);
    // Render field based on type
    const renderField = useCallback((field) => {
        const value = formData[field.key];
        const error = errors[field.key];
        switch (field.type) {
            case 'TextBox':
                return (_jsx("input", { type: "text", className: styles.dialogInput, value: value || '', onChange: (e) => handleFieldChange(field.key, e.target.value), placeholder: field.placeholder, "aria-invalid": !!error, "aria-describedby": error ? `${field.key}-error` : undefined }));
            case 'TextArea':
                return (_jsx("textarea", { className: styles.dialogTextarea, value: value || '', onChange: (e) => handleFieldChange(field.key, e.target.value), placeholder: field.placeholder, rows: 4, "aria-invalid": !!error, "aria-describedby": error ? `${field.key}-error` : undefined }));
            case 'DropDown':
                return (_jsxs("select", { className: styles.dialogSelect, value: value || '', onChange: (e) => handleFieldChange(field.key, e.target.value), "aria-invalid": !!error, "aria-describedby": error ? `${field.key}-error` : undefined, children: [_jsx("option", { value: "", children: "Select..." }), field.options?.map((option) => (_jsx("option", { value: option.value, children: option.label }, option.value)))] }));
            case 'Tags':
                return (_jsx("input", { type: "text", className: styles.dialogInput, value: Array.isArray(value) ? value.join(', ') : '', onChange: (e) => handleFieldChange(field.key, e.target.value.split(',').map((t) => t.trim()).filter(Boolean)), placeholder: field.placeholder || 'Enter tags separated by commas', "aria-invalid": !!error, "aria-describedby": error ? `${field.key}-error` : undefined }));
            case 'Number':
                return (_jsx("input", { type: "number", className: styles.dialogInput, value: value || '', onChange: (e) => handleFieldChange(field.key, parseFloat(e.target.value)), placeholder: field.placeholder, "aria-invalid": !!error, "aria-describedby": error ? `${field.key}-error` : undefined }));
            case 'Date':
                return (_jsx("input", { type: "date", className: styles.dialogInput, value: value || '', onChange: (e) => handleFieldChange(field.key, e.target.value), "aria-invalid": !!error, "aria-describedby": error ? `${field.key}-error` : undefined }));
            default:
                return null;
        }
    }, [formData, errors, handleFieldChange]);
    if (!open) {
        return null;
    }
    return (_jsx("div", { className: styles.dialogOverlay, onClick: onClose, role: "dialog", "aria-modal": "true", "aria-labelledby": "dialog-title", children: _jsxs("div", { className: styles.dialog, onClick: (e) => e.stopPropagation(), onKeyDown: handleKeyDown, children: [_jsxs("div", { className: styles.dialogHeader, children: [_jsx("h2", { id: "dialog-title", className: styles.dialogTitle, children: "Edit Card" }), _jsx("button", { className: styles.dialogCloseButton, onClick: onClose, "aria-label": "Close dialog", children: "\u00D7" })] }), _jsx("div", { className: styles.dialogBody, children: fields.map((field) => (_jsxs("div", { className: styles.dialogField, children: [_jsxs("label", { className: styles.dialogLabel, children: [field.label || field.key, field.required && _jsx("span", { className: styles.dialogRequired, children: " *" })] }), renderField(field), errors[field.key] && (_jsx("span", { id: `${field.key}-error`, className: styles.dialogError, role: "alert", children: errors[field.key] }))] }, field.key))) }), _jsxs("div", { className: styles.dialogFooter, children: [_jsx("button", { className: `${styles.dialogButton} ${styles.dialogButtonDelete}`, onClick: handleDelete, type: "button", children: "Delete" }), _jsxs("div", { className: styles.dialogFooterRight, children: [_jsx("button", { className: `${styles.dialogButton} ${styles.dialogButtonSecondary}`, onClick: onClose, type: "button", children: "Cancel" }), _jsx("button", { className: `${styles.dialogButton} ${styles.dialogButtonPrimary}`, onClick: handleSave, type: "button", children: "Save" })] })] })] }) }));
};
KanbanCardDialog.displayName = 'KanbanCardDialog';
//# sourceMappingURL=KanbanCardDialog.js.map
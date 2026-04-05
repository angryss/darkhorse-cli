/**
 * KanbanCardDialog Component
 * @module @react-toolkit/kanban
 */

import React, { useState, useCallback, useEffect } from 'react';
import { KanbanCard, KanbanCardDialogField } from './types';
import styles from './KanbanBoard.module.css';

export interface KanbanCardDialogProps {
  card: KanbanCard;
  fields: KanbanCardDialogField[];
  open: boolean;
  onSave: (card: KanbanCard) => void;
  onDelete: (cardId: string | number) => void;
  onClose: () => void;
}

export const KanbanCardDialog: React.FC<KanbanCardDialogProps> = ({
  card,
  fields,
  open,
  onSave,
  onDelete,
  onClose,
}) => {
  const [formData, setFormData] = useState<Partial<KanbanCard>>(card);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when card changes
  useEffect(() => {
    setFormData(card);
    setErrors({});
  }, [card]);

  // Handle field change
  const handleFieldChange = useCallback(
    (key: string, value: unknown) => {
      setFormData((prev) => ({ ...prev, [key]: value }));
      // Clear error for this field
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    },
    []
  );

  // Validate form
  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    fields.forEach((field) => {
      if (field.required && !formData[field.key as keyof KanbanCard]) {
        newErrors[field.key as string] = `${field.label || field.key} is required`;
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

    onSave(formData as KanbanCard);
  }, [formData, validateForm, onSave]);

  // Handle delete
  const handleDelete = useCallback(() => {
    if (window.confirm('Are you sure you want to delete this card?')) {
      onDelete(card.id);
    }
  }, [card.id, onDelete]);

  // Handle key press
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        handleSave();
      }
    },
    [onClose, handleSave]
  );

  // Render field based on type
  const renderField = useCallback(
    (field: KanbanCardDialogField) => {
      const value = formData[field.key as keyof KanbanCard];
      const error = errors[field.key as string];

      switch (field.type) {
        case 'TextBox':
          return (
            <input
              type="text"
              className={styles.dialogInput}
              value={(value as string) || ''}
              onChange={(e) => handleFieldChange(field.key as string, e.target.value)}
              placeholder={field.placeholder}
              aria-invalid={!!error}
              aria-describedby={error ? `${field.key}-error` : undefined}
            />
          );

        case 'TextArea':
          return (
            <textarea
              className={styles.dialogTextarea}
              value={(value as string) || ''}
              onChange={(e) => handleFieldChange(field.key as string, e.target.value)}
              placeholder={field.placeholder}
              rows={4}
              aria-invalid={!!error}
              aria-describedby={error ? `${field.key}-error` : undefined}
            />
          );

        case 'DropDown':
          return (
            <select
              className={styles.dialogSelect}
              value={(value as string) || ''}
              onChange={(e) => handleFieldChange(field.key as string, e.target.value)}
              aria-invalid={!!error}
              aria-describedby={error ? `${field.key}-error` : undefined}
            >
              <option value="">Select...</option>
              {field.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          );

        case 'Tags':
          return (
            <input
              type="text"
              className={styles.dialogInput}
              value={Array.isArray(value) ? (value as string[]).join(', ') : ''}
              onChange={(e) =>
                handleFieldChange(
                  field.key as string,
                  e.target.value.split(',').map((t) => t.trim()).filter(Boolean)
                )
              }
              placeholder={field.placeholder || 'Enter tags separated by commas'}
              aria-invalid={!!error}
              aria-describedby={error ? `${field.key}-error` : undefined}
            />
          );

        case 'Number':
          return (
            <input
              type="number"
              className={styles.dialogInput}
              value={(value as number) || ''}
              onChange={(e) =>
                handleFieldChange(field.key as string, parseFloat(e.target.value))
              }
              placeholder={field.placeholder}
              aria-invalid={!!error}
              aria-describedby={error ? `${field.key}-error` : undefined}
            />
          );

        case 'Date':
          return (
            <input
              type="date"
              className={styles.dialogInput}
              value={(value as string) || ''}
              onChange={(e) => handleFieldChange(field.key as string, e.target.value)}
              aria-invalid={!!error}
              aria-describedby={error ? `${field.key}-error` : undefined}
            />
          );

        default:
          return null;
      }
    },
    [formData, errors, handleFieldChange]
  );

  if (!open) {
    return null;
  }

  return (
    <div
      className={styles.dialogOverlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
    >
      <div
        className={styles.dialog}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div className={styles.dialogHeader}>
          <h2 id="dialog-title" className={styles.dialogTitle}>
            Edit Card
          </h2>
          <button
            className={styles.dialogCloseButton}
            onClick={onClose}
            aria-label="Close dialog"
          >
            ×
          </button>
        </div>

        <div className={styles.dialogBody}>
          {fields.map((field) => (
            <div key={field.key as string} className={styles.dialogField}>
              <label className={styles.dialogLabel}>
                {field.label || field.key}
                {field.required && <span className={styles.dialogRequired}> *</span>}
              </label>
              {renderField(field)}
              {errors[field.key as string] && (
                <span
                  id={`${field.key}-error`}
                  className={styles.dialogError}
                  role="alert"
                >
                  {errors[field.key as string]}
                </span>
              )}
            </div>
          ))}
        </div>

        <div className={styles.dialogFooter}>
          <button
            className={`${styles.dialogButton} ${styles.dialogButtonDelete}`}
            onClick={handleDelete}
            type="button"
          >
            Delete
          </button>
          <div className={styles.dialogFooterRight}>
            <button
              className={`${styles.dialogButton} ${styles.dialogButtonSecondary}`}
              onClick={onClose}
              type="button"
            >
              Cancel
            </button>
            <button
              className={`${styles.dialogButton} ${styles.dialogButtonPrimary}`}
              onClick={handleSave}
              type="button"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

KanbanCardDialog.displayName = 'KanbanCardDialog';


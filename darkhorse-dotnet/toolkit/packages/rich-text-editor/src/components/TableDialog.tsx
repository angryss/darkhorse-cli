/**
 * Table Dialog Component
 * Provides table insertion and configuration
 */

import React, { useState } from 'react';
import styles from './TableDialog.module.css';

export interface TableDialogProps {
  /** Callback when table inserted */
  onInsert: (rows: number, cols: number) => void;
  
  /** Callback when dialog closed */
  onClose: () => void;
}

export const TableDialog: React.FC<TableDialogProps> = ({ onInsert, onClose }) => {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);

  const handleInsert = () => {
    if (rows > 0 && cols > 0 && rows <= 20 && cols <= 20) {
      onInsert(rows, cols);
    }
  };

  return (
    <div className={styles.tableDialog} onClick={onClose}>
      <div className={styles.tableDialog__content} onClick={(e) => e.stopPropagation()}>
        <div className={styles.tableDialog__header}>
          <h3 className={styles.tableDialog__title}>Insert Table</h3>
        </div>

        <div className={styles.tableDialog__body}>
          <div className={styles.tableDialog__field}>
            <label className={styles.tableDialog__label}>
              Rows (1-20):
              <input
                type="number"
                className={styles.tableDialog__input}
                value={rows}
                onChange={(e) => setRows(Math.max(1, Math.min(20, Number(e.target.value))))}
                min="1"
                max="20"
              />
            </label>
          </div>

          <div className={styles.tableDialog__field}>
            <label className={styles.tableDialog__label}>
              Columns (1-20):
              <input
                type="number"
                className={styles.tableDialog__input}
                value={cols}
                onChange={(e) => setCols(Math.max(1, Math.min(20, Number(e.target.value))))}
                min="1"
                max="20"
              />
            </label>
          </div>

          {/* Preview */}
          <div className={styles.tableDialog__preview}>
            <div className={styles.tableDialog__previewLabel}>Preview:</div>
            <table className={styles.tableDialog__previewTable}>
              <tbody>
                {Array.from({ length: Math.min(rows, 5) }).map((_, r) => (
                  <tr key={r}>
                    {Array.from({ length: Math.min(cols, 5) }).map((_, c) => (
                      <td key={c} />
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {(rows > 5 || cols > 5) && (
              <div className={styles.tableDialog__previewNote}>
                {rows > 5 ? `(showing first 5 of ${rows} rows)` : ''}
                {rows > 5 && cols > 5 ? ' ' : ''}
                {cols > 5 ? `(showing first 5 of ${cols} columns)` : ''}
              </div>
            )}
          </div>
        </div>

        <div className={styles.tableDialog__footer}>
          <button
            className={`${styles.tableDialog__button} ${styles['tableDialog__button--secondary']}`}
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>
          <button
            className={`${styles.tableDialog__button} ${styles['tableDialog__button--primary']}`}
            onClick={handleInsert}
            type="button"
          >
            Insert Table
          </button>
        </div>
      </div>
    </div>
  );
};

export default TableDialog;


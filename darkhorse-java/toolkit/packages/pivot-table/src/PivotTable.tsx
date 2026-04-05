/**
 * Pivot Table Component
 * Interactive multi-dimensional data analysis component
 */

import { useMemo, forwardRef, useState } from 'react';
import type { PivotTableProps, PivotMatrix, PivotDrillThroughEvent } from './types';
import { buildPivotMatrix, exportToCSV } from './pivotEngine';
import { cn } from './utils';
import styles from './PivotTable.module.css';

/**
 * PivotTable component for multi-dimensional data analysis
 */
export const PivotTable = forwardRef<HTMLDivElement, PivotTableProps>(
  (
    {
      id,
      data,
      config,
      height,
      width = '100%',
      showToolbar = true,
      allowExcelExport = false,
      allowCsvExport = true,
      onExport,
      onCellClick,
      onDrillThrough,
      onError,
      className,
      style,
    },
    ref
  ) => {
    const [drillThroughData, setDrillThroughData] = useState<PivotDrillThroughEvent | null>(null);

    // Build pivot matrix
    const matrix: PivotMatrix | null = useMemo(() => {
      try {
        if (!data || data.length === 0) {
          return null;
        }
        return buildPivotMatrix(data, config);
      } catch (error) {
        onError?.(error);
        return null;
      }
    }, [data, config, onError]);

    // Handle export
    const handleExport = (format: 'csv' | 'excel') => {
      try {
        if (!matrix) return;
        
        if (format === 'csv') {
          const csvContent = exportToCSV(matrix);
          const blob = new Blob([csvContent], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'pivot-table.csv';
          a.click();
          URL.revokeObjectURL(url);
        }
        
        onExport?.({ format });
      } catch (error) {
        onError?.(error);
      }
    };

    // Handle cell click
    const handleCellClick = (rowIndex: number, columnIndex: number) => {
      try {
        if (!matrix) return;
        
        const cellRow = matrix.cells[rowIndex];
        if (!cellRow) return;
        
        const cell = cellRow[columnIndex];
        if (!cell) return;
        
        onCellClick?.({ rowIndex, columnIndex, cell });
        
        // Drill-through
        if (onDrillThrough && cell.records && cell.records.length > 0) {
          const event: PivotDrillThroughEvent = {
            cell,
            records: cell.records,
          };
          setDrillThroughData(event);
        }
      } catch (error) {
        onError?.(error);
      }
    };

    // Empty state
    if (!data || data.length === 0) {
      return (
        <div
          ref={ref}
          id={id}
          className={cn(styles.pivotTable, styles.empty, className)}
          style={{ ...style, height, width }}
        >
          <div className={styles.emptyState}>No data available</div>
        </div>
      );
    }

    if (!matrix) {
      return (
        <div
          ref={ref}
          id={id}
          className={cn(styles.pivotTable, styles.empty, className)}
          style={{ ...style, height, width }}
        >
          <div className={styles.emptyState}>Error loading pivot table</div>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        id={id}
        className={cn(styles.pivotTable, className)}
        style={{ ...style, height, width }}
      >
        {/* Toolbar */}
        {showToolbar && (
          <div className={styles.toolbar}>
            <div className={styles.toolbarTitle}>Pivot Table</div>
            <div className={styles.toolbarActions}>
              {allowCsvExport && (
                <button
                  className={styles.toolbarButton}
                  onClick={() => handleExport('csv')}
                  title="Export to CSV"
                >
                  Export CSV
                </button>
              )}
              {allowExcelExport && (
                <button
                  className={styles.toolbarButton}
                  onClick={() => handleExport('excel')}
                  title="Export to Excel"
                >
                  Export Excel
                </button>
              )}
            </div>
          </div>
        )}

        {/* Pivot grid */}
        <div className={styles.gridContainer}>
          <table className={styles.pivotGrid} role="grid">
            <thead>
              <tr>
                <th className={styles.cornerCell} />
                {matrix.columnHeaders.map((colPath, colIdx) => (
                  <th key={colIdx} className={styles.columnHeader}>
                    {colPath.join(' / ')}
                  </th>
                ))}
                {matrix.grandTotalColumn && (
                  <th className={cn(styles.columnHeader, styles.grandTotalHeader)}>
                    Grand Total
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {matrix.rowHeaders.map((rowPath, rowIdx) => {
                const cellRow = matrix.cells[rowIdx];
                if (!cellRow || !rowPath) return null;
                
                return (
                  <tr key={rowIdx}>
                    <th className={styles.rowHeader}>
                      {rowPath.join(' / ')}
                    </th>
                    {cellRow.map((cell, colIdx) => (
                    <td
                      key={colIdx}
                      className={cn(
                        styles.valueCell,
                        cell.records && cell.records.length > 0 && styles.clickable
                      )}
                      onClick={() => handleCellClick(rowIdx, colIdx)}
                      title={`${cell.count} records`}
                    >
                      {cell.formattedValue}
                    </td>
                  ))}
                    {matrix.grandTotalColumn && (
                      <td className={cn(styles.valueCell, styles.grandTotalCell)}>
                        {matrix.grandTotalColumn[rowIdx]?.formattedValue || '-'}
                      </td>
                    )}
                  </tr>
                );
              })}
              {matrix.grandTotalRow && (
                <tr className={styles.grandTotalRow}>
                  <th className={cn(styles.rowHeader, styles.grandTotalHeader)}>
                    Grand Total
                  </th>
                  {matrix.grandTotalRow.map((cell, colIdx) => (
                    <td key={colIdx} className={cn(styles.valueCell, styles.grandTotalCell)}>
                      {cell.formattedValue}
                    </td>
                  ))}
                  {matrix.grandTotal && (
                    <td className={cn(styles.valueCell, styles.grandTotalCell)}>
                      {matrix.grandTotal.formattedValue}
                    </td>
                  )}
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Drill-through dialog */}
        {drillThroughData && onDrillThrough && (
          <div className={styles.drillThroughOverlay} onClick={() => setDrillThroughData(null)}>
            <div className={styles.drillThroughDialog} onClick={e => e.stopPropagation()}>
              <div className={styles.drillThroughHeader}>
                <h3>Drill-Through Details</h3>
                <button
                  className={styles.closeButton}
                  onClick={() => setDrillThroughData(null)}
                  title="Close"
                >
                  ×
                </button>
              </div>
              <div className={styles.drillThroughContent}>
                <p>
                  <strong>Records:</strong> {drillThroughData.records.length}
                </p>
                <div className={styles.recordsTable}>
                  <table>
                    <thead>
                      <tr>
                        {Object.keys(drillThroughData.records[0] || {}).map(key => (
                          <th key={key}>{key}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {drillThroughData.records.slice(0, 100).map((record, idx) => (
                        <tr key={idx}>
                          {Object.values(record).map((value, vIdx) => (
                            <td key={vIdx}>{String(value)}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {drillThroughData.records.length > 100 && (
                    <p className={styles.recordsNote}>
                      Showing first 100 of {drillThroughData.records.length} records
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);

PivotTable.displayName = 'PivotTable';


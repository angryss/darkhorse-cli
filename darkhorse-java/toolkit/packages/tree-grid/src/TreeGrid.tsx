/**
 * TreeGrid Component
 * Displays hierarchical tabular data with expand/collapse, sorting, filtering, and selection
 */

import React, { useState, useCallback, useMemo, useEffect, forwardRef } from 'react';
import { cn } from './utils';
import type {
  TreeGridProps,
  TreeGridRecord,
  TreeGridColumn,
  TreeGridSortDirection,
  TreeGridToggleExpandArgs,
  TreeGridSortChangeArgs,
  TreeGridRowClickEvent,
} from './types';
import styles from './TreeGrid.module.css';

interface FlattenedRow {
  record: TreeGridRecord;
  level: number;
  hasChildren: boolean;
  parentId?: string | number;
}

/**
 * TreeGrid component for hierarchical data display
 */
export const TreeGrid = forwardRef<HTMLDivElement, TreeGridProps>(
  (
    {
      data,
      childField = 'children',
      columns,
      height,
      allowReordering = false,
      allowFiltering = false,
      allowSorting = false,
      filterSettings,
      allowSelection = false,
      selectionSettings,
      initiallyExpandedIds = [],
      onToggleExpand,
      onSortChange,
      onFilterChange,
      onColumnReorder,
      onRowClick,
      onSelectionChange,
      onError,
      className,
      style,
      ...rest
    },
    ref
  ) => {
    // Expanded state
    const [expandedIds, setExpandedIds] = useState<Set<string | number>>(
      new Set(initiallyExpandedIds)
    );

    // Sort state
    const [sortColumn, setSortColumn] = useState<TreeGridColumn | null>(null);
    const [sortDirection, setSortDirection] = useState<TreeGridSortDirection | undefined>(
      undefined
    );

    // Selection state
    const [selectedRows, setSelectedRows] = useState<Set<string | number>>(new Set());

    // Column order state
    const [columnOrder, setColumnOrder] = useState<TreeGridColumn[]>(columns);

    // Update column order when columns prop changes
    useEffect(() => {
      setColumnOrder(columns);
    }, [columns]);

    /**
     * Flatten hierarchical data into a linear array with level information
     */
    const flattenData = useCallback(
      (records: TreeGridRecord[], level = 0, parentId?: string | number): FlattenedRow[] => {
        const result: FlattenedRow[] = [];

        for (const record of records) {
          const children = record[childField] as TreeGridRecord[] | undefined;
          const hasChildren = Array.isArray(children) && children.length > 0;
          const isExpanded = expandedIds.has(record.id);

          result.push({
            record,
            level,
            hasChildren,
            parentId,
          });

          // If expanded and has children, recursively add children
          if (isExpanded && hasChildren) {
            result.push(...flattenData(children, level + 1, record.id));
          }
        }

        return result;
      },
      [childField, expandedIds]
    );

    /**
     * Sort flattened data hierarchically
     */
    const sortData = useCallback(
      (rows: FlattenedRow[]): FlattenedRow[] => {
        if (!sortColumn || !sortDirection) return rows;

        const sortRecursive = (items: FlattenedRow[]): FlattenedRow[] => {
          // Group by level and parent
          const grouped = new Map<string, FlattenedRow[]>();

          for (const item of items) {
            const key = `${item.level}-${item.parentId ?? 'root'}`;
            if (!grouped.has(key)) {
              grouped.set(key, []);
            }
            grouped.get(key)!.push(item);
          }

          // Sort each group
          const result: FlattenedRow[] = [];
          for (const group of grouped.values()) {
            const sorted = [...group].sort((a, b) => {
              const aVal = a.record[sortColumn.field];
              const bVal = b.record[sortColumn.field];

              let comparison = 0;
              if (typeof aVal === 'string' && typeof bVal === 'string') {
                comparison = aVal.localeCompare(bVal);
              } else if (typeof aVal === 'number' && typeof bVal === 'number') {
                comparison = aVal - bVal;
              } else {
                comparison = String(aVal).localeCompare(String(bVal));
              }

              return sortDirection === 'asc' ? comparison : -comparison;
            });
            result.push(...sorted);
          }

          return result;
        };

        return sortRecursive(rows);
      },
      [sortColumn, sortDirection]
    );

    /**
     * Get flattened and sorted rows
     */
    const visibleRows = useMemo(() => {
      const flattened = flattenData(data);
      return sortData(flattened);
    }, [data, flattenData, sortData]);

    /**
     * Toggle row expansion
     */
    const handleToggleExpand = useCallback(
      (record: TreeGridRecord) => {
        try {
          const isExpanded = expandedIds.has(record.id);
          const newExpandedIds = new Set(expandedIds);

          if (isExpanded) {
            newExpandedIds.delete(record.id);
          } else {
            newExpandedIds.add(record.id);
          }

          setExpandedIds(newExpandedIds);

          if (onToggleExpand) {
            const args: TreeGridToggleExpandArgs = {
              record,
              expanded: !isExpanded,
            };
            onToggleExpand(args);
          }
        } catch (error) {
          onError?.(error);
        }
      },
      [expandedIds, onToggleExpand, onError]
    );

    /**
     * Handle column header click for sorting
     */
    const handleHeaderClick = useCallback(
      (column: TreeGridColumn) => {
        if (!allowSorting || column.allowSorting === false) return;

        try {
          let newDirection: TreeGridSortDirection | undefined;

          if (sortColumn?.field === column.field) {
            // Cycle through: asc -> desc -> none
            if (sortDirection === 'asc') {
              newDirection = 'desc';
            } else if (sortDirection === 'desc') {
              newDirection = undefined;
            } else {
              newDirection = 'asc';
            }
          } else {
            newDirection = 'asc';
          }

          setSortColumn(newDirection ? column : null);
          setSortDirection(newDirection);

          if (onSortChange) {
            const args: TreeGridSortChangeArgs = {
              column,
              direction: newDirection,
            };
            onSortChange(args);
          }
        } catch (error) {
          onError?.(error);
        }
      },
      [allowSorting, sortColumn, sortDirection, onSortChange, onError]
    );

    /**
     * Handle row click
     */
    const handleRowClick = useCallback(
      (record: TreeGridRecord, rowIndex: number, event: React.MouseEvent) => {
        try {
          if (allowSelection) {
            const newSelectedRows = new Set(selectedRows);

            if (selectionSettings?.type === 'Multiple' && (event.ctrlKey || event.metaKey)) {
              // Toggle selection
              if (newSelectedRows.has(record.id)) {
                newSelectedRows.delete(record.id);
              } else {
                newSelectedRows.add(record.id);
              }
            } else {
              // Single selection
              newSelectedRows.clear();
              newSelectedRows.add(record.id);
            }

            setSelectedRows(newSelectedRows);

            if (onSelectionChange) {
              onSelectionChange({
                selection: Array.from(newSelectedRows),
              });
            }
          }

          if (onRowClick) {
            const args: TreeGridRowClickEvent = {
              record,
              rowIndex,
              originalEvent: event,
            };
            onRowClick(args);
          }
        } catch (error) {
          onError?.(error);
        }
      },
      [allowSelection, selectedRows, selectionSettings, onRowClick, onSelectionChange, onError]
    );

    /**
     * Get cell value using column's valueAccessor or field
     */
    const getCellValue = useCallback((column: TreeGridColumn, record: TreeGridRecord) => {
      if (column.valueAccessor) {
        return column.valueAccessor(column.field, record);
      }
      return record[column.field];
    }, []);

    /**
     * Render cell content
     */
    const renderCell = useCallback(
      (
        column: TreeGridColumn,
        record: TreeGridRecord,
        rowIndex: number,
        columnIndex: number,
        isTreeColumn: boolean,
        level: number,
        hasChildren: boolean
      ) => {
        const value = getCellValue(column, record);

        // Tree column with expand/collapse
        if (isTreeColumn) {
          return (
            <div className={styles.treeCellContent} style={{ paddingLeft: `${level * 20}px` }}>
              {hasChildren ? (
                <button
                  type="button"
                  className={cn(
                    styles.expandButton,
                    expandedIds.has(record.id) && styles.expanded
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleExpand(record);
                  }}
                  aria-label={expandedIds.has(record.id) ? 'Collapse' : 'Expand'}
                  aria-expanded={expandedIds.has(record.id)}
                >
                  <span className={styles.expandIcon}>▶</span>
                </button>
              ) : (
                <span className={styles.expandPlaceholder} />
              )}
              <span className={styles.cellValue}>
                {column.template
                  ? column.template({ record, column, value, rowIndex, columnIndex })
                  : String(value ?? '')}
              </span>
            </div>
          );
        }

        // Regular cell
        if (column.template) {
          return column.template({ record, column, value, rowIndex, columnIndex });
        }

        return String(value ?? '');
      },
      [getCellValue, expandedIds, handleToggleExpand]
    );

    /**
     * Render sort indicator
     */
    const renderSortIndicator = (column: TreeGridColumn) => {
      if (!allowSorting || column.allowSorting === false) return null;
      if (sortColumn?.field !== column.field) return null;

      return (
        <span className={styles.sortIndicator} aria-label={`Sorted ${sortDirection}`}>
          {sortDirection === 'asc' ? '▲' : '▼'}
        </span>
      );
    };

    // Empty state
    if (!data || data.length === 0) {
      return (
        <div ref={ref} className={cn(styles.treeGrid, styles.empty, className)} style={style} {...rest}>
          <div className={styles.emptyState}>No data available</div>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(styles.treeGrid, className)}
        style={{ ...style, height }}
        role="treegrid"
        aria-label="Tree Grid"
        {...rest}
      >
        <div className={styles.gridContainer}>
          {/* Header */}
          <div className={styles.header} role="row">
            {columnOrder.map((column) => (
              <div
                key={column.field}
                className={cn(
                  styles.headerCell,
                  allowSorting && column.allowSorting !== false && styles.sortable
                )}
                style={{
                  width: column.width,
                  textAlign: column.textAlign?.toLowerCase() as 'left' | 'center' | 'right',
                }}
                role="columnheader"
                onClick={() => handleHeaderClick(column)}
                tabIndex={allowSorting && column.allowSorting !== false ? 0 : undefined}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleHeaderClick(column);
                  }
                }}
              >
                <span className={styles.headerText}>{column.headerText || column.field}</span>
                {renderSortIndicator(column)}
              </div>
            ))}
          </div>

          {/* Body */}
          <div className={styles.body}>
            {visibleRows.map((row, rowIndex) => {
              const record = row.record;
              return (
                <div
                  key={record.id}
                  className={cn(
                    styles.row,
                    selectedRows.has(record.id) && styles.selected
                  )}
                  role="row"
                  aria-level={row.level + 1}
                  aria-expanded={row.hasChildren ? expandedIds.has(record.id) : undefined}
                  onClick={(e) => handleRowClick(record, rowIndex, e)}
                  tabIndex={0}
                >
                  {columnOrder.map((column, colIdx) => (
                    <div
                      key={column.field}
                      className={styles.cell}
                      style={{
                        width: column.width,
                        textAlign: column.textAlign?.toLowerCase() as 'left' | 'center' | 'right',
                      }}
                      role="gridcell"
                    >
                      {renderCell(
                        column,
                        record,
                        rowIndex,
                        colIdx,
                        colIdx === 0, // First column is tree column
                        row.level,
                        row.hasChildren
                      )}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
);

TreeGrid.displayName = 'TreeGrid';


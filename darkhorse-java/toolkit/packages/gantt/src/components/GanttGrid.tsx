/**
 * GanttGrid - Tree grid displaying task information
 */

import React, { useCallback } from 'react';
import type { GanttTask, GanttColumn, TaskTreeNode } from '../types';
import styles from '../GanttChart.module.css';

export interface GanttGridProps {
  nodes: TaskTreeNode[];
  columns: GanttColumn[];
  selectedTaskIds: Set<string | number>;
  rowHeight: number;
  onTaskClick: (task: GanttTask) => void;
  onExpandToggle: (taskId: string | number) => void;
}

export const GanttGrid: React.FC<GanttGridProps> = ({
  nodes,
  columns,
  selectedTaskIds,
  rowHeight,
  onTaskClick,
  onExpandToggle,
}) => {
  const renderCellValue = useCallback((task: GanttTask, column: GanttColumn) => {
    if (column.template) {
      return column.template(task);
    }

    const value = (task as Record<string, unknown>)[column.field];
    return value !== undefined && value !== null ? String(value) : '';
  }, []);

  const renderRow = useCallback((node: TaskTreeNode) => {
    const isSelected = selectedTaskIds.has(node.task.id);
    const hasChildren = node.children.length > 0;

    return (
      <div
        key={node.task.id}
        className={`${styles.gridRow} ${isSelected ? styles.gridRowSelected : ''} ${
          node.task.isSummary ? styles.gridRowSummary : ''
        }`}
        style={{ height: rowHeight }}
        onClick={() => onTaskClick(node.task)}
        role="row"
        aria-selected={isSelected}
      >
        {columns.map((column, colIndex) => (
          <div
            key={column.field}
            className={styles.gridCell}
            style={{
              width: column.width || 'auto',
              textAlign: column.textAlign || 'left',
              paddingLeft: colIndex === 0 ? node.level * 20 + 8 : undefined,
            }}
            role="gridcell"
          >
            {colIndex === 0 && hasChildren && (
              <button
                className={styles.expandButton}
                onClick={(e) => {
                  e.stopPropagation();
                  onExpandToggle(node.task.id);
                }}
                aria-label={node.expanded ? 'Collapse' : 'Expand'}
                aria-expanded={node.expanded}
              >
                {node.expanded ? '▼' : '▶'}
              </button>
            )}
            <span
              className={styles.gridCellContent}
              title={
                column.clipMode === 'EllipsisWithTooltip'
                  ? String(renderCellValue(node.task, column))
                  : undefined
              }
            >
              {renderCellValue(node.task, column)}
            </span>
          </div>
        ))}
      </div>
    );
  }, [columns, selectedTaskIds, rowHeight, onTaskClick, onExpandToggle, renderCellValue]);

  return (
    <div className={styles.grid} role="treegrid" aria-label="Task list">
      {/* Header */}
      <div className={styles.gridHeader} role="row">
        {columns.map((column) => (
          <div
            key={column.field}
            className={styles.gridHeaderCell}
            style={{
              width: column.width || 'auto',
              textAlign: column.textAlign || 'left',
            }}
            role="columnheader"
          >
            {column.headerText || column.field}
          </div>
        ))}
      </div>

      {/* Rows */}
      <div className={styles.gridBody}>
        {nodes.map((node) => renderRow(node))}
      </div>
    </div>
  );
};


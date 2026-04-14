/**
 * GanttChart Component
 * @module @react-toolkit/gantt
 */

import React, { useState, useCallback, useMemo, useEffect, useImperativeHandle, forwardRef } from 'react';
import type { GanttChartProps, GanttHandle, TaskTreeNode, GanttTask } from './types';
import { GanttGrid } from './components/GanttGrid';
import { GanttTimeline } from './components/GanttTimeline';
import { GanttSplitter } from './components/GanttSplitter';
import { GanttToolbar } from './components/GanttToolbar';
import { buildTaskTree, flattenTaskTree } from './utils/taskUtils';
import { calculateTimelineBounds } from './utils/timelineUtils';
import { toDate } from './utils/dateUtils';
import styles from './GanttChart.module.css';

/**
 * Gantt Chart component for project timeline visualization
 */
export const GanttChart = forwardRef<GanttHandle, GanttChartProps>((props, ref) => {
  const {
    id,
    tasks,
    columns,
    taskFields,
    labelSettings,
    splitterSettings,
    projectStartDate,
    projectEndDate,
    height = '600px',
    width = '100%',
    rowHeight = 40,
    taskbarHeight = 28,
    timelineViewMode = 'Day',
    allowSelection = true,
    selectionMode = 'Single',
    readOnly = false,
    showWeekend = true,
    highlightWeekends = true,
    showGridlines = true,
    showBaseline = false,
    baselineStartField,
    baselineEndField,
    undoRedo = false,
    resourceFields,
    resources,
    workingTime,
    holidays,
    dateFormatter,
    toolbar,
    onCreated,
    onDataBound,
    onTaskSelect,
    onTaskChange,
    onTaskDelete,
    onTaskAdd,
    onSplitterResize,
    onError,
    className,
    style,
    ...restProps
  } = props;

  // State
  const [taskTree, setTaskTree] = useState<TaskTreeNode[]>([]);
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string | number>>(new Set());
  const [splitterPosition, setSplitterPosition] = useState<number>(
    typeof splitterSettings?.position === 'number'
      ? splitterSettings.position
      : 400
  );
  const currentViewMode = timelineViewMode;

  // Build task tree
  useEffect(() => {
    try {
      const tree = buildTaskTree(tasks);
      setTaskTree(tree);
    } catch (error) {
      if (onError) {
        onError(error as Error);
      }
    }
  }, [tasks, onError]);

  // Flatten tree for rendering
  const flattenedNodes = useMemo(() => {
    return flattenTaskTree(taskTree);
  }, [taskTree]);

  // Calculate timeline bounds
  const timelineBounds = useMemo(() => {
    const start = projectStartDate ? toDate(projectStartDate) || undefined : undefined;
    const end = projectEndDate ? toDate(projectEndDate) || undefined : undefined;
    return calculateTimelineBounds(tasks, start, end);
  }, [tasks, projectStartDate, projectEndDate]);

  // Handle task selection
  const handleTaskClick = useCallback(
    (task: GanttTask) => {
      if (!allowSelection) return;

      setSelectedTaskIds((prev) => {
        const newSelection = new Set(prev);

        if (selectionMode === 'Single') {
          newSelection.clear();
          newSelection.add(task.id);
        } else if (selectionMode === 'Multiple') {
          if (newSelection.has(task.id)) {
            newSelection.delete(task.id);
          } else {
            newSelection.add(task.id);
          }
        }

        return newSelection;
      });

      if (onTaskSelect) {
        onTaskSelect(task);
      }
    },
    [allowSelection, selectionMode, onTaskSelect]
  );

  // Handle expand/collapse
  const handleExpandToggle = useCallback((taskId: string | number) => {
    setTaskTree((prevTree) => {
      const toggleNode = (nodes: TaskTreeNode[]): TaskTreeNode[] => {
        return nodes.map((node) => {
          if (node.task.id === taskId) {
            return { ...node, expanded: !node.expanded };
          }
          if (node.children.length > 0) {
            return { ...node, children: toggleNode(node.children) };
          }
          return node;
        });
      };

      return toggleNode(prevTree);
    });
  }, []);

  // Handle task change
  const handleTaskChange = useCallback(
    (updatedTask: GanttTask) => {
      if (onTaskChange) {
        onTaskChange(updatedTask);
      }
    },
    [onTaskChange]
  );

  // Handle toolbar actions
  const handleToolbarAction = useCallback(
    (action: string) => {
      switch (action) {
        case 'ExpandAll':
          setTaskTree((prevTree) => {
            const expandAll = (nodes: TaskTreeNode[]): TaskTreeNode[] => {
              return nodes.map((node) => ({
                ...node,
                expanded: true,
                children: expandAll(node.children),
              }));
            };
            return expandAll(prevTree);
          });
          break;

        case 'CollapseAll':
          setTaskTree((prevTree) => {
            const collapseAll = (nodes: TaskTreeNode[]): TaskTreeNode[] => {
              return nodes.map((node) => ({
                ...node,
                expanded: false,
                children: collapseAll(node.children),
              }));
            };
            return collapseAll(prevTree);
          });
          break;

        case 'ZoomIn':
          // Implement zoom logic
          break;

        case 'ZoomOut':
          // Implement zoom logic
          break;

        case 'ZoomToFit':
          // Implement zoom to fit logic
          break;

        case 'Add':
          if (onTaskAdd) {
            const newTask: GanttTask = {
              id: Date.now(),
              name: 'New Task',
              startDate: new Date(),
              duration: 1,
            };
            onTaskAdd(newTask);
          }
          break;

        case 'Delete':
          if (onTaskDelete && selectedTaskIds.size > 0) {
            onTaskDelete(Array.from(selectedTaskIds));
            setSelectedTaskIds(new Set());
          }
          break;
      }
    },
    [selectedTaskIds, onTaskAdd, onTaskDelete]
  );

  // Handle splitter resize
  const handleSplitterResize = useCallback(
    (position: number) => {
      setSplitterPosition(position);
      if (onSplitterResize) {
        onSplitterResize(position);
      }
    },
    [onSplitterResize]
  );

  // Imperative handle
  useImperativeHandle(
    ref,
    () => ({
      refresh: () => {
        setTaskTree(buildTaskTree(tasks));
      },
      expandAll: () => handleToolbarAction('ExpandAll'),
      collapseAll: () => handleToolbarAction('CollapseAll'),
      zoomIn: () => handleToolbarAction('ZoomIn'),
      zoomOut: () => handleToolbarAction('ZoomOut'),
      zoomToFit: () => handleToolbarAction('ZoomToFit'),
      updateTask: (task: GanttTask) => {
        handleTaskChange(task);
      },
      deleteTask: (taskId: string | number) => {
        if (onTaskDelete) {
          onTaskDelete([taskId]);
        }
      },
    }),
    [tasks, handleToolbarAction, handleTaskChange, onTaskDelete]
  );

  // Lifecycle callbacks
  useEffect(() => {
    if (onCreated) {
      onCreated();
    }
  }, [onCreated]);

  useEffect(() => {
    if (onDataBound && flattenedNodes.length > 0) {
      onDataBound();
    }
  }, [flattenedNodes, onDataBound]);

  // Build component classes
  const ganttClasses = [styles.gantt, className].filter(Boolean).join(' ');

  const ganttStyle: React.CSSProperties = {
    ...style,
    height: typeof height === 'number' ? `${height}px` : height,
    width: typeof width === 'number' ? `${width}px` : width,
  };

  return (
    <div
      id={id}
      className={ganttClasses}
      style={ganttStyle}
      role="application"
      aria-label="Gantt chart"
      {...restProps}
    >
      {/* Toolbar */}
      {toolbar && toolbar.length > 0 && (
        <GanttToolbar actions={toolbar} onAction={handleToolbarAction} />
      )}

      {/* Main content */}
      <div className={styles.ganttContent}>
        {/* Grid (left) */}
        <div
          className={styles.ganttGrid}
          style={{ width: splitterPosition }}
        >
          <GanttGrid
            nodes={flattenedNodes}
            columns={columns}
            selectedTaskIds={selectedTaskIds}
            rowHeight={rowHeight}
            onTaskClick={handleTaskClick}
            onExpandToggle={handleExpandToggle}
          />
        </div>

        {/* Splitter */}
        <GanttSplitter
          position={splitterPosition}
          onResize={handleSplitterResize}
        />

        {/* Timeline (right) */}
        <div className={styles.ganttTimeline}>
          <GanttTimeline
            nodes={flattenedNodes}
            timelineStart={timelineBounds.start}
            timelineEnd={timelineBounds.end}
            viewMode={currentViewMode}
            rowHeight={rowHeight}
            taskbarHeight={taskbarHeight}
            selectedTaskIds={selectedTaskIds}
            showBaseline={showBaseline}
            highlightWeekends={highlightWeekends}
            showGridlines={showGridlines}
            readOnly={readOnly}
            onTaskClick={handleTaskClick}
            onTaskChange={handleTaskChange}
          />
        </div>
      </div>
    </div>
  );
});

GanttChart.displayName = 'GanttChart';


import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * GanttChart Component
 * @module @react-toolkit/gantt
 */
import { useState, useCallback, useMemo, useEffect, useImperativeHandle, forwardRef } from 'react';
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
export const GanttChart = forwardRef((props, ref) => {
    const { id, tasks, columns, taskFields, labelSettings, splitterSettings, projectStartDate, projectEndDate, height = '600px', width = '100%', rowHeight = 40, taskbarHeight = 28, timelineViewMode = 'Day', allowSelection = true, selectionMode = 'Single', readOnly = false, showWeekend = true, highlightWeekends = true, showGridlines = true, showBaseline = false, baselineStartField, baselineEndField, undoRedo = false, resourceFields, resources, workingTime, holidays, dateFormatter, toolbar, onCreated, onDataBound, onTaskSelect, onTaskChange, onTaskDelete, onTaskAdd, onSplitterResize, onError, className, style, ...restProps } = props;
    // State
    const [taskTree, setTaskTree] = useState([]);
    const [selectedTaskIds, setSelectedTaskIds] = useState(new Set());
    const [splitterPosition, setSplitterPosition] = useState(typeof splitterSettings?.position === 'number'
        ? splitterSettings.position
        : 400);
    const currentViewMode = timelineViewMode;
    // Build task tree
    useEffect(() => {
        try {
            const tree = buildTaskTree(tasks);
            setTaskTree(tree);
        }
        catch (error) {
            if (onError) {
                onError(error);
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
    const handleTaskClick = useCallback((task) => {
        if (!allowSelection)
            return;
        setSelectedTaskIds((prev) => {
            const newSelection = new Set(prev);
            if (selectionMode === 'Single') {
                newSelection.clear();
                newSelection.add(task.id);
            }
            else if (selectionMode === 'Multiple') {
                if (newSelection.has(task.id)) {
                    newSelection.delete(task.id);
                }
                else {
                    newSelection.add(task.id);
                }
            }
            return newSelection;
        });
        if (onTaskSelect) {
            onTaskSelect(task);
        }
    }, [allowSelection, selectionMode, onTaskSelect]);
    // Handle expand/collapse
    const handleExpandToggle = useCallback((taskId) => {
        setTaskTree((prevTree) => {
            const toggleNode = (nodes) => {
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
    const handleTaskChange = useCallback((updatedTask) => {
        if (onTaskChange) {
            onTaskChange(updatedTask);
        }
    }, [onTaskChange]);
    // Handle toolbar actions
    const handleToolbarAction = useCallback((action) => {
        switch (action) {
            case 'ExpandAll':
                setTaskTree((prevTree) => {
                    const expandAll = (nodes) => {
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
                    const collapseAll = (nodes) => {
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
                    const newTask = {
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
    }, [selectedTaskIds, onTaskAdd, onTaskDelete]);
    // Handle splitter resize
    const handleSplitterResize = useCallback((position) => {
        setSplitterPosition(position);
        if (onSplitterResize) {
            onSplitterResize(position);
        }
    }, [onSplitterResize]);
    // Imperative handle
    useImperativeHandle(ref, () => ({
        refresh: () => {
            setTaskTree(buildTaskTree(tasks));
        },
        expandAll: () => handleToolbarAction('ExpandAll'),
        collapseAll: () => handleToolbarAction('CollapseAll'),
        zoomIn: () => handleToolbarAction('ZoomIn'),
        zoomOut: () => handleToolbarAction('ZoomOut'),
        zoomToFit: () => handleToolbarAction('ZoomToFit'),
        updateTask: (task) => {
            handleTaskChange(task);
        },
        deleteTask: (taskId) => {
            if (onTaskDelete) {
                onTaskDelete([taskId]);
            }
        },
    }), [tasks, handleToolbarAction, handleTaskChange, onTaskDelete]);
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
    const ganttStyle = {
        ...style,
        height: typeof height === 'number' ? `${height}px` : height,
        width: typeof width === 'number' ? `${width}px` : width,
    };
    return (_jsxs("div", { id: id, className: ganttClasses, style: ganttStyle, role: "application", "aria-label": "Gantt chart", ...restProps, children: [toolbar && toolbar.length > 0 && (_jsx(GanttToolbar, { actions: toolbar, onAction: handleToolbarAction })), _jsxs("div", { className: styles.ganttContent, children: [_jsx("div", { className: styles.ganttGrid, style: { width: splitterPosition }, children: _jsx(GanttGrid, { nodes: flattenedNodes, columns: columns, selectedTaskIds: selectedTaskIds, rowHeight: rowHeight, onTaskClick: handleTaskClick, onExpandToggle: handleExpandToggle }) }), _jsx(GanttSplitter, { position: splitterPosition, onResize: handleSplitterResize }), _jsx("div", { className: styles.ganttTimeline, children: _jsx(GanttTimeline, { nodes: flattenedNodes, timelineStart: timelineBounds.start, timelineEnd: timelineBounds.end, viewMode: currentViewMode, rowHeight: rowHeight, taskbarHeight: taskbarHeight, selectedTaskIds: selectedTaskIds, showBaseline: showBaseline, highlightWeekends: highlightWeekends, showGridlines: showGridlines, readOnly: readOnly, onTaskClick: handleTaskClick, onTaskChange: handleTaskChange }) })] })] }));
});
GanttChart.displayName = 'GanttChart';
//# sourceMappingURL=GanttChart.js.map
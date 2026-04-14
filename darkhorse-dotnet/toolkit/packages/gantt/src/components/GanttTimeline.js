import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * GanttTimeline - Timeline view with task bars and dependencies
 */
import { useMemo } from 'react';
import { GanttTaskBar } from './GanttTaskBar';
import { GanttDependencyLines } from './GanttDependencyLines';
import { calculateTaskDates } from '../utils/taskUtils';
import { dateToPixel, generateTimelineCells, getTimelineScale } from '../utils/timelineUtils';
import { isWeekend } from '../utils/dateUtils';
import styles from '../GanttChart.module.css';
export const GanttTimeline = ({ nodes, timelineStart, timelineEnd, viewMode, rowHeight, taskbarHeight, selectedTaskIds, showBaseline, highlightWeekends, showGridlines, readOnly, onTaskClick, onTaskChange, }) => {
    const scale = getTimelineScale(viewMode);
    const pixelsPerDay = scale.pixelsPerUnit / (viewMode === 'Day' ? 1 : viewMode === 'Week' ? 7 : 30);
    // Generate timeline cells
    const timelineCells = useMemo(() => {
        return generateTimelineCells(timelineStart, timelineEnd, viewMode);
    }, [timelineStart, timelineEnd, viewMode]);
    // Calculate timeline width
    const timelineWidth = useMemo(() => {
        const days = Math.ceil((timelineEnd.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24));
        return days * pixelsPerDay;
    }, [timelineStart, timelineEnd, pixelsPerDay]);
    // Get position for a date
    const getPosition = (date) => {
        return dateToPixel(date, timelineStart, pixelsPerDay);
    };
    return (_jsxs("div", { className: styles.timeline, role: "grid", "aria-label": "Timeline view", children: [_jsx("div", { className: styles.timelineHeader, children: _jsx("div", { className: styles.timelineHeaderContent, style: { width: timelineWidth }, children: timelineCells.map((cell, index) => {
                        const cellWidth = scale.pixelsPerUnit;
                        const isWeekendCell = isWeekend(cell.date);
                        return (_jsx("div", { className: `${styles.timelineHeaderCell} ${isWeekendCell && highlightWeekends ? styles.timelineHeaderCellWeekend : ''}`, style: { width: cellWidth }, children: cell.label }, index));
                    }) }) }), _jsxs("div", { className: styles.timelineBody, style: { width: timelineWidth }, children: [showGridlines && (_jsx("div", { className: styles.timelineGridlines, children: timelineCells.map((cell, index) => (_jsx("div", { className: `${styles.timelineGridline} ${isWeekend(cell.date) && highlightWeekends ? styles.timelineGridlineWeekend : ''}`, style: {
                                left: index * scale.pixelsPerUnit,
                                width: scale.pixelsPerUnit,
                            } }, index))) })), _jsx("div", { className: styles.timelineTasks, children: nodes.map((node, index) => {
                            const { startDate, endDate } = calculateTaskDates(node.task);
                            if (!startDate || !endDate) {
                                return (_jsx("div", { className: styles.timelineRow, style: { height: rowHeight, top: index * rowHeight } }, node.task.id));
                            }
                            const left = getPosition(startDate);
                            const right = getPosition(endDate);
                            const width = right - left + pixelsPerDay; // Include end day
                            return (_jsx("div", { className: styles.timelineRow, style: { height: rowHeight, top: index * rowHeight }, children: _jsx(GanttTaskBar, { task: node.task, left: left, width: width, height: taskbarHeight, isSelected: selectedTaskIds.has(node.task.id), isSummary: node.task.isSummary || false, showBaseline: showBaseline, readOnly: readOnly, onClick: () => onTaskClick(node.task), onChange: onTaskChange }) }, node.task.id));
                        }) }), _jsx(GanttDependencyLines, { nodes: nodes, rowHeight: rowHeight, getPosition: getPosition, pixelsPerDay: pixelsPerDay })] })] }));
};
//# sourceMappingURL=GanttTimeline.js.map
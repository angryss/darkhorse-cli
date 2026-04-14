/**
 * GanttTimeline - Timeline view with task bars and dependencies
 */

import React, { useMemo } from 'react';
import type { GanttTask, TaskTreeNode, TimelineViewMode } from '../types';
import { GanttTaskBar } from './GanttTaskBar';
import { GanttDependencyLines } from './GanttDependencyLines';
import { calculateTaskDates } from '../utils/taskUtils';
import { dateToPixel, generateTimelineCells, getTimelineScale } from '../utils/timelineUtils';
import { isWeekend } from '../utils/dateUtils';
import styles from '../GanttChart.module.css';

export interface GanttTimelineProps {
  nodes: TaskTreeNode[];
  timelineStart: Date;
  timelineEnd: Date;
  viewMode: TimelineViewMode;
  rowHeight: number;
  taskbarHeight: number;
  selectedTaskIds: Set<string | number>;
  showBaseline: boolean;
  highlightWeekends: boolean;
  showGridlines: boolean;
  readOnly: boolean;
  onTaskClick: (task: GanttTask) => void;
  onTaskChange: (task: GanttTask) => void;
}

export const GanttTimeline: React.FC<GanttTimelineProps> = ({
  nodes,
  timelineStart,
  timelineEnd,
  viewMode,
  rowHeight,
  taskbarHeight,
  selectedTaskIds,
  showBaseline,
  highlightWeekends,
  showGridlines,
  readOnly,
  onTaskClick,
  onTaskChange,
}) => {
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
  const getPosition = (date: Date) => {
    return dateToPixel(date, timelineStart, pixelsPerDay);
  };

  return (
    <div className={styles.timeline} role="grid" aria-label="Timeline view">
      {/* Timeline Header */}
      <div className={styles.timelineHeader}>
        <div className={styles.timelineHeaderContent} style={{ width: timelineWidth }}>
          {timelineCells.map((cell, index) => {
            const cellWidth = scale.pixelsPerUnit;
            const isWeekendCell = isWeekend(cell.date);

            return (
              <div
                key={index}
                className={`${styles.timelineHeaderCell} ${
                  isWeekendCell && highlightWeekends ? styles.timelineHeaderCellWeekend : ''
                }`}
                style={{ width: cellWidth }}
              >
                {cell.label}
              </div>
            );
          })}
        </div>
      </div>

      {/* Timeline Body */}
      <div className={styles.timelineBody} style={{ width: timelineWidth }}>
        {/* Background grid lines */}
        {showGridlines && (
          <div className={styles.timelineGridlines}>
            {timelineCells.map((cell, index) => (
              <div
                key={index}
                className={`${styles.timelineGridline} ${
                  isWeekend(cell.date) && highlightWeekends ? styles.timelineGridlineWeekend : ''
                }`}
                style={{
                  left: index * scale.pixelsPerUnit,
                  width: scale.pixelsPerUnit,
                }}
              />
            ))}
          </div>
        )}

        {/* Task bars */}
        <div className={styles.timelineTasks}>
          {nodes.map((node, index) => {
            const { startDate, endDate } = calculateTaskDates(node.task);
            
            if (!startDate || !endDate) {
              return (
                <div
                  key={node.task.id}
                  className={styles.timelineRow}
                  style={{ height: rowHeight, top: index * rowHeight }}
                />
              );
            }

            const left = getPosition(startDate);
            const right = getPosition(endDate);
            const width = right - left + pixelsPerDay; // Include end day

            return (
              <div
                key={node.task.id}
                className={styles.timelineRow}
                style={{ height: rowHeight, top: index * rowHeight }}
              >
                <GanttTaskBar
                  task={node.task}
                  left={left}
                  width={width}
                  height={taskbarHeight}
                  isSelected={selectedTaskIds.has(node.task.id)}
                  isSummary={node.task.isSummary || false}
                  showBaseline={showBaseline}
                  readOnly={readOnly}
                  onClick={() => onTaskClick(node.task)}
                  onChange={onTaskChange}
                />
              </div>
            );
          })}
        </div>

        {/* Dependency lines */}
        <GanttDependencyLines
          nodes={nodes}
          rowHeight={rowHeight}
          getPosition={getPosition}
          pixelsPerDay={pixelsPerDay}
        />
      </div>
    </div>
  );
};


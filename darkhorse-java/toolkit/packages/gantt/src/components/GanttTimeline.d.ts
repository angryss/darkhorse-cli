/**
 * GanttTimeline - Timeline view with task bars and dependencies
 */
import React from 'react';
import type { GanttTask, TaskTreeNode, TimelineViewMode } from '../types';
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
export declare const GanttTimeline: React.FC<GanttTimelineProps>;
//# sourceMappingURL=GanttTimeline.d.ts.map
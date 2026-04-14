/**
 * GanttGrid - Tree grid displaying task information
 */
import React from 'react';
import type { GanttTask, GanttColumn, TaskTreeNode } from '../types';
export interface GanttGridProps {
    nodes: TaskTreeNode[];
    columns: GanttColumn[];
    selectedTaskIds: Set<string | number>;
    rowHeight: number;
    onTaskClick: (task: GanttTask) => void;
    onExpandToggle: (taskId: string | number) => void;
}
export declare const GanttGrid: React.FC<GanttGridProps>;
//# sourceMappingURL=GanttGrid.d.ts.map
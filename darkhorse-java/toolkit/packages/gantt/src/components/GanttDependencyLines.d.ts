/**
 * GanttDependencyLines - SVG lines connecting dependent tasks
 */
import React from 'react';
import type { TaskTreeNode } from '../types';
export interface GanttDependencyLinesProps {
    nodes: TaskTreeNode[];
    rowHeight: number;
    getPosition: (date: Date) => number;
    pixelsPerDay: number;
}
export declare const GanttDependencyLines: React.FC<GanttDependencyLinesProps>;
//# sourceMappingURL=GanttDependencyLines.d.ts.map
/**
 * GanttTaskBar - Individual task bar with progress and interaction
 */
import React from 'react';
import type { GanttTask } from '../types';
export interface GanttTaskBarProps {
    task: GanttTask;
    left: number;
    width: number;
    height: number;
    isSelected: boolean;
    isSummary: boolean;
    showBaseline: boolean;
    readOnly: boolean;
    onClick: () => void;
    onChange: (task: GanttTask) => void;
}
export declare const GanttTaskBar: React.FC<GanttTaskBarProps>;
//# sourceMappingURL=GanttTaskBar.d.ts.map
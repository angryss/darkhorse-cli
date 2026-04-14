/**
 * GanttToolbar - Action toolbar for Gantt operations
 */
import React from 'react';
import type { GanttToolbarAction } from '../types';
export interface GanttToolbarProps {
    actions: GanttToolbarAction[];
    onAction: (action: GanttToolbarAction) => void;
}
export declare const GanttToolbar: React.FC<GanttToolbarProps>;
//# sourceMappingURL=GanttToolbar.d.ts.map
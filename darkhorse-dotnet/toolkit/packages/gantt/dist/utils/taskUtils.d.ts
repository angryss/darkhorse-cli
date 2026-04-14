/**
 * Task calculation and manipulation utilities
 */
import type { GanttTask, TaskTreeNode } from '../types';
/**
 * Build hierarchical task tree from flat task list
 */
export declare function buildTaskTree(tasks: GanttTask[]): TaskTreeNode[];
/**
 * Flatten task tree to array (respecting expand/collapse state)
 */
export declare function flattenTaskTree(nodes: TaskTreeNode[], includeCollapsed?: boolean): TaskTreeNode[];
/**
 * Calculate task dates (derive missing start/end/duration)
 */
export declare function calculateTaskDates(task: GanttTask): {
    startDate: Date | null;
    endDate: Date | null;
    duration: number | null;
};
/**
 * Check if task has valid dates
 */
export declare function hasValidDates(task: GanttTask): boolean;
/**
 * Get all descendant task IDs
 */
export declare function getDescendantIds(taskId: string | number, tasks: GanttTask[]): Array<string | number>;
/**
 * Calculate summary task dates from children
 */
export declare function calculateSummaryDates(task: GanttTask, tasks: GanttTask[]): {
    startDate: Date | null;
    endDate: Date | null;
};
/**
 * Calculate progress for summary task
 */
export declare function calculateSummaryProgress(task: GanttTask, tasks: GanttTask[]): number;
//# sourceMappingURL=taskUtils.d.ts.map
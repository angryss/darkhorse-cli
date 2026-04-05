/**
 * Task calculation and manipulation utilities
 */

import type { GanttTask, TaskTreeNode } from '../types';
import { toDate, addDays, diffInDays } from './dateUtils';

/**
 * Build hierarchical task tree from flat task list
 */
export function buildTaskTree(tasks: GanttTask[]): TaskTreeNode[] {
  const taskMap = new Map<string | number, TaskTreeNode>();
  const rootNodes: TaskTreeNode[] = [];

  // Create nodes
  tasks.forEach((task) => {
    const node: TaskTreeNode = {
      task,
      level: 0,
      expanded: true,
      children: [],
    };
    taskMap.set(task.id, node);
  });

  // Build tree structure
  tasks.forEach((task) => {
    const node = taskMap.get(task.id);
    if (!node) return;

    if (task.parentId !== undefined && task.parentId !== null) {
      const parent = taskMap.get(task.parentId);
      if (parent) {
        parent.children.push(node);
        node.parent = parent;
        node.level = parent.level + 1;
      } else {
        rootNodes.push(node);
      }
    } else {
      rootNodes.push(node);
    }
  });

  return rootNodes;
}

/**
 * Flatten task tree to array (respecting expand/collapse state)
 */
export function flattenTaskTree(
  nodes: TaskTreeNode[],
  includeCollapsed: boolean = false
): TaskTreeNode[] {
  const result: TaskTreeNode[] = [];

  function traverse(nodes: TaskTreeNode[]) {
    for (const node of nodes) {
      result.push(node);
      if (node.expanded || includeCollapsed) {
        traverse(node.children);
      }
    }
  }

  traverse(nodes);
  return result;
}

/**
 * Calculate task dates (derive missing start/end/duration)
 */
export function calculateTaskDates(task: GanttTask): {
  startDate: Date | null;
  endDate: Date | null;
  duration: number | null;
} {
  const start = toDate(task.startDate);
  const end = toDate(task.endDate);
  const duration = task.duration;

  if (start && end) {
    return {
      startDate: start,
      endDate: end,
      duration: diffInDays(start, end) + 1,
    };
  }

  if (start && duration) {
    return {
      startDate: start,
      endDate: addDays(start, duration - 1),
      duration,
    };
  }

  if (end && duration) {
    return {
      startDate: addDays(end, -(duration - 1)),
      endDate: end,
      duration,
    };
  }

  return {
    startDate: start,
    endDate: end,
    duration: start && end ? diffInDays(start, end) + 1 : duration || null,
  };
}

/**
 * Check if task has valid dates
 */
export function hasValidDates(task: GanttTask): boolean {
  const { startDate, endDate } = calculateTaskDates(task);
  return startDate !== null && endDate !== null;
}

/**
 * Get all descendant task IDs
 */
export function getDescendantIds(
  taskId: string | number,
  tasks: GanttTask[]
): Array<string | number> {
  const descendants: Array<string | number> = [];
  const children = tasks.filter((t) => t.parentId === taskId);

  for (const child of children) {
    descendants.push(child.id);
    descendants.push(...getDescendantIds(child.id, tasks));
  }

  return descendants;
}

/**
 * Calculate summary task dates from children
 */
export function calculateSummaryDates(
  task: GanttTask,
  tasks: GanttTask[]
): { startDate: Date | null; endDate: Date | null } {
  const children = tasks.filter((t) => t.parentId === task.id);
  
  if (children.length === 0) {
    const { startDate, endDate } = calculateTaskDates(task);
    return { startDate, endDate };
  }

  let minStart: Date | null = null;
  let maxEnd: Date | null = null;

  for (const child of children) {
    const { startDate, endDate } = child.isSummary
      ? calculateSummaryDates(child, tasks)
      : calculateTaskDates(child);

    if (startDate) {
      if (!minStart || startDate < minStart) {
        minStart = startDate;
      }
    }

    if (endDate) {
      if (!maxEnd || endDate > maxEnd) {
        maxEnd = endDate;
      }
    }
  }

  return { startDate: minStart, endDate: maxEnd };
}

/**
 * Calculate progress for summary task
 */
export function calculateSummaryProgress(
  task: GanttTask,
  tasks: GanttTask[]
): number {
  const children = tasks.filter((t) => t.parentId === task.id);
  
  if (children.length === 0) {
    return task.progress || 0;
  }

  let totalProgress = 0;
  for (const child of children) {
    totalProgress += child.isSummary
      ? calculateSummaryProgress(child, tasks)
      : (child.progress || 0);
  }

  return totalProgress / children.length;
}


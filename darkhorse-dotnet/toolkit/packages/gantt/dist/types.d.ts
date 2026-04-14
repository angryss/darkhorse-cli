/**
 * Gantt Chart Component Types
 * @module @react-toolkit/gantt
 */
import type { BaseComponentProps } from '../../core/src/types/common';
/**
 * Represents a task in the Gantt chart
 */
export interface GanttTask {
    /** Unique identifier for the task */
    id: string | number;
    /** Task name/title */
    name: string;
    /** Task start date */
    startDate?: string | Date;
    /** Task end date */
    endDate?: string | Date;
    /** Task duration in days */
    duration?: number;
    /** Task progress (0-100) */
    progress?: number;
    /** Dependencies (e.g., "3FS,5SS") */
    dependency?: string;
    /** Parent task ID for hierarchy */
    parentId?: string | number;
    /** Whether this is a summary task */
    isSummary?: boolean;
    /** Baseline start date for comparison */
    baselineStartDate?: string | Date;
    /** Baseline end date for comparison */
    baselineEndDate?: string | Date;
    /** Assigned resources */
    resources?: Array<string | number>;
    /** Additional metadata */
    meta?: Record<string, unknown>;
    /** Allow additional properties */
    [key: string]: unknown;
}
/**
 * Column definition for the tree grid
 */
export interface GanttColumn {
    /** Field name to display */
    field: string;
    /** Column header text */
    headerText?: string;
    /** Column width */
    width?: number | string;
    /** Text overflow behavior */
    clipMode?: 'Ellipsis' | 'EllipsisWithTooltip' | 'Wrap';
    /** Custom cell template */
    template?: (task: GanttTask) => React.ReactNode;
    /** Enable sorting */
    sortable?: boolean;
    /** Text alignment */
    textAlign?: 'left' | 'center' | 'right';
}
/**
 * Label settings for taskbars
 */
export interface GanttLabelSettings {
    /** Left label (field name or function) */
    leftLabel?: keyof GanttTask | ((task: GanttTask) => string);
    /** Right label (field name or function) */
    rightLabel?: keyof GanttTask | ((task: GanttTask) => string);
}
/**
 * Splitter configuration
 */
export interface GanttSplitterSettings {
    /** Column index where timeline split occurs */
    columnIndex?: number;
    /** Initial splitter position (px or %) */
    position?: number | string;
}
/**
 * Task field mapping for custom data structures
 */
export interface GanttTaskFieldMap {
    id?: keyof GanttTask;
    name?: keyof GanttTask;
    startDate?: keyof GanttTask;
    endDate?: keyof GanttTask;
    duration?: keyof GanttTask;
    dependency?: keyof GanttTask;
    progress?: keyof GanttTask;
    parentId?: keyof GanttTask;
    isSummary?: keyof GanttTask;
    child?: keyof GanttTask;
}
/**
 * Resource definition
 */
export interface GanttResource {
    id: string | number;
    name: string;
    color?: string;
    [key: string]: unknown;
}
/**
 * Working time configuration
 */
export interface GanttWorkingTime {
    from: string;
    to: string;
}
/**
 * Holiday configuration
 */
export interface GanttHoliday {
    from: string | Date;
    to?: string | Date;
    label?: string;
}
/**
 * Dependency types
 */
export type DependencyType = 'FS' | 'SS' | 'FF' | 'SF';
/**
 * Parsed dependency
 */
export interface ParsedDependency {
    taskId: string | number;
    type: DependencyType;
    lag?: number;
}
/**
 * Timeline view modes
 */
export type TimelineViewMode = 'Day' | 'Week' | 'Month' | 'Year';
/**
 * Selection mode
 */
export type GanttSelectionMode = 'Single' | 'Multiple' | 'None';
/**
 * Toolbar actions
 */
export type GanttToolbarAction = 'Add' | 'Edit' | 'Delete' | 'ZoomIn' | 'ZoomOut' | 'ZoomToFit' | 'Undo' | 'Redo' | 'ExpandAll' | 'CollapseAll';
/**
 * Props for Gantt component
 */
export interface GanttChartProps extends BaseComponentProps {
    /** Array of tasks */
    tasks: GanttTask[];
    /** Column definitions for tree grid */
    columns: GanttColumn[];
    /** Task field mapping */
    taskFields?: GanttTaskFieldMap;
    /** Label settings for taskbars */
    labelSettings?: GanttLabelSettings;
    /** Splitter configuration */
    splitterSettings?: GanttSplitterSettings;
    /** Project start date */
    projectStartDate?: string | Date;
    /** Project end date */
    projectEndDate?: string | Date;
    /** Component height */
    height?: number | string;
    /** Component width */
    width?: number | string;
    /** Row height */
    rowHeight?: number;
    /** Taskbar height */
    taskbarHeight?: number;
    /** Timeline view mode */
    timelineViewMode?: TimelineViewMode;
    /** Enable selection */
    allowSelection?: boolean;
    /** Selection mode */
    selectionMode?: GanttSelectionMode;
    /** Read-only mode */
    readOnly?: boolean;
    /** Show weekends */
    showWeekend?: boolean;
    /** Highlight weekends */
    highlightWeekends?: boolean;
    /** Show gridlines */
    showGridlines?: boolean;
    /** Show baseline bars */
    showBaseline?: boolean;
    /** Baseline start field */
    baselineStartField?: keyof GanttTask;
    /** Baseline end field */
    baselineEndField?: keyof GanttTask;
    /** Enable undo/redo */
    undoRedo?: boolean;
    /** Resource fields mapping */
    resourceFields?: {
        id?: string;
        name?: string;
        color?: string;
    };
    /** Resources array */
    resources?: GanttResource[];
    /** Working time configuration */
    workingTime?: GanttWorkingTime[];
    /** Holidays */
    holidays?: GanttHoliday[];
    /** Date formatter function */
    dateFormatter?: (date: Date) => string;
    /** Toolbar actions */
    toolbar?: GanttToolbarAction[];
    /** Called after component is created */
    onCreated?: () => void;
    /** Called after data is bound */
    onDataBound?: () => void;
    /** Called when task is selected */
    onTaskSelect?: (task: GanttTask) => void;
    /** Called when task is changed */
    onTaskChange?: (task: GanttTask) => void;
    /** Called when task is deleted */
    onTaskDelete?: (taskIds: Array<string | number>) => void;
    /** Called when task is added */
    onTaskAdd?: (task: GanttTask) => void;
    /** Called when splitter is resized */
    onSplitterResize?: (position: number) => void;
}
/**
 * Imperative handle for Gantt component
 */
export interface GanttHandle {
    /** Refresh the component */
    refresh: () => void;
    /** Expand all tasks */
    expandAll: () => void;
    /** Collapse all tasks */
    collapseAll: () => void;
    /** Zoom in */
    zoomIn: () => void;
    /** Zoom out */
    zoomOut: () => void;
    /** Zoom to fit */
    zoomToFit: () => void;
    /** Update a task */
    updateTask: (task: GanttTask) => void;
    /** Delete a task */
    deleteTask: (taskId: string | number) => void;
}
/**
 * Internal state for task tree
 */
export interface TaskTreeNode {
    task: GanttTask;
    level: number;
    expanded: boolean;
    children: TaskTreeNode[];
    parent?: TaskTreeNode;
}
/**
 * Timeline scale configuration
 */
export interface TimelineScale {
    majorUnit: 'Day' | 'Week' | 'Month' | 'Year';
    minorUnit: 'Hour' | 'Day' | 'Week' | 'Month';
    majorFormat: string;
    minorFormat: string;
    pixelsPerUnit: number;
}
//# sourceMappingURL=types.d.ts.map
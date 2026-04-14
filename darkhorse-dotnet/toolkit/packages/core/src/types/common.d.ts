import type { CSSProperties, ReactNode } from 'react';
/**
 * Base props that all React Toolkit components should support
 */
export interface BaseComponentProps {
    /** Unique identifier */
    id?: string;
    /** Additional CSS class name */
    className?: string;
    /** Inline styles */
    style?: CSSProperties;
    /** Error handler callback */
    onError?: (error: Error) => void;
    /** Test ID for testing */
    'data-testid'?: string;
}
/**
 * Component status types
 */
export type ComponentStatus = 'idle' | 'loading' | 'success' | 'error';
/**
 * Selection modes
 */
export type SelectionMode = 'none' | 'single' | 'multiple';
/**
 * Sort direction
 */
export type SortDirection = 'asc' | 'desc' | 'none';
/**
 * Generic event handler type
 */
export type EventHandler<T = void> = (event: T) => void;
/**
 * Generic data item with an ID
 */
export interface DataItem {
    id: string | number;
    [key: string]: unknown;
}
/**
 * Generic column definition
 */
export interface ColumnDef<T = DataItem> {
    /** Column identifier */
    field: keyof T | string;
    /** Column header text */
    headerText?: string;
    /** Column width */
    width?: number | string;
    /** Text alignment */
    textAlign?: 'left' | 'center' | 'right';
    /** Is column sortable */
    sortable?: boolean;
    /** Is column filterable */
    filterable?: boolean;
    /** Custom cell renderer */
    template?: (value: unknown, item: T) => ReactNode;
    /** Value accessor function */
    valueAccessor?: (item: T) => unknown;
}
/**
 * Generic filter descriptor
 */
export interface FilterDescriptor {
    field: string;
    operator: 'eq' | 'neq' | 'contains' | 'startswith' | 'endswith' | 'gt' | 'gte' | 'lt' | 'lte';
    value: unknown;
}
/**
 * Generic sort descriptor
 */
export interface SortDescriptor {
    field: string;
    dir: SortDirection;
}
/**
 * Render prop pattern
 */
export type RenderProp<T> = (item: T) => ReactNode;
/**
 * Size variants
 */
export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
/**
 * Theme mode
 */
export type ThemeMode = 'light' | 'dark' | 'auto';
//# sourceMappingURL=common.d.ts.map
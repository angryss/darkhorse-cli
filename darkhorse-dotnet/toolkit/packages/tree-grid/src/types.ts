/**
 * Tree Grid Component Types
 * @packageDocumentation
 */

import { ReactNode, CSSProperties } from 'react';

/**
 * Hierarchical data record with optional children
 */
export interface TreeGridRecord {
  /** Unique identifier for the record */
  id: string | number;
  /** Custom data fields */
  [key: string]: unknown;
  /** Nested child records */
  children?: TreeGridRecord[];
}

/**
 * Text alignment options for columns
 */
export type TreeGridAlign = 'Left' | 'Center' | 'Right';

/**
 * Cell template arguments
 */
export interface TreeGridCellTemplateArgs {
  /** Current record data */
  record: TreeGridRecord;
  /** Column definition */
  column: TreeGridColumn;
  /** Cell value */
  value: unknown;
  /** Row index in visible data */
  rowIndex: number;
  /** Column index */
  columnIndex: number;
}

/**
 * Filter types
 */
export type TreeGridFilterType = 'Menu' | 'Excel';

/**
 * Hierarchy filter mode
 */
export type TreeGridHierarchyFilterMode = 'Parent' | 'Child' | 'Both' | 'None';

/**
 * Filter item template arguments
 */
export interface TreeGridFilterItemTemplateArgs {
  /** Filter value */
  value: unknown;
  /** Column definition */
  column: TreeGridColumn;
}

/**
 * Column filter configuration
 */
export interface TreeGridColumnFilterConfig {
  /** Filter UI type */
  type?: TreeGridFilterType;
  /** Custom template for filter items */
  itemTemplate?: (args: TreeGridFilterItemTemplateArgs) => ReactNode;
}

/**
 * Column definition
 */
export interface TreeGridColumn {
  /** Data field name */
  field: string;
  /** Header text */
  headerText?: string;
  /** Column width (number in px or string with units) */
  width?: number | string;
  /** Text alignment */
  textAlign?: TreeGridAlign;
  /** Allow sorting this column */
  allowSorting?: boolean;
  /** Allow filtering this column */
  allowFiltering?: boolean;
  /** Custom cell template */
  template?: (args: TreeGridCellTemplateArgs) => ReactNode;
  /** Custom value accessor function */
  valueAccessor?: (field: string, data: TreeGridRecord) => unknown;
  /** Filter configuration */
  filterConfig?: TreeGridColumnFilterConfig;
}

/**
 * Global filter settings
 */
export interface TreeGridFilterSettings {
  /** Default filter type */
  type?: TreeGridFilterType;
  /** Hierarchy filter mode */
  hierarchyMode?: TreeGridHierarchyFilterMode;
}

/**
 * Selection mode
 */
export type TreeGridSelectionMode = 'Row' | 'Cell';

/**
 * Selection type
 */
export type TreeGridSelectionType = 'Single' | 'Multiple';

/**
 * Selection settings
 */
export interface TreeGridSelectionSettings {
  /** Selection mode */
  mode: TreeGridSelectionMode;
  /** Selection type */
  type: TreeGridSelectionType;
}

/**
 * Sort direction
 */
export type TreeGridSortDirection = 'asc' | 'desc';

/**
 * Toggle expand event arguments
 */
export interface TreeGridToggleExpandArgs {
  /** Record being expanded/collapsed */
  record: TreeGridRecord;
  /** New expanded state */
  expanded: boolean;
}

/**
 * Sort change event arguments
 */
export interface TreeGridSortChangeArgs {
  /** Column being sorted */
  column: TreeGridColumn;
  /** Sort direction (undefined = no sort) */
  direction?: TreeGridSortDirection;
}

/**
 * Filter change event arguments
 */
export interface TreeGridFilterChangeArgs {
  /** Column being filtered */
  column: TreeGridColumn;
  /** Filter state (format depends on filter type) */
  filterState: unknown;
}

/**
 * Column reorder event arguments
 */
export interface TreeGridColumnReorderEvent {
  /** Source column index */
  fromIndex: number;
  /** Target column index */
  toIndex: number;
  /** Column being moved */
  column: TreeGridColumn;
}

/**
 * Row click event arguments
 */
export interface TreeGridRowClickEvent {
  /** Record that was clicked */
  record: TreeGridRecord;
  /** Row index */
  rowIndex: number;
  /** Original DOM event */
  originalEvent?: React.MouseEvent;
}

/**
 * Selection change event arguments
 */
export interface TreeGridSelectionChangeEvent {
  /** Selected data (format depends on selection mode) */
  selection: unknown;
}

/**
 * Tree Grid component props
 */
export interface TreeGridProps {
  /** Hierarchical data array */
  data: TreeGridRecord[];
  /** Field name for child records */
  childField?: string;
  /** Column definitions */
  columns: TreeGridColumn[];
  /** Grid height */
  height?: number | string;
  /** Enable column reordering */
  allowReordering?: boolean;
  /** Enable filtering */
  allowFiltering?: boolean;
  /** Enable sorting */
  allowSorting?: boolean;
  /** Filter settings */
  filterSettings?: TreeGridFilterSettings;
  /** Enable selection */
  allowSelection?: boolean;
  /** Selection settings */
  selectionSettings?: TreeGridSelectionSettings;
  /** IDs of initially expanded rows */
  initiallyExpandedIds?: Array<string | number>;
  /** Expand/collapse event handler */
  onToggleExpand?: (args: TreeGridToggleExpandArgs) => void;
  /** Sort change event handler */
  onSortChange?: (args: TreeGridSortChangeArgs) => void;
  /** Filter change event handler */
  onFilterChange?: (args: TreeGridFilterChangeArgs) => void;
  /** Column reorder event handler */
  onColumnReorder?: (args: TreeGridColumnReorderEvent) => void;
  /** Row click event handler */
  onRowClick?: (args: TreeGridRowClickEvent) => void;
  /** Selection change event handler */
  onSelectionChange?: (args: TreeGridSelectionChangeEvent) => void;
  /** Error handler */
  onError?: (error: unknown) => void;
  /** Additional CSS class names */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
}


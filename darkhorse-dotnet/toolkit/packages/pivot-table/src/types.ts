/**
 * Pivot Table Component Types
 * @packageDocumentation
 */

import { CSSProperties } from 'react';

/**
 * Pivot record (flat data structure)
 */
export type PivotRecord = Record<string, unknown>;

/**
 * Aggregation types
 */
export type PivotAggregation = 'sum' | 'avg' | 'min' | 'max' | 'count' | 'distinctCount';

/**
 * Field definition
 */
export interface PivotField {
  /** Field name in data */
  field: string;
  /** Display caption */
  caption?: string;
}

/**
 * Value field with aggregation
 */
export interface PivotValueField extends PivotField {
  /** Aggregation function */
  aggregation: PivotAggregation;
  /** Number format */
  format?: string;
}

/**
 * Filter field
 */
export interface PivotFilterField extends PivotField {
  /** Filter type */
  filterType?: 'include' | 'exclude';
  /** Filter items */
  items?: (string | number)[];
}

/**
 * Pivot configuration
 */
export interface PivotConfig {
  /** Row fields */
  rows: PivotField[];
  /** Column fields */
  columns: PivotField[];
  /** Value fields with aggregations */
  values: PivotValueField[];
  /** Filter fields */
  filters?: PivotFilterField[];
  /** Expand all groups by default */
  expandAll?: boolean;
  /** Empty cell text */
  emptyCellsText?: string;
  /** Show headers for empty combinations */
  showHeaderWhenEmpty?: boolean;
}

/**
 * Pivot cell data
 */
export interface PivotCellData {
  /** Row path (hierarchy) */
  rowPath: string[];
  /** Column path (hierarchy) */
  columnPath: string[];
  /** Aggregated value */
  value: number | null;
  /** Formatted value */
  formattedValue: string;
  /** Number of records aggregated */
  count: number;
  /** Underlying records */
  records?: PivotRecord[];
}

/**
 * Export event args
 */
export interface PivotExportEvent {
  /** Export format */
  format: 'csv' | 'excel';
}

/**
 * Cell click event
 */
export interface PivotCellClickEvent {
  /** Row index */
  rowIndex: number;
  /** Column index */
  columnIndex: number;
  /** Cell data */
  cell: PivotCellData;
}

/**
 * Drill-through event
 */
export interface PivotDrillThroughEvent {
  /** Cell data */
  cell: PivotCellData;
  /** Underlying records */
  records: PivotRecord[];
}

/**
 * Pivot table props
 */
export interface PivotTableProps {
  /** Component ID */
  id?: string;
  /** Source data */
  data: PivotRecord[];
  /** Pivot configuration */
  config: PivotConfig;
  /** Table height */
  height?: number | string;
  /** Table width */
  width?: number | string;
  /** Show toolbar */
  showToolbar?: boolean;
  /** Allow Excel export */
  allowExcelExport?: boolean;
  /** Allow CSV export */
  allowCsvExport?: boolean;
  /** Config change handler */
  onConfigChange?: (config: PivotConfig) => void;
  /** Export handler */
  onExport?: (event: PivotExportEvent) => void;
  /** Cell click handler */
  onCellClick?: (event: PivotCellClickEvent) => void;
  /** Drill-through handler */
  onDrillThrough?: (event: PivotDrillThroughEvent) => void;
  /** Error handler */
  onError?: (error: unknown) => void;
  /** Additional CSS class */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
}

/**
 * Pivot matrix structure
 */
export interface PivotMatrix {
  /** Row headers (hierarchy) */
  rowHeaders: string[][];
  /** Column headers (hierarchy) */
  columnHeaders: string[][];
  /** Value cells */
  cells: PivotCellData[][];
  /** Grand totals row */
  grandTotalRow?: PivotCellData[];
  /** Grand totals column */
  grandTotalColumn?: PivotCellData[];
  /** Grand total cell */
  grandTotal?: PivotCellData;
}


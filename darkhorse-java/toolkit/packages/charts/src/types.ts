/**
 * Charts Component Types
 * @packageDocumentation
 */

import { ReactNode, CSSProperties } from 'react';

/**
 * Chart types supported
 */
export type ChartType = 'column' | 'splineArea' | 'pie';

/**
 * Series definition for charts with X/Y axes
 */
export interface ChartSeriesDefinition<T = any> {
  /** Series name for legend */
  name: string;
  /** Field name for X axis values */
  xField: keyof T | string;
  /** Field name for Y axis values */
  yField: keyof T | string;
  /** Series color (defaults to theme colors) */
  color?: string;
}

/**
 * Axis configuration
 */
export interface AxisConfig {
  /** Axis title */
  title?: string;
  /** Label format string */
  labelFormat?: string;
  /** Minimum value */
  min?: number;
  /** Maximum value */
  max?: number;
  /** Hide grid lines */
  hideGridLines?: boolean;
  /** Value type for parsing */
  valueType?: 'Category' | 'DateTime' | 'Numeric';
}

/**
 * Legend position
 */
export type LegendPosition = 'Top' | 'Bottom' | 'Left' | 'Right';

/**
 * Legend configuration
 */
export interface LegendConfig {
  /** Show legend */
  visible: boolean;
  /** Legend position */
  position?: LegendPosition;
  /** Enable series highlight on hover */
  enableHighlight?: boolean;
}

/**
 * Tooltip configuration
 */
export interface TooltipConfig {
  /** Show tooltip */
  visible: boolean;
  /** Custom tooltip template */
  template?: (point: any, series: ChartSeriesDefinition) => ReactNode | string;
  /** Show nearest point on hover */
  showNearest?: boolean;
}

/**
 * Column chart configuration
 */
export interface ColumnChartConfig<T = any> {
  /** Chart type */
  type: 'column';
  /** Data array */
  data: T[];
  /** Series definitions */
  series: ChartSeriesDefinition<T>[];
  /** X axis configuration */
  xAxis: AxisConfig;
  /** Y axis configuration */
  yAxis: AxisConfig;
  /** Legend configuration */
  legend?: LegendConfig;
  /** Tooltip configuration */
  tooltip?: TooltipConfig;
  /** Use gradient fill on columns */
  useGradientFill?: boolean;
  /** Chart title */
  title?: string;
}

/**
 * Spline area chart configuration
 */
export interface SplineAreaChartConfig<T = any> {
  /** Chart type */
  type: 'splineArea';
  /** Data array */
  data: T[];
  /** Series definitions */
  series: ChartSeriesDefinition<T>[];
  /** X axis configuration */
  xAxis: AxisConfig;
  /** Y axis configuration */
  yAxis: AxisConfig;
  /** Legend configuration */
  legend?: LegendConfig;
  /** Tooltip configuration */
  tooltip?: TooltipConfig;
  /** Area fill opacity (0-1) */
  areaOpacity?: number;
  /** Line stroke width */
  strokeWidth?: number;
  /** Show markers on data points */
  markerVisible?: boolean;
  /** Chart title */
  title?: string;
}

/**
 * Pie chart data slice
 */
export interface PieChartSlice {
  /** Slice name */
  name: string;
  /** Slice value */
  value: number;
  /** Slice color */
  color?: string;
  /** Custom tooltip text */
  tooltipText?: string;
}

/**
 * Pie chart configuration
 */
export interface PieChartConfig {
  /** Chart type */
  type: 'pie';
  /** Data slices */
  data: PieChartSlice[];
  /** Inner radius (0 = pie, >0 = donut) */
  innerRadius?: number;
  /** Legend configuration */
  legend?: LegendConfig;
  /** Tooltip configuration */
  tooltip?: TooltipConfig;
  /** Data label format */
  dataLabelFormat?: string;
  /** Chart title */
  title?: string;
}

/**
 * Chart configuration union type
 */
export type ChartConfig = ColumnChartConfig | SplineAreaChartConfig | PieChartConfig;

/**
 * Dashboard panel containing a chart
 */
export interface DashboardPanel {
  /** Unique panel ID */
  id: string;
  /** Panel title */
  title?: string;
  /** Chart configuration */
  chart: ChartConfig;
  /** Column span in grid */
  colSpan?: number;
  /** Row span in grid */
  rowSpan?: number;
}

/**
 * Responsive breakpoint configuration
 */
export interface ResponsiveBreakpoint {
  /** Breakpoint width in pixels */
  breakpoint: number;
  /** Number of columns at this breakpoint */
  columns: number;
}

/**
 * Dashboard grid layout settings
 */
export interface DashboardGridSettings {
  /** Base number of columns */
  columns: number;
  /** Row height in pixels */
  rowHeight?: number;
  /** Gap between panels in pixels */
  gap?: number;
  /** Responsive breakpoints */
  responsive?: ResponsiveBreakpoint[];
}

/**
 * Theme type
 */
export type ChartTheme = 'light' | 'dark' | string;

/**
 * Charts dashboard props
 */
export interface ChartsDashboardProps {
  /** Component ID */
  id?: string;
  /** Dashboard panels */
  panels: DashboardPanel[];
  /** Grid layout settings */
  grid?: DashboardGridSettings;
  /** Dashboard height */
  height?: number | string;
  /** Dashboard width */
  width?: number | string;
  /** Show panel borders */
  showPanelBorders?: boolean;
  /** Color theme */
  theme?: ChartTheme;
  /** Panel click handler */
  onPanelClick?: (panel: DashboardPanel) => void;
  /** Error handler */
  onError?: (error: unknown) => void;
  /** Additional CSS class names */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
}

/**
 * Chart component props
 */
export interface BaseChartProps {
  /** Chart configuration */
  config: ChartConfig;
  /** Chart width */
  width: number;
  /** Chart height */
  height: number;
  /** Color theme */
  theme?: ChartTheme;
  /** Error handler */
  onError?: (error: unknown) => void;
}


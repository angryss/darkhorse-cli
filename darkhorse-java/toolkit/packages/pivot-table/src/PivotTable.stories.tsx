/**
 * Pivot Table Component Stories
 */

import type { Meta, StoryObj } from '@storybook/react';
import { PivotTable } from './PivotTable';
import type { PivotConfig, PivotRecord } from './types';

const meta = {
  title: 'Data/PivotTable',
  component: PivotTable,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof PivotTable>;

export default meta;
type Story = StoryObj<typeof meta>;

// Sample data for stories
const salesData: PivotRecord[] = [
  { region: 'North', product: 'Widget', quarter: 'Q1', sales: 1000, units: 50, profit: 200 },
  { region: 'North', product: 'Widget', quarter: 'Q2', sales: 1200, units: 60, profit: 240 },
  { region: 'North', product: 'Gadget', quarter: 'Q1', sales: 1500, units: 75, profit: 300 },
  { region: 'North', product: 'Gadget', quarter: 'Q2', sales: 1800, units: 90, profit: 360 },
  { region: 'South', product: 'Widget', quarter: 'Q1', sales: 800, units: 40, profit: 160 },
  { region: 'South', product: 'Widget', quarter: 'Q2', sales: 900, units: 45, profit: 180 },
  { region: 'South', product: 'Gadget', quarter: 'Q1', sales: 1200, units: 60, profit: 240 },
  { region: 'South', product: 'Gadget', quarter: 'Q2', sales: 1400, units: 70, profit: 280 },
  { region: 'East', product: 'Widget', quarter: 'Q1', sales: 900, units: 45, profit: 180 },
  { region: 'East', product: 'Widget', quarter: 'Q2', sales: 1000, units: 50, profit: 200 },
  { region: 'East', product: 'Gadget', quarter: 'Q1', sales: 1100, units: 55, profit: 220 },
  { region: 'East', product: 'Gadget', quarter: 'Q2', sales: 1300, units: 65, profit: 260 },
  { region: 'West', product: 'Widget', quarter: 'Q1', sales: 950, units: 48, profit: 190 },
  { region: 'West', product: 'Widget', quarter: 'Q2', sales: 1100, units: 55, profit: 220 },
  { region: 'West', product: 'Gadget', quarter: 'Q1', sales: 1250, units: 63, profit: 250 },
  { region: 'West', product: 'Gadget', quarter: 'Q2', sales: 1500, units: 75, profit: 300 },
];

// Basic configuration
const basicConfig: PivotConfig = {
  rows: [{ field: 'region', caption: 'Region' }],
  columns: [{ field: 'product', caption: 'Product' }],
  values: [{ field: 'sales', aggregation: 'sum', caption: 'Total Sales' }],
};

/**
 * Basic pivot table showing sales by region and product
 */
export const Basic: Story = {
  args: {
    data: salesData,
    config: basicConfig,
    height: 500,
  },
};

/**
 * Pivot table with multiple aggregations
 */
export const MultipleAggregations: Story = {
  args: {
    data: salesData,
    config: {
      rows: [{ field: 'region', caption: 'Region' }],
      columns: [{ field: 'product', caption: 'Product' }],
      values: [
        { field: 'sales', aggregation: 'sum', caption: 'Total Sales' },
      ],
    },
    height: 500,
  },
};

/**
 * Pivot table with hierarchical rows
 */
export const HierarchicalRows: Story = {
  args: {
    data: salesData,
    config: {
      rows: [
        { field: 'region', caption: 'Region' },
        { field: 'product', caption: 'Product' },
      ],
      columns: [{ field: 'quarter', caption: 'Quarter' }],
      values: [{ field: 'sales', aggregation: 'sum', caption: 'Sales' }],
    },
    height: 600,
  },
};

/**
 * Pivot table showing average aggregation
 */
export const AverageAggregation: Story = {
  args: {
    data: salesData,
    config: {
      rows: [{ field: 'region' }],
      columns: [{ field: 'product' }],
      values: [{ field: 'sales', aggregation: 'avg', caption: 'Avg Sales' }],
    },
    height: 500,
  },
};

/**
 * Pivot table showing min/max aggregations
 */
export const MinMaxAggregation: Story = {
  args: {
    data: salesData,
    config: {
      rows: [{ field: 'region' }],
      columns: [{ field: 'quarter' }],
      values: [{ field: 'sales', aggregation: 'max', caption: 'Max Sales' }],
    },
    height: 500,
  },
};

/**
 * Pivot table with filters
 */
export const WithFilters: Story = {
  args: {
    data: salesData,
    config: {
      rows: [{ field: 'region' }],
      columns: [{ field: 'product' }],
      values: [{ field: 'sales', aggregation: 'sum' }],
      filters: [{ field: 'region', filterType: 'include', items: ['North', 'South'] }],
    },
    height: 500,
  },
};

/**
 * Pivot table with exclude filters
 */
export const WithExcludeFilters: Story = {
  args: {
    data: salesData,
    config: {
      rows: [{ field: 'region' }],
      columns: [{ field: 'product' }],
      values: [{ field: 'sales', aggregation: 'sum' }],
      filters: [{ field: 'region', filterType: 'exclude', items: ['East', 'West'] }],
    },
    height: 500,
  },
};

/**
 * Pivot table with export enabled
 */
export const WithExport: Story = {
  args: {
    data: salesData,
    config: basicConfig,
    allowCsvExport: true,
    allowExcelExport: true,
    onExport: (event) => {
      console.log('Exporting as:', event.format);
    },
    height: 500,
  },
};

/**
 * Pivot table with drill-through functionality
 */
export const WithDrillThrough: Story = {
  args: {
    data: salesData,
    config: basicConfig,
    onDrillThrough: (event) => {
      console.log('Drill-through records:', event.records);
    },
    height: 500,
  },
};

/**
 * Pivot table with cell click handler
 */
export const WithCellClick: Story = {
  args: {
    data: salesData,
    config: basicConfig,
    onCellClick: (event) => {
      console.log('Cell clicked:', {
        row: event.rowIndex,
        column: event.columnIndex,
        value: event.cell.value,
      });
    },
    height: 500,
  },
};

/**
 * Pivot table without toolbar
 */
export const NoToolbar: Story = {
  args: {
    data: salesData,
    config: basicConfig,
    showToolbar: false,
    height: 500,
  },
};

/**
 * Compact pivot table
 */
export const Compact: Story = {
  args: {
    data: salesData.slice(0, 4),
    config: {
      rows: [{ field: 'region' }],
      columns: [{ field: 'product' }],
      values: [{ field: 'sales', aggregation: 'sum' }],
    },
    height: 300,
    width: 600,
  },
};

/**
 * Large dataset pivot table
 */
export const LargeDataset: Story = {
  args: {
    data: Array.from({ length: 200 }, (_, i) => ({
      region: ['North', 'South', 'East', 'West'][i % 4],
      product: ['Widget', 'Gadget', 'Gizmo', 'Tool'][i % 4],
      quarter: ['Q1', 'Q2', 'Q3', 'Q4'][i % 4],
      sales: Math.floor(Math.random() * 2000) + 500,
      units: Math.floor(Math.random() * 100) + 20,
    })),
    config: {
      rows: [{ field: 'region' }],
      columns: [{ field: 'product' }],
      values: [{ field: 'sales', aggregation: 'sum' }],
    },
    height: 500,
  },
};

/**
 * Empty state
 */
export const Empty: Story = {
  args: {
    data: [],
    config: basicConfig,
    height: 400,
  },
};

/**
 * Count aggregation
 */
export const CountAggregation: Story = {
  args: {
    data: salesData,
    config: {
      rows: [{ field: 'region' }],
      columns: [{ field: 'product' }],
      values: [{ field: 'sales', aggregation: 'count', caption: 'Number of Records' }],
    },
    height: 500,
  },
};

/**
 * Distinct count aggregation
 */
export const DistinctCountAggregation: Story = {
  args: {
    data: salesData,
    config: {
      rows: [{ field: 'region' }],
      columns: [{ field: 'product' }],
      values: [{ field: 'quarter', aggregation: 'distinctCount', caption: 'Quarters' }],
    },
    height: 500,
  },
};

/**
 * Custom styling with className
 */
export const CustomStyling: Story = {
  args: {
    data: salesData,
    config: basicConfig,
    height: 500,
    className: 'custom-pivot-table',
    style: {
      border: '2px solid #3b82f6',
      borderRadius: '12px',
    },
  },
};


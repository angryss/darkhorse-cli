# @react-toolkit/pivot-table

Interactive pivot table component for multi-dimensional data analysis and aggregation.

## Features

- ✅ Multi-dimensional data aggregation
- ✅ Row and column grouping
- ✅ Multiple aggregation functions (sum, avg, min, max, count)
- ✅ Drill-down/expand-collapse functionality
- ✅ Grand totals and subtotals
- ✅ Export to CSV
- ✅ Conditional formatting support
- ✅ TypeScript support

## Installation

```bash
npm install @react-toolkit/pivot-table
```

## Basic Usage

```tsx
import { PivotTable, PivotConfig } from '@react-toolkit/pivot-table';

const data = [
  { region: 'North', product: 'Widget', sales: 1000, units: 50 },
  { region: 'North', product: 'Gadget', sales: 1500, units: 75 },
  { region: 'South', product: 'Widget', sales: 800, units: 40 },
  { region: 'South', product: 'Gadget', sales: 1200, units: 60 },
];

const config: PivotConfig = {
  rows: [{ field: 'region' }],
  columns: [{ field: 'product' }],
  values: [
    { field: 'sales', aggregation: 'sum', caption: 'Total Sales' },
    { field: 'units', aggregation: 'sum', caption: 'Total Units' },
  ],
};

function App() {
  return (
    <PivotTable
      data={data}
      config={config}
      height={600}
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `PivotRecord[]` | **required** | Source data array |
| `config` | `PivotConfig` | **required** | Pivot configuration |
| `height` | `number \| string` | `'auto'` | Table height |
| `width` | `number \| string` | `'100%'` | Table width |
| `showToolbar` | `boolean` | `true` | Show toolbar |
| `allowExcelExport` | `boolean` | `false` | Enable Excel export |
| `onConfigChange` | `(config) => void` | - | Config change handler |
| `onExport` | `(args) => void` | - | Export handler |

## Configuration

### Rows & Columns

```tsx
const config: PivotConfig = {
  rows: [
    { field: 'category', caption: 'Category' },
    { field: 'subcategory', caption: 'Subcategory' },
  ],
  columns: [
    { field: 'year', caption: 'Year' },
    { field: 'quarter', caption: 'Quarter' },
  ],
  values: [
    { field: 'revenue', aggregation: 'sum' },
  ],
};
```

### Aggregations

Supported aggregation functions:
- `sum` - Sum of values
- `avg` - Average of values
- `min` - Minimum value
- `max` - Maximum value
- `count` - Count of values
- `distinctCount` - Count of unique values

### Export

```tsx
<PivotTable
  data={data}
  config={config}
  allowExcelExport={true}
  onExport={({ format }) => {
    console.log(`Exporting as ${format}`);
  }}
/>
```

## Aggregation Examples

```tsx
// Sum and average
{
  values: [
    { field: 'revenue', aggregation: 'sum', caption: 'Total Revenue' },
    { field: 'revenue', aggregation: 'avg', caption: 'Avg Revenue' },
  ]
}

// Min and max
{
  values: [
    { field: 'price', aggregation: 'min', caption: 'Lowest Price' },
    { field: 'price', aggregation: 'max', caption: 'Highest Price' },
  ]
}

// Count
{
  values: [
    { field: 'orderId', aggregation: 'count', caption: 'Order Count' },
    { field: 'customerId', aggregation: 'distinctCount', caption: 'Unique Customers' },
  ]
}
```

## License

MIT


# @react-toolkit/charts

Multi-chart dashboard component with column, spline area, and pie/donut charts for data visualization.

## Features

- ✅ Column Chart - Vertical bars with multiple series support
- ✅ Spline Area Chart - Smooth lines with gradient fills
- ✅ Pie/Donut Chart - Circular visualizations with labels
- ✅ Responsive Dashboard Layout - CSS Grid with breakpoints
- ✅ Legend System - Toggle series visibility
- ✅ Tooltip System - Interactive hover information
- ✅ Theme Support - Light/dark mode integration
- ✅ TypeScript Support - Full type safety

## Installation

```bash
npm install @react-toolkit/charts
```

## Basic Usage

```tsx
import { ChartsDashboard, DashboardPanel } from '@react-toolkit/charts';

const panels: DashboardPanel[] = [
  {
    id: 'revenue',
    title: 'Monthly Revenue',
    chart: {
      type: 'column',
      data: [
        { month: 'Jan', revenue: 50000 },
        { month: 'Feb', revenue: 65000 },
        { month: 'Mar', revenue: 72000 },
      ],
      series: [{ name: 'Revenue', xField: 'month', yField: 'revenue' }],
      xAxis: { title: 'Month' },
      yAxis: { title: 'Revenue (USD)' },
    },
  },
  {
    id: 'users',
    title: 'User Growth',
    chart: {
      type: 'splineArea',
      data: [
        { date: 'Week 1', users: 1000 },
        { date: 'Week 2', users: 1500 },
        { date: 'Week 3', users: 2200 },
      ],
      series: [{ name: 'Users', xField: 'date', yField: 'users' }],
      xAxis: { title: 'Time' },
      yAxis: { title: 'Users' },
    },
  },
];

function App() {
  return (
    <ChartsDashboard
      panels={panels}
      grid={{ columns: 2, gap: 16 }}
      height={600}
    />
  );
}
```

## Chart Types

### Column Chart

```tsx
const columnChart: ColumnChartConfig = {
  type: 'column',
  data: salesData,
  series: [
    { name: 'Product A', xField: 'month', yField: 'productA', color: '#3b82f6' },
    { name: 'Product B', xField: 'month', yField: 'productB', color: '#10b981' },
  ],
  xAxis: { title: 'Month' },
  yAxis: { title: 'Sales' },
  legend: { visible: true, position: 'Top' },
  tooltip: { visible: true },
};
```

### Spline Area Chart

```tsx
const areaChart: SplineAreaChartConfig = {
  type: 'splineArea',
  data: timeSeriesData,
  series: [{ name: 'Metric', xField: 'date', yField: 'value' }],
  xAxis: { title: 'Date', valueType: 'DateTime' },
  yAxis: { title: 'Value' },
  areaOpacity: 0.3,
  strokeWidth: 2,
  markerVisible: true,
};
```

### Pie/Donut Chart

```tsx
const pieChart: PieChartConfig = {
  type: 'pie',
  data: [
    { name: 'Category A', value: 450, color: '#3b82f6' },
    { name: 'Category B', value: 320, color: '#10b981' },
    { name: 'Category C', value: 180, color: '#f59e0b' },
  ],
  innerRadius: 40, // 0 for pie, >0 for donut
  legend: { visible: true },
  dataLabelFormat: '{percentage}%',
};
```

## Dashboard Layout

```tsx
<ChartsDashboard
  panels={panels}
  grid={{
    columns: 3,
    rowHeight: 300,
    gap: 16,
    responsive: [
      { breakpoint: 768, columns: 1 },
      { breakpoint: 1024, columns: 2 },
    ],
  }}
/>
```

## Props

### ChartsDashboard

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `panels` | `DashboardPanel[]` | **required** | Array of chart panels |
| `grid` | `DashboardGridSettings` | - | Grid layout configuration |
| `height` | `number \| string` | `'auto'` | Dashboard height |
| `width` | `number \| string` | `'100%'` | Dashboard width |
| `showPanelBorders` | `boolean` | `true` | Show panel borders |
| `theme` | `'light' \| 'dark'` | `'light'` | Color theme |
| `onPanelClick` | `(panel) => void` | - | Panel click handler |
| `onError` | `(error) => void` | - | Error handler |

## Theme Integration

Charts automatically use design tokens for colors, spacing, and typography:

```tsx
// Automatically themed based on system preference
<ChartsDashboard panels={panels} theme="dark" />
```

## Performance

- Column Chart: Up to 50 categories × 3 series
- Spline Area: Up to 50 points × 3 series  
- Pie Chart: Up to 20 slices
- Smooth animations and transitions

## Accessibility

- ARIA labels for all charts
- Keyboard navigation support
- Screen reader compatible
- Semantic HTML structure

## License

MIT


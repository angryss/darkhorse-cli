# @react-toolkit/tree-map

Hierarchical treemap visualization component for displaying weighted data as nested rectangles.

## Features

- ✅ Squarified treemap algorithm for optimal aspect ratios
- ✅ Hierarchical data visualization
- ✅ Multiple color scales (continuous, discrete, by-group)
- ✅ Interactive tooltips and hover effects
- ✅ Drill-down navigation with breadcrumbs
- ✅ Responsive layout
- ✅ TypeScript support
- ✅ Zero dependencies

## Installation

```bash
npm install @react-toolkit/tree-map
```

## Basic Usage

```tsx
import { TreeMap } from '@react-toolkit/tree-map';

const data = [
  { id: 1, label: 'Category A', value: 100, parentId: null },
  { id: 2, label: 'Item 1', value: 60, parentId: 1 },
  { id: 3, label: 'Item 2', value: 40, parentId: 1 },
  { id: 4, label: 'Category B', value: 150, parentId: null },
  { id: 5, label: 'Item 3', value: 90, parentId: 4 },
  { id: 6, label: 'Item 4', value: 60, parentId: 4 },
];

function App() {
  return (
    <TreeMap
      data={data}
      height={600}
      width={800}
      onItemClick={(item) => console.log('Clicked:', item)}
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `TreeMapDataItem[]` | **required** | Hierarchical data array |
| `valuePath` | `string` | `'value'` | Field name for item values |
| `parentIdPath` | `string` | `'parentId'` | Field name for parent relationships |
| `height` | `number \| string` | `'auto'` | Chart height |
| `width` | `number \| string` | `'100%'` | Chart width |
| `colorScale` | `'continuous' \| 'discrete' \| 'byGroup'` | `'byGroup'` | Color scaling mode |
| `palette` | `string[]` | Design tokens | Color palette |
| `drillDown` | `boolean` | `true` | Enable drill-down navigation |
| `showBorder` | `boolean` | `true` | Show rectangle borders |
| `gap` | `number` | `2` | Spacing between rectangles |
| `onItemClick` | `(item) => void` | - | Click handler |
| `onItemHover` | `(item) => void` | - | Hover handler |

## Color Scales

### By Group

```tsx
<TreeMap
  data={data}
  colorScale="byGroup"
  palette={['#3b82f6', '#10b981', '#f59e0b', '#ef4444']}
/>
```

### Continuous

```tsx
<TreeMap
  data={data}
  colorScale="continuous"
  rangeColors={[
    { from: 0, to: 50, color: '#dbeafe' },
    { from: 50, to: 100, color: '#3b82f6' },
    { from: 100, to: 200, color: '#1e40af' },
  ]}
/>
```

### Discrete

```tsx
<TreeMap
  data={data}
  colorScale="discrete"
  rangeColors={[
    { from: 0, to: 50, color: '#ef4444', label: 'Low' },
    { from: 50, to: 100, color: '#f59e0b', label: 'Medium' },
    { from: 100, to: Infinity, color: '#10b981', label: 'High' },
  ]}
/>
```

## Drill-Down

```tsx
<TreeMap
  data={data}
  drillDown={true}
  onItemClick={(item) => {
    console.log('Drilling into:', item.label);
  }}
/>
```

## Tooltips

```tsx
<TreeMap
  data={data}
  tooltip={{
    visible: true,
    template: (item) => `${item.label}: ${item.value.toLocaleString()}`,
  }}
/>
```

## Data Format

```tsx
interface TreeMapDataItem {
  id: string | number;
  label: string;
  value: number;
  parentId?: string | number;
  group?: string;
  [key: string]: unknown;
}
```

## Examples

### Revenue by Category

```tsx
const revenueData = [
  { id: 'products', label: 'Products', value: 0, parentId: null },
  { id: 'services', label: 'Services', value: 0, parentId: null },
  { id: 'widget', label: 'Widgets', value: 150000, parentId: 'products' },
  { id: 'gadget', label: 'Gadgets', value: 120000, parentId: 'products' },
  { id: 'consulting', label: 'Consulting', value: 200000, parentId: 'services' },
  { id: 'support', label: 'Support', value: 80000, parentId: 'services' },
];

<TreeMap data={revenueData} height={500} />;
```

### File System Visualization

```tsx
const fileData = [
  { id: 'root', label: 'Root', value: 0, parentId: null },
  { id: 'docs', label: 'Documents', value: 2500, parentId: 'root' },
  { id: 'images', label: 'Images', value: 8500, parentId: 'root' },
  { id: 'videos', label: 'Videos', value: 15000, parentId: 'root' },
];

<TreeMap data={fileData} height={400} colorScale="continuous" />;
```

## License

MIT


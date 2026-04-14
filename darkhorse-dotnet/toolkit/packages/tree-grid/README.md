# @react-toolkit/tree-grid

Hierarchical data grid component with expand/collapse, sorting, filtering, and selection capabilities.

## Features

- ✅ Hierarchical data rendering with parent/child relationships
- ✅ Expand/collapse functionality
- ✅ Column configuration with custom templates
- ✅ Sorting (hierarchical-aware)
- ✅ Filtering with multiple modes
- ✅ Row and cell selection (single/multiple)
- ✅ Column reordering via drag & drop
- ✅ Keyboard navigation
- ✅ ARIA accessibility
- ✅ TypeScript support

## Installation

```bash
npm install @react-toolkit/tree-grid
```

## Basic Usage

```tsx
import { TreeGrid, TreeGridColumn, TreeGridRecord } from '@react-toolkit/tree-grid';

const data: TreeGridRecord[] = [
  {
    id: 1,
    name: 'Parent Item',
    value: 100,
    children: [
      { id: 2, name: 'Child Item', value: 50 }
    ]
  }
];

const columns: TreeGridColumn[] = [
  { field: 'name', headerText: 'Name', width: 200 },
  { field: 'value', headerText: 'Value', width: 100 }
];

function App() {
  return (
    <TreeGrid
      data={data}
      columns={columns}
      allowSorting={true}
      allowFiltering={true}
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `TreeGridRecord[]` | **required** | Hierarchical data array |
| `columns` | `TreeGridColumn[]` | **required** | Column definitions |
| `childField` | `string` | `'children'` | Field name for child records |
| `height` | `number \| string` | `'auto'` | Grid height |
| `allowSorting` | `boolean` | `false` | Enable column sorting |
| `allowFiltering` | `boolean` | `false` | Enable column filtering |
| `allowReordering` | `boolean` | `false` | Enable column reordering |
| `allowSelection` | `boolean` | `false` | Enable row/cell selection |
| `selectionSettings` | `TreeGridSelectionSettings` | - | Selection configuration |
| `filterSettings` | `TreeGridFilterSettings` | - | Filter configuration |
| `initiallyExpandedIds` | `Array<string \| number>` | `[]` | Initially expanded row IDs |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `onToggleExpand` | `TreeGridToggleExpandArgs` | Fired when row is expanded/collapsed |
| `onSortChange` | `TreeGridSortChangeArgs` | Fired when column sort changes |
| `onFilterChange` | `TreeGridFilterChangeArgs` | Fired when filter changes |
| `onColumnReorder` | `TreeGridColumnReorderEvent` | Fired when columns are reordered |
| `onRowClick` | `TreeGridRowClickEvent` | Fired when row is clicked |
| `onSelectionChange` | `TreeGridSelectionChangeEvent` | Fired when selection changes |
| `onError` | `unknown` | Fired when error occurs |

## Custom Templates

```tsx
const columns: TreeGridColumn[] = [
  {
    field: 'status',
    headerText: 'Status',
    template: ({ value }) => (
      <span className={`status-${value}`}>
        {value}
      </span>
    )
  }
];
```

## Accessibility

- ARIA treegrid role
- Keyboard navigation (arrows, Tab, Space, Enter)
- Screen reader support
- Focus management

## License

MIT


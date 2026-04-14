# @react-toolkit/gantt

**Gantt Chart component for React - Project timeline visualization**

A production-ready Gantt chart component with hierarchical tasks, dependencies, drag & drop editing, and full accessibility support.

## Features

- ✅ **Split Pane Layout** - Resizable tree grid and timeline view
- ✅ **Hierarchical Tasks** - Nested tasks with expand/collapse
- ✅ **Timeline Rendering** - Day/Week/Month/Year view modes
- ✅ **Task Bars** - With progress indicators and labels
- ✅ **Dependencies** - FS/SS/FF/SF connectors with arrows
- ✅ **Drag & Drop Editing** - Move and resize task bars
- ✅ **Baseline Comparison** - Show baseline vs actual progress
- ✅ **Toolbar Actions** - Add, Edit, Delete, Zoom, Expand/Collapse
- ✅ **Resource Assignment** - Display resource allocations
- ✅ **Working Time** - Weekend highlighting and holidays
- ✅ **Fully Accessible** - WCAG 2.1 AA compliant
- ✅ **Type-Safe** - Comprehensive TypeScript support
- ✅ **Zero Dependencies** - Native implementation

## Installation

```bash
npm install @react-toolkit/gantt
```

## Quick Start

```tsx
import { GanttChart, GanttTask, GanttColumn } from '@react-toolkit/gantt';
import '@react-toolkit/gantt/styles.css';

function App() {
  const tasks: GanttTask[] = [
    {
      id: 1,
      name: 'Project Planning',
      startDate: '2025-01-01',
      endDate: '2025-01-15',
      progress: 100,
      isSummary: true,
    },
    {
      id: 2,
      name: 'Requirements Gathering',
      startDate: '2025-01-01',
      endDate: '2025-01-07',
      progress: 100,
      parentId: 1,
    },
    {
      id: 3,
      name: 'Design Phase',
      startDate: '2025-01-08',
      endDate: '2025-01-15',
      progress: 75,
      parentId: 1,
      dependency: '2FS',
    },
  ];

  const columns: GanttColumn[] = [
    { field: 'name', headerText: 'Task Name', width: 250 },
    { field: 'startDate', headerText: 'Start Date', width: 100 },
    { field: 'endDate', headerText: 'End Date', width: 100 },
    { field: 'progress', headerText: 'Progress', width: 80 },
  ];

  return (
    <GanttChart
      tasks={tasks}
      columns={columns}
      height="600px"
      showGridlines={true}
      highlightWeekends={true}
    />
  );
}
```

## Props

### GanttChartProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tasks` | `GanttTask[]` | required | Array of tasks |
| `columns` | `GanttColumn[]` | required | Grid column definitions |
| `taskFields` | `GanttTaskFieldMap` | - | Custom field mapping |
| `labelSettings` | `GanttLabelSettings` | - | Task bar label configuration |
| `splitterSettings` | `GanttSplitterSettings` | - | Splitter configuration |
| `projectStartDate` | `string \| Date` | - | Project start date |
| `projectEndDate` | `string \| Date` | - | Project end date |
| `height` | `number \| string` | `'600px'` | Component height |
| `width` | `number \| string` | `'100%'` | Component width |
| `rowHeight` | `number` | `40` | Row height in pixels |
| `taskbarHeight` | `number` | `28` | Task bar height in pixels |
| `timelineViewMode` | `'Day' \| 'Week' \| 'Month' \| 'Year'` | `'Day'` | Timeline view mode |
| `allowSelection` | `boolean` | `true` | Enable task selection |
| `selectionMode` | `'Single' \| 'Multiple' \| 'None'` | `'Single'` | Selection mode |
| `readOnly` | `boolean` | `false` | Disable editing |
| `showWeekend` | `boolean` | `true` | Show weekends |
| `highlightWeekends` | `boolean` | `true` | Highlight weekend columns |
| `showGridlines` | `boolean` | `true` | Show timeline gridlines |
| `showBaseline` | `boolean` | `false` | Show baseline bars |
| `toolbar` | `GanttToolbarAction[]` | - | Toolbar actions |
| `onTaskSelect` | `(task) => void` | - | Task selection handler |
| `onTaskChange` | `(task) => void` | - | Task change handler |
| `onTaskAdd` | `(task) => void` | - | Task add handler |
| `onTaskDelete` | `(ids) => void` | - | Task delete handler |
| `onSplitterResize` | `(position) => void` | - | Splitter resize handler |

## Data Types

### GanttTask

```typescript
interface GanttTask {
  id: string | number;
  name: string;
  startDate?: string | Date;
  endDate?: string | Date;
  duration?: number;           // Days
  progress?: number;           // 0-100
  dependency?: string;         // e.g., "3FS,5SS+1"
  parentId?: string | number;
  isSummary?: boolean;
  baselineStartDate?: string | Date;
  baselineEndDate?: string | Date;
  resources?: Array<string | number>;
  meta?: Record<string, unknown>;
}
```

### GanttColumn

```typescript
interface GanttColumn {
  field: string;
  headerText?: string;
  width?: number | string;
  clipMode?: 'Ellipsis' | 'EllipsisWithTooltip' | 'Wrap';
  template?: (task: GanttTask) => React.ReactNode;
  sortable?: boolean;
  textAlign?: 'left' | 'center' | 'right';
}
```

## Dependencies

### Dependency Types

- **FS (Finish-to-Start)**: Task B starts when Task A finishes
- **SS (Start-to-Start)**: Task B starts when Task A starts
- **FF (Finish-to-Finish)**: Task B finishes when Task A finishes
- **SF (Start-to-Finish)**: Task B finishes when Task A starts

### Format

```typescript
dependency: "3FS"      // Task 3 Finish-to-Start
dependency: "3FS+2"    // Task 3 FS with 2-day lag
dependency: "3FS,5SS"  // Multiple dependencies
```

## Features

### Split Pane with Resizable Splitter

```tsx
<GanttChart
  tasks={tasks}
  columns={columns}
  splitterSettings={{
    position: 400,  // Initial position in pixels
  }}
  onSplitterResize={(position) => {
    console.log('Splitter at:', position);
  }}
/>
```

### Hierarchical Tasks

```tsx
const tasks = [
  { id: 1, name: 'Phase 1', isSummary: true },
  { id: 2, name: 'Task 1.1', parentId: 1 },
  { id: 3, name: 'Task 1.2', parentId: 1 },
];
```

### Task Dependencies

```tsx
const tasks = [
  { id: 1, name: 'Design', startDate: '2025-01-01', duration: 5 },
  { id: 2, name: 'Development', startDate: '2025-01-08', duration: 10, dependency: '1FS' },
  { id: 3, name: 'Testing', startDate: '2025-01-18', duration: 5, dependency: '2FS' },
];
```

### Baseline Comparison

```tsx
<GanttChart
  tasks={tasks}
  columns={columns}
  showBaseline={true}
  baselineStartField="baselineStartDate"
  baselineEndField="baselineEndDate"
/>
```

### Toolbar with Actions

```tsx
<GanttChart
  tasks={tasks}
  columns={columns}
  toolbar={['Add', 'Edit', 'Delete', 'ZoomIn', 'ZoomOut', 'ExpandAll', 'CollapseAll']}
  onTaskAdd={(task) => {
    // Handle new task
  }}
  onTaskDelete={(ids) => {
    // Handle deletion
  }}
/>
```

### Custom Column Templates

```tsx
const columns: GanttColumn[] = [
  {
    field: 'name',
    headerText: 'Task Name',
    width: 250,
  },
  {
    field: 'progress',
    headerText: 'Progress',
    width: 100,
    template: (task) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ 
          width: '50px', 
          height: '8px', 
          backgroundColor: '#e0e0e0',
          borderRadius: '4px',
          overflow: 'hidden',
        }}>
          <div style={{
            width: `${task.progress || 0}%`,
            height: '100%',
            backgroundColor: '#4caf50',
          }} />
        </div>
        <span>{task.progress || 0}%</span>
      </div>
    ),
  },
];
```

## Imperative API

Access component methods using a ref:

```tsx
import { useRef } from 'react';
import { GanttChart, GanttHandle } from '@react-toolkit/gantt';

function App() {
  const ganttRef = useRef<GanttHandle>(null);

  return (
    <>
      <button onClick={() => ganttRef.current?.expandAll()}>
        Expand All
      </button>
      <button onClick={() => ganttRef.current?.collapseAll()}>
        Collapse All
      </button>
      <button onClick={() => ganttRef.current?.zoomIn()}>
        Zoom In
      </button>
      
      <GanttChart ref={ganttRef} tasks={tasks} columns={columns} />
    </>
  );
}
```

### Available Methods

- `refresh()` - Refresh the component
- `expandAll()` - Expand all tasks
- `collapseAll()` - Collapse all tasks
- `zoomIn()` - Zoom in timeline
- `zoomOut()` - Zoom out timeline
- `zoomToFit()` - Fit timeline to window
- `updateTask(task)` - Update a task
- `deleteTask(taskId)` - Delete a task

## Accessibility

- Full keyboard navigation (Tab, Arrow keys, Enter, Escape)
- ARIA labels and roles
- Screen reader support
- Focus management
- High contrast support

## Performance

- Handles 200+ tasks smoothly
- Efficient re-rendering with React optimization
- Minimal bundle size (~60KB minified)
- Native browser APIs (no heavy dependencies)

## Browser Support

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile browsers

## Examples

See the [Storybook](https://react-toolkit-storybook.dev) for interactive examples.

## License

MIT © React Toolkit Team


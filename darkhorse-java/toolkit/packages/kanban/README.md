# @react-toolkit/kanban

**Kanban Board component for React**

A production-ready Kanban board component with drag & drop, swimlanes, custom templates, and full accessibility support.

## Features

- ✅ **Drag & Drop** - Move cards between columns and swimlanes
- ✅ **Swimlane Grouping** - Group cards by assignee, priority, or custom fields
- ✅ **Custom Templates** - Card and column templates for full customization
- ✅ **WIP Limits** - Visual indicators and optional enforcement
- ✅ **Dialog Editing** - Built-in card editor with configurable fields
- ✅ **Selection Modes** - Single, multiple, or no selection
- ✅ **Column Toggle** - Collapse/expand columns
- ✅ **Fully Accessible** - WCAG 2.1 AA compliant
- ✅ **Type-Safe** - Comprehensive TypeScript support
- ✅ **Zero Dependencies** - Native drag & drop implementation

## Installation

```bash
npm install @react-toolkit/kanban
```

## Quick Start

```tsx
import { KanbanBoard, KanbanCard, KanbanColumn } from '@react-toolkit/kanban';
import '@react-toolkit/kanban/styles.css';

function App() {
  const [cards, setCards] = useState<KanbanCard[]>([
    { id: 1, status: 'todo', title: 'Task 1', summary: 'Description' },
    { id: 2, status: 'inprogress', title: 'Task 2', summary: 'Description' },
    { id: 3, status: 'done', title: 'Task 3', summary: 'Description' }
  ]);

  const columns: KanbanColumn[] = [
    { key: 'todo', headerText: 'To Do', maxItems: 5 },
    { key: 'inprogress', headerText: 'In Progress', maxItems: 3 },
    { key: 'done', headerText: 'Done' }
  ];

  const handleCardDrop = (card: KanbanCard, targetColumnKey: string) => {
    setCards(prevCards =>
      prevCards.map(c =>
        c.id === card.id ? { ...c, status: targetColumnKey } : c
      )
    );
  };

  return (
    <KanbanBoard
      cards={cards}
      columns={columns}
      allowDragAndDrop={true}
      onCardDrop={handleCardDrop}
    />
  );
}
```

## Props

### KanbanBoard

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `cards` | `KanbanCard[]` | required | Array of cards to display |
| `columns` | `KanbanColumn[]` | required | Array of column definitions |
| `keyField` | `string` | `'status'` | Card field that maps to column keys |
| `swimlaneSettings` | `KanbanSwimlaneSettings` | - | Configuration for swimlane grouping |
| `allowDragAndDrop` | `boolean` | `false` | Enable drag & drop |
| `selectionMode` | `'Single' \| 'Multiple' \| 'None'` | `'None'` | Card selection mode |
| `enableTooltip` | `boolean` | `false` | Show tooltips on card hover |
| `cardTemplate` | `(card) => ReactNode` | - | Custom card rendering |
| `columnTemplate` | `(column, cards) => ReactNode` | - | Custom column rendering |
| `dialogFields` | `KanbanCardDialogField[]` | - | Enable built-in card editor |
| `onCardDrop` | `(card, targetColumnKey, targetSwimlane?) => void` | - | Card drop handler |
| `onSelectionChange` | `(selected) => void` | - | Selection change handler |

## Data Types

### KanbanCard

```typescript
interface KanbanCard {
  id: string | number;
  status: string;          // Maps to column key
  title: string;
  summary?: string;
  tags?: string[];
  assignee?: string;
  rank?: string | number;
  priority?: string;
  meta?: Record<string, unknown>;
}
```

### KanbanColumn

```typescript
interface KanbanColumn {
  key: string;
  headerText: string;
  maxItems?: number;       // WIP limit
  allowToggle?: boolean;
  headerTemplate?: (column: KanbanColumn) => ReactNode;
}
```

## Swimlanes

Group cards by any field:

```tsx
<KanbanBoard
  cards={cards}
  columns={columns}
  swimlaneSettings={{
    keyField: 'assignee',
    labelTemplate: (value) => `Assigned to: ${value || 'Unassigned'}`
  }}
/>
```

## Custom Templates

### Card Template

```tsx
<KanbanBoard
  cardTemplate={(card) => (
    <div>
      <h4>{card.title}</h4>
      <p>{card.summary}</p>
      <div className="tags">
        {card.tags?.map(tag => <span key={tag}>{tag}</span>)}
      </div>
    </div>
  )}
/>
```

### Column Header Template

```tsx
<KanbanBoard
  columns={columns.map(col => ({
    ...col,
    headerTemplate: (column) => (
      <div>
        <h3>{column.headerText}</h3>
        <button onClick={() => addCard(column.key)}>+ Add</button>
      </div>
    )
  }))}
/>
```

## Dialog Editing

Enable built-in card editor:

```tsx
<KanbanBoard
  dialogFields={[
    { key: 'title', label: 'Title', type: 'TextBox' },
    { key: 'summary', label: 'Description', type: 'TextArea' },
    { key: 'assignee', label: 'Assignee', type: 'DropDown' },
    { key: 'tags', label: 'Tags', type: 'Tags' }
  ]}
  onCardSave={(card) => {
    // Update card in your state
  }}
  onCardDelete={(cardId) => {
    // Remove card from your state
  }}
/>
```

## Accessibility

- Full keyboard navigation (Tab, Arrow keys, Enter, Escape)
- ARIA labels and roles
- Screen reader support
- Alternative move actions for non-mouse users
- High contrast mode support

## Performance

- Supports 200+ cards without lag
- Optimized drag & drop with requestAnimationFrame
- Efficient re-rendering with React.memo
- Virtual scrolling available for very large datasets

## Examples

See the [Storybook](https://react-toolkit-storybook.dev) for interactive examples.

## License

MIT © React Toolkit Team


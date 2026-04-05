# Timeline Component

A flexible, accessible Timeline component for visualizing ordered events and milestones. Perfect for order tracking, workflow visualization, history logs, and process overviews.

## Features

- ✅ **Vertical and Horizontal Layouts** - Choose the orientation that fits your design
- ✅ **Alternate Alignment** - Stagger items for visual interest
- ✅ **Multiple Variants** - Simple or detailed display modes
- ✅ **Status Indicators** - Visual markers for completed, in-progress, pending, error, and warning states
- ✅ **Custom Templates** - Full control over item rendering
- ✅ **Keyboard Navigation** - Complete keyboard support with arrow keys
- ✅ **Fully Accessible** - WCAG 2.1 AA compliant with ARIA support
- ✅ **Design Token Integration** - Themeable with consistent styling
- ✅ **Zero Dependencies** - Lightweight and self-contained
- ✅ **TypeScript** - Comprehensive type definitions

## Installation

```bash
npm install @react-toolkit/timeline
```

## Quick Start

```tsx
import { Timeline } from '@react-toolkit/timeline';

const items = [
  {
    id: '1',
    label: 'Order Placed',
    timestamp: 'Jan 1, 2025',
    status: 'completed',
    description: 'Your order has been received and is being processed.'
  },
  {
    id: '2',
    label: 'Processing',
    timestamp: 'Jan 2, 2025',
    status: 'inProgress',
    description: 'We are preparing your items for shipment.',
    isActive: true
  },
  {
    id: '3',
    label: 'Shipped',
    status: 'pending',
    description: 'Your order will be shipped soon.'
  },
  {
    id: '4',
    label: 'Delivered',
    status: 'pending'
  }
];

function OrderTracking() {
  return (
    <Timeline
      items={items}
      orientation="vertical"
      variant="detailed"
      title="Order Status"
    />
  );
}
```

## Props

### Timeline Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `TimelineItem[]` | **required** | Array of timeline items to display |
| `orientation` | `'vertical' \| 'horizontal'` | `'vertical'` | Timeline layout direction |
| `alignment` | `'start' \| 'alternate'` | `'start'` | Item alignment (alternate staggers items) |
| `variant` | `'simple' \| 'detailed'` | `'simple'` | Visual complexity level |
| `title` | `string` | - | Optional title for the timeline |
| `showConnector` | `boolean` | `true` | Show connecting line between items |
| `showDots` | `boolean` | `true` | Show marker dots for items |
| `showTimestamps` | `boolean` | `true` | Show timestamps on items |
| `renderItem` | `(item, index) => ReactNode` | - | Custom render function for items |
| `onItemClick` | `(item, index) => void` | - | Callback when item is clicked |
| `onItemFocus` | `(item, index) => void` | - | Callback when item receives focus |
| `className` | `string` | - | Additional CSS class |
| `style` | `CSSProperties` | - | Inline styles |
| `onError` | `(error) => void` | - | Error handler |

### TimelineItem Interface

```typescript
interface TimelineItem {
  id: string;                    // Unique identifier
  label: string;                 // Main text
  description?: string;          // Optional description (shown in detailed variant)
  timestamp?: string;            // Optional timestamp
  status?: TimelineItemStatus;   // Visual status indicator
  icon?: ReactNode;              // Optional icon for marker
  content?: ReactNode;           // Optional custom content
  isActive?: boolean;            // Highlight as current/active
  meta?: Record<string, unknown>; // Additional metadata
}
```

### Status Types

```typescript
type TimelineItemStatus = 
  | 'completed'   // Green - task completed
  | 'inProgress'  // Blue with pulse - currently active
  | 'pending'     // Gray - not started yet
  | 'error'       // Red - error occurred
  | 'warning'     // Yellow - warning state
  | 'custom';     // Custom styling
```

## Examples

### Basic Vertical Timeline

```tsx
<Timeline
  items={[
    { id: '1', label: 'Step 1', status: 'completed' },
    { id: '2', label: 'Step 2', status: 'completed' },
    { id: '3', label: 'Step 3', status: 'inProgress', isActive: true },
    { id: '4', label: 'Step 4', status: 'pending' },
  ]}
/>
```

### Horizontal Timeline

```tsx
<Timeline
  items={items}
  orientation="horizontal"
  variant="simple"
/>
```

### Alternate Alignment (Staggered)

```tsx
<Timeline
  items={items}
  orientation="vertical"
  alignment="alternate"
  variant="detailed"
/>
```

### With Timestamps

```tsx
<Timeline
  items={[
    {
      id: '1',
      label: 'Created',
      timestamp: '2025-01-01 10:00 AM',
      status: 'completed'
    },
    {
      id: '2',
      label: 'Updated',
      timestamp: '2025-01-02 2:30 PM',
      status: 'completed'
    },
    {
      id: '3',
      label: 'Published',
      timestamp: '2025-01-03 9:15 AM',
      status: 'inProgress',
      isActive: true
    },
  ]}
  showTimestamps={true}
/>
```

### With Icons

```tsx
<Timeline
  items={[
    {
      id: '1',
      label: 'Order Placed',
      status: 'completed',
      icon: '📦'
    },
    {
      id: '2',
      label: 'Processing',
      status: 'inProgress',
      icon: '⚙️',
      isActive: true
    },
    {
      id: '3',
      label: 'Shipped',
      status: 'pending',
      icon: '🚚'
    },
    {
      id: '4',
      label: 'Delivered',
      status: 'pending',
      icon: '✅'
    },
  ]}
/>
```

### With Custom Content

```tsx
<Timeline
  items={[
    {
      id: '1',
      label: 'Release v1.0',
      timestamp: 'Jan 1, 2025',
      status: 'completed',
      content: (
        <div>
          <p>Initial release with core features</p>
          <ul>
            <li>Feature A</li>
            <li>Feature B</li>
          </ul>
        </div>
      )
    },
    {
      id: '2',
      label: 'Release v2.0',
      timestamp: 'Feb 1, 2025',
      status: 'inProgress',
      isActive: true,
      content: <p>Major update in progress</p>
    },
  ]}
  variant="detailed"
/>
```

### Custom Item Renderer

```tsx
<Timeline
  items={items}
  renderItem={(item, index) => (
    <div className="custom-item">
      <h3>{item.label}</h3>
      <p>{item.description}</p>
      <button>View Details</button>
    </div>
  )}
/>
```

### With Click Handler

```tsx
<Timeline
  items={items}
  onItemClick={(item, index) => {
    console.log('Clicked:', item.label);
    // Navigate, open modal, etc.
  }}
/>
```

### Minimal Timeline (No Connectors)

```tsx
<Timeline
  items={items}
  showConnector={false}
  variant="simple"
/>
```

### Error and Warning States

```tsx
<Timeline
  items={[
    { id: '1', label: 'Task 1', status: 'completed' },
    { id: '2', label: 'Task 2', status: 'completed' },
    { id: '3', label: 'Task 3', status: 'error', description: 'Failed to complete' },
    { id: '4', label: 'Task 4', status: 'warning', description: 'Needs attention' },
    { id: '5', label: 'Task 5', status: 'pending' },
  ]}
  variant="detailed"
/>
```

## Accessibility

The Timeline component is fully accessible and follows WCAG 2.1 AA guidelines:

### Keyboard Navigation

- **Tab**: Focus on timeline items
- **Arrow Up/Down**: Navigate vertical timelines
- **Arrow Left/Right**: Navigate horizontal timelines
- **Home**: Jump to first item
- **End**: Jump to last item
- **Enter/Space**: Activate/click item

### Screen Readers

- Semantic HTML structure with `<ul>` and `<li>` elements
- ARIA roles and labels for proper announcement
- `aria-current="step"` for active items
- Status conveyed through icons and labels, not just color

### Visual Accessibility

- High contrast mode support
- Focus indicators on all interactive elements
- Status differences use icons + colors
- Respects `prefers-reduced-motion`

## Styling

The component uses CSS Modules with design tokens for consistent theming.

### Design Tokens Used

```css
/* Colors */
--color-primary-500, --color-primary-100
--color-success-500
--color-error-500
--color-warning-500
--color-gray-300, --color-gray-200, --color-gray-50
--color-text-primary, --color-text-secondary
--color-background

/* Spacing */
--spacing-1 through --spacing-8

/* Typography */
--font-size-sm, --font-size-base, --font-size-lg
--font-weight-medium, --font-weight-semibold
--line-height-relaxed

/* Borders */
--border-radius-md

/* Shadows */
--shadow-sm

/* Transitions */
--transition-base
```

### Custom Styling

```tsx
// Add custom class
<Timeline
  items={items}
  className="my-custom-timeline"
/>

// Inline styles
<Timeline
  items={items}
  style={{ maxWidth: '600px', margin: '0 auto' }}
/>
```

## TypeScript

The component is fully typed with comprehensive TypeScript definitions:

```typescript
import { Timeline, TimelineProps, TimelineItem } from '@react-toolkit/timeline';

const items: TimelineItem[] = [
  { id: '1', label: 'Event 1', status: 'completed' },
];

const MyComponent: React.FC = () => {
  const handleClick = (item: TimelineItem, index: number) => {
    console.log(item, index);
  };

  return <Timeline items={items} onItemClick={handleClick} />;
};
```

## Best Practices

### Order Tracking

```tsx
const orderSteps = [
  { id: '1', label: 'Order Placed', timestamp: '10:00 AM', status: 'completed' },
  { id: '2', label: 'Payment Confirmed', timestamp: '10:05 AM', status: 'completed' },
  { id: '3', label: 'Preparing', timestamp: '10:30 AM', status: 'inProgress', isActive: true },
  { id: '4', label: 'Out for Delivery', status: 'pending' },
  { id: '5', label: 'Delivered', status: 'pending' },
];

<Timeline items={orderSteps} variant="detailed" title="Track Your Order" />
```

### Workflow/Approval Process

```tsx
const approvalSteps = [
  { id: '1', label: 'Submitted', status: 'completed', timestamp: 'Jan 1' },
  { id: '2', label: 'Manager Review', status: 'completed', timestamp: 'Jan 2' },
  { id: '3', label: 'Finance Approval', status: 'inProgress', isActive: true },
  { id: '4', label: 'Final Approval', status: 'pending' },
  { id: '5', label: 'Processed', status: 'pending' },
];

<Timeline items={approvalSteps} alignment="alternate" />
```

### Activity History

```tsx
const activityLog = [
  { id: '1', label: 'Document Created', timestamp: '2 days ago', status: 'completed' },
  { id: '2', label: 'Edited by John', timestamp: '1 day ago', status: 'completed' },
  { id: '3', label: 'Commented by Sarah', timestamp: '5 hours ago', status: 'completed' },
  { id: '4', label: 'Shared with team', timestamp: '1 hour ago', status: 'completed', isActive: true },
];

<Timeline items={activityLog} orientation="vertical" variant="simple" />
```

### Release Timeline

```tsx
const releases = [
  { id: '1', label: 'v1.0.0', timestamp: 'Q1 2025', status: 'completed', icon: '🚀' },
  { id: '2', label: 'v2.0.0', timestamp: 'Q2 2025', status: 'inProgress', icon: '🔨', isActive: true },
  { id: '3', label: 'v3.0.0', timestamp: 'Q3 2025', status: 'pending', icon: '📋' },
];

<Timeline items={releases} orientation="horizontal" variant="detailed" />
```

## Performance

- Efficiently renders up to 100+ items
- Lightweight bundle size (~15KB minified)
- Zero external dependencies
- Optimized re-rendering
- Responsive to container size

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

MIT

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for contribution guidelines.

---

**Built with ❤️ by the React Toolkit team**


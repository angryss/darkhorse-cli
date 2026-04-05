# @react-toolkit/core

Core utilities and types for React Toolkit components. Provides shared functionality used across all components.

## Installation

```bash
pnpm add @react-toolkit/core
```

## Features

### Common Types

- `BaseComponentProps` - Base props all components support
- `ComponentStatus` - Component status types
- `SelectionMode` - Selection mode types
- `SortDirection` - Sort direction types
- `ColumnDef` - Generic column definition
- `FilterDescriptor` - Filter descriptors
- `SortDescriptor` - Sort descriptors

### Utilities

#### Class Name Utility

```typescript
import { cn } from '@react-toolkit/core';

const className = cn('base-class', isActive && 'active', 'additional-class');
```

#### DOM Utilities

```typescript
import { isElementInViewport, scrollIntoView, getScrollParent } from '@react-toolkit/core';

// Check if element is visible
if (isElementInViewport(element)) {
  // Element is visible
}

// Scroll element into view
scrollIntoView(element);

// Get scroll parent
const scrollParent = getScrollParent(element);
```

#### Keyboard Utilities

```typescript
import { KeyCode, hasModifier, isNavigationKey } from '@react-toolkit/core';

// Use keyboard constants
if (event.key === KeyCode.Enter) {
  // Handle enter key
}

// Check for modifiers
if (hasModifier(event)) {
  // Ctrl, Alt, Shift, or Meta key is pressed
}

// Check navigation keys
if (isNavigationKey(event)) {
  // Arrow keys, Home, End, PageUp, PageDown
}
```

## TypeScript Support

All utilities and types are fully typed for excellent IDE support.

## License

MIT


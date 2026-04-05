# Toolkit — React Component Library

> READ-ONLY reference for available UI components.

## Available Packages

| Category | Package | Purpose |
|----------|---------|---------|
| Foundation | `@react-toolkit/core` | Shared utilities & types |
| Foundation | `@react-toolkit/design-tokens` | Colors, spacing, typography |
| Planning | `@react-toolkit/kanban` | Card-based workflow boards |
| Planning | `@react-toolkit/gantt` | Project timelines with dependencies |
| Planning | `@react-toolkit/timeline` | Event visualization |
| Scheduling | `@react-toolkit/scheduler` | Multi-view calendar |
| Data | `@react-toolkit/tree-grid` | Hierarchical data tables |
| Data | `@react-toolkit/charts` | Column, spline, pie charts |
| Data | `@react-toolkit/pivot-table` | Multi-dimensional aggregation |
| Data | `@react-toolkit/tree-map` | Space-filling visualization |
| Content | `@react-toolkit/rich-text-editor` | WYSIWYG with mentions |
| Content | `@react-toolkit/image-editor` | Crop, filters, annotations |
| AI | `@react-toolkit/chat-ui` | Message display UI |
| AI | `@react-toolkit/ai-assist` | Contextual suggestions |

## Usage

```tsx
import { KanbanBoard } from '@react-toolkit/kanban';
import { Scheduler } from '@react-toolkit/scheduler';
import { tokens } from '@react-toolkit/design-tokens';
```

## Rules

- Toolkit packages are **FROZEN** — zero modifications allowed
- Install as npm dependencies
- Check toolkit components **before** building custom UI
- Use design tokens for consistent theming

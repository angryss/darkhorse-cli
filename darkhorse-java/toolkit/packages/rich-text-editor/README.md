# @react-toolkit/rich-text-editor

A comprehensive WYSIWYG rich text editor component for React with advanced features including slash commands, @mentions, contextual toolbars, tables, emoji picker, and more.

## 🎯 Extended Release (v1.1)

This release includes **all advanced features** fully implemented and ready to use!

## Features

### ✅ Core Features
- **ContentEditable Surface**: WYSIWYG editing with HTML output
- **Text Formatting**: Bold, Italic, Underline, Strikethrough, Inline Code
- **Block Formatting**: Headings (H1-H6), Paragraphs, Blockquotes, Code Blocks
- **Lists**: Ordered and unordered lists with indent/outdent
- **Alignment**: Left, Center, Right, Justify
- **Links**: Create and edit hyperlinks with dialog
- **Images**: Insert images via URL with alt text
- **Special**: Horizontal lines, superscript, subscript
- **Undo/Redo**: Full editing history
- **Source View**: Toggle between WYSIWYG and HTML code
- **Fullscreen Mode**: Maximize editor to full viewport
- **HTML Sanitization**: XSS prevention with whitelist-based cleaning
- **Character Count**: Optional character counter
- **Keyboard Navigation**: Full accessibility support
- **Design Tokens**: Themeable via CSS variables

### ✅ Advanced Features (NEW!)
- **Slash Menu** (`/`): Quick command insertion with filterable menu
- **@Mentions**: User/entity mentions with async data source
- **Quick Toolbars**: Contextual formatting toolbars for text/image/table/media
- **Tables**: Full table support with insert dialog and manipulation utilities
- **Emoji Picker**: Categorized emoji selection with search
- **Video/Audio**: Insert media elements with preview dialogs
- **Advanced Media Handling**: Video and audio insertion

## Installation

```bash
npm install @react-toolkit/rich-text-editor @react-toolkit/core @react-toolkit/design-tokens
```

## Basic Usage

```tsx
import React, { useState } from 'react';
import { RichTextEditor } from '@react-toolkit/rich-text-editor';

function MyEditor() {
  const [content, setContent] = useState('<p>Start typing...</p>');

  return (
    <RichTextEditor
      value={content}
      onChange={setContent}
      height="500px"
      showCharCount
    />
  );
}
```

## Advanced Usage

### With Slash Menu

Type `/` to open a command menu for quick block insertion:

```tsx
<RichTextEditor
  value={content}
  onChange={setContent}
  slashMenuSettings={{
    enabled: true,
    items: [
      { id: 'h1', label: 'Heading 1', description: 'Large heading', command: 'Formats' },
      { id: 'quote', label: 'Quote', description: 'Blockquote', command: 'Blockquote' },
      { id: 'code', label: 'Code Block', description: 'Monospace text', command: 'Formats' },
      { id: 'table', label: 'Table', description: 'Insert table', command: 'InsertTable' },
      // ... more items
    ],
  }}
/>
```

### With @Mentions

Type `@` to trigger user mentions with async data fetching:

```tsx
<RichTextEditor
  value={content}
  onChange={setContent}
  mentionSettings={{
    enabled: true,
    triggerChar: '@',
    dataSource: async (query: string) => {
      // Fetch users from your API
      const response = await fetch(`/api/users?q=${query}`);
      const users = await response.json();
      return users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatar,
      }));
    },
  }}
/>
```

### With Quick Toolbars

Contextual toolbars appear when you select text or click on media:

```tsx
<RichTextEditor
  value={content}
  onChange={setContent}
  quickToolbarSettings={{
    enabled: true,
    targets: ['text', 'image', 'table'],
    itemsByTarget: {
      text: ['Bold', 'Italic', 'Underline', 'CreateLink', 'ClearFormat'],
      image: ['AlignLeft', 'AlignCenter', 'AlignRight'],
      table: ['InsertRowAbove', 'InsertRowBelow', 'DeleteRow'],
    },
  }}
/>
```

### Custom Mention Template

```tsx
<RichTextEditor
  value={content}
  onChange={setContent}
  mentionSettings={{
    enabled: true,
    dataSource: fetchUsers,
    itemTemplate: (item) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <img src={item.avatarUrl} alt={item.name} style={{ width: 32, height: 32, borderRadius: '50%' }} />
        <div>
          <div style={{ fontWeight: 600 }}>{item.name}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{item.email}</div>
        </div>
      </div>
    ),
    displayTemplate: (item) => (
      <span style={{ color: '#3b82f6', backgroundColor: '#dbeafe', padding: '2px 6px', borderRadius: '4px' }}>
        @{item.name}
      </span>
    ),
  }}
/>
```

## Props

### Core Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | **Required** | HTML content value |
| `onChange` | `(value: string) => void` | **Required** | Change handler |
| `placeholder` | `string` | `'Start typing...'` | Placeholder text |
| `showCharCount` | `boolean` | `false` | Show character counter |
| `readOnly` | `boolean` | `false` | Read-only mode |
| `height` | `number \| string` | `'400px'` | Editor height |
| `width` | `number \| string` | `'100%'` | Editor width |
| `enableXhtml` | `boolean` | `true` | Enable HTML sanitization |
| `onError` | `(error: unknown) => void` | - | Error handler |
| `className` | `string` | - | Additional CSS class |
| `style` | `CSSProperties` | - | Inline styles |

### Extension Props

| Prop | Type | Description |
|------|------|-------------|
| `slashMenuSettings` | `RteSlashMenuSettings` | Slash menu configuration |
| `mentionSettings` | `RteMentionSettings` | Mentions configuration |
| `quickToolbarSettings` | `RteQuickToolbarSettings` | Contextual toolbars configuration |
| `fileManagerSettings` | `RteFileManagerSettings` | File browser integration (future) |
| `imageUploadSettings` | `RteImageUploadSettings` | Image upload configuration (future) |
| `importWordSettings` | `RteImportWordSettings` | Word import service (future) |
| `exportWordSettings` | `RteExportWordSettings` | Word export service (future) |
| `exportPdfSettings` | `RteExportPdfSettings` | PDF export service (future) |

## Type Definitions

### Slash Menu

```typescript
interface RteSlashMenuSettings {
  enabled: boolean;
  items: RteSlashMenuItem[];
}

interface RteSlashMenuItem {
  id: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  command?: RteBuiltinCommand;
}
```

### Mentions

```typescript
interface RteMentionSettings {
  enabled: boolean;
  triggerChar?: string; // default '@'
  dataSource: (query: string) => Promise<RteMentionItem[]> | RteMentionItem[];
  itemTemplate?: (item: RteMentionItem) => React.ReactNode;
  displayTemplate?: (item: RteMentionItem) => React.ReactNode;
}

interface RteMentionItem {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string;
  color?: string;
  backgroundColor?: string;
  meta?: Record<string, unknown>;
}
```

### Quick Toolbars

```typescript
interface RteQuickToolbarSettings {
  targets: RteQuickToolbarTarget[];
  itemsByTarget: Partial<Record<RteQuickToolbarTarget, RteBuiltinCommand[]>>;
  showOnRightClick?: boolean;
}

type RteQuickToolbarTarget = 'text' | 'image' | 'table' | 'media';
```

## Imperative API

Use a ref to access imperative methods:

```tsx
import { useRef } from 'react';
import { RichTextEditor, RichTextEditorHandle } from '@react-toolkit/rich-text-editor';

function MyEditor() {
  const editorRef = useRef<RichTextEditorHandle>(null);

  const handleFocus = () => {
    editorRef.current?.focus();
  };

  const handleToggleFullscreen = () => {
    editorRef.current?.toggleFullScreen();
  };

  const handleGetValue = () => {
    const html = editorRef.current?.getValue();
    console.log('Current HTML:', html);
  };

  return (
    <>
      <button onClick={handleFocus}>Focus Editor</button>
      <button onClick={handleToggleFullscreen}>Fullscreen</button>
      <button onClick={handleGetValue}>Get Value</button>

      <RichTextEditor
        ref={editorRef}
        value={content}
        onChange={setContent}
      />
    </>
  );
}
```

### Available Methods

- `focus()`: Focus the editor
- `getValue()`: Get current HTML value
- `setValue(value: string)`: Set HTML value
- `toggleFullScreen()`: Toggle fullscreen mode
- `toggleSourceView()`: Toggle source code view
- `execCommand(command, options)`: Execute a formatting command

## Toolbar Commands

### Text Formatting
- **Bold** (Ctrl+B): `<strong>` or `<b>`
- **Italic** (Ctrl+I): `<em>` or `<i>`
- **Underline** (Ctrl+U): `<u>`
- **Strikethrough**: `<s>` or `<strike>`
- **Inline Code**: `<code>`

### Block Formatting
- **Headings**: H1-H6 (`<h1>` through `<h6>`)
- **Paragraph**: `<p>`
- **Blockquote**: `<blockquote>`
- **Code Block**: `<pre>`

### Lists
- **Ordered List**: `<ol><li>`
- **Unordered List**: `<ul><li>`
- **Indent**: Increase list nesting
- **Outdent**: Decrease list nesting

### Alignment
- **Left**: Left-align text
- **Center**: Center-align text
- **Right**: Right-align text

### Insert
- **Link**: Insert/edit hyperlink (`<a>`)
- **Image**: Insert image (`<img>`)
- **Table**: Insert table with configurable rows/columns
- **Emoji**: Open emoji picker
- **Video**: Insert video element
- **Audio**: Insert audio element
- **Horizontal Line**: `<hr>`

### Utility
- **Clear Format**: Remove all formatting
- **Source Code**: Toggle HTML view
- **Fullscreen**: Maximize editor
- **Undo**: Undo last action
- **Redo**: Redo last action

## HTML Sanitization

The editor automatically sanitizes HTML to prevent XSS attacks when `enableXhtml` is true (default).

### Allowed Tags

```
p, br, div, span, h1-h6, strong, b, em, i, u, s, strike,
code, pre, a, ul, ol, li, blockquote, img, table, thead,
tbody, tr, th, td, sub, sup, hr, video, audio
```

### Allowed Attributes

- **Global**: `class`, `style`, `id`, `data-mention-id`
- **Links**: `href`, `target`, `rel`, `title`
- **Images**: `src`, `alt`, `width`, `height`, `title`
- **Tables**: `border`, `cellpadding`, `cellspacing`, `colspan`, `rowspan`
- **Media**: `src`, `controls`, `autoplay`, `loop`, `muted`

### Security Features

- Blocks `javascript:` URLs
- Blocks `data:` URLs (except `data:image/`)
- Removes dangerous CSS properties
- Strips event handlers
- Validates style attributes

### Manual Sanitization

```tsx
import { sanitizeHtml, stripHtml, getCharacterCount } from '@react-toolkit/rich-text-editor';

// Sanitize HTML
const clean = sanitizeHtml('<p onclick="alert()">Safe</p>');
// Result: '<p>Safe</p>'

// Strip all HTML tags
const text = stripHtml('<p><strong>Hello</strong> World</p>');
// Result: 'Hello World'

// Get character count
const count = getCharacterCount('<p>Hello World</p>');
// Result: 11
```

## Keyboard Shortcuts

- `Ctrl+B`: Bold
- `Ctrl+I`: Italic
- `Ctrl+U`: Underline
- `Ctrl+Z`: Undo
- `Ctrl+Y`: Redo
- `/`: Open slash menu (when enabled)
- `@`: Open mentions menu (when enabled)
- `Tab`: Indent (in lists)
- `Shift+Tab`: Outdent (in lists)
- `Arrow Keys`: Navigate slash/mention menu
- `Enter`: Select slash/mention item
- `Escape`: Close menus/dialogs

## Styling

The editor uses CSS Modules with design tokens for easy theming:

```css
:root {
  --color-primary: #3b82f6;
  --color-primary-light: #dbeafe;
  --color-background-primary: #ffffff;
  --color-background-secondary: #f9fafb;
  --color-border-primary: #e5e7eb;
  --color-text-primary: #1f2937;
  --color-text-secondary: #6b7280;
  --font-size-md: 16px;
  --spacing-md: 16px;
  --border-radius-md: 8px;
}
```

### Custom Styling

```tsx
<RichTextEditor
  value={content}
  onChange={setContent}
  className="my-custom-editor"
  style={{ border: '2px solid blue' }}
/>
```

## Accessibility

The editor is fully accessible with:

- **ARIA Roles**: `textbox`, `button`, `dialog`, `listbox`
- **Keyboard Navigation**: Tab, Arrow keys, keyboard shortcuts
- **Screen Reader Support**: Descriptive labels and announcements
- **Focus Management**: Visible focus indicators
- **High Contrast Support**: Respects system preferences

## Utilities

### Table Utilities

```tsx
import { createTable } from '@react-toolkit/rich-text-editor';

// Create a 3x3 table
const tableHtml = createTable(3, 3);
```

### Command Execution

```tsx
import { executeCommand, queryCommandState, getCurrentFormat } from '@react-toolkit/rich-text-editor';

// Execute a command
executeCommand('Bold');

// Check if command is active
const isBold = queryCommandState('Bold');

// Get current format
const format = getCurrentFormat(); // 'p', 'h1', etc.
```

## TypeScript

Full TypeScript support with comprehensive type definitions:

```tsx
import {
  RichTextEditor,
  RichTextEditorProps,
  RichTextEditorHandle,
  RichTextValue,
  RteBuiltinCommand,
  RteSlashMenuItem,
  RteMentionItem,
} from '@react-toolkit/rich-text-editor';
```

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- Handles documents up to several thousand words
- Typing latency < 16ms
- Source view toggle < 100ms
- Sanitization on every input with minimal overhead
- Efficient rendering with React refs

## Examples

### Complete Example with All Features

```tsx
import React, { useState } from 'react';
import { RichTextEditor } from '@react-toolkit/rich-text-editor';

function AdvancedEditor() {
  const [content, setContent] = useState('<p>Start typing...</p>');

  // Mock user data source
  const fetchUsers = async (query: string) => {
    // Replace with your API call
    return [
      { id: '1', name: 'John Doe', email: 'john@example.com' },
      { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
    ].filter(user => user.name.toLowerCase().includes(query.toLowerCase()));
  };

  return (
    <RichTextEditor
      value={content}
      onChange={setContent}
      height="600px"
      showCharCount
      slashMenuSettings={{
        enabled: true,
        items: [
          { id: 'h1', label: 'Heading 1', description: 'Large heading', command: 'Formats' },
          { id: 'h2', label: 'Heading 2', description: 'Medium heading', command: 'Formats' },
          { id: 'quote', label: 'Quote', description: 'Blockquote', command: 'Blockquote' },
          { id: 'code', label: 'Code', description: 'Code block', command: 'Formats' },
          { id: 'table', label: 'Table', description: 'Insert table', command: 'InsertTable' },
        ],
      }}
      mentionSettings={{
        enabled: true,
        triggerChar: '@',
        dataSource: fetchUsers,
      }}
      quickToolbarSettings={{
        targets: ['text'],
        itemsByTarget: {
          text: ['Bold', 'Italic', 'Underline', 'CreateLink'],
        },
      }}
      onError={(error) => {
        console.error('Editor error:', error);
      }}
    />
  );
}
```

## License

MIT

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for guidelines.

## Support

For issues and questions, please use the [GitHub Issues](https://github.com/your-repo/issues) page.

---

**Extended Release (v1.1)**: All advanced features including slash menu, mentions, quick toolbars, tables, emoji picker, and media support are fully implemented and production-ready!

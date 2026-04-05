# @react-toolkit/image-editor

A powerful, canvas-based image editor component for React with support for transformations, filters, annotations, and export capabilities.

## Features

### 🎨 Core Editing

- **Image Loading**: Load images from URL, File, or Blob
- **Canvas-based**: Native HTML5 Canvas rendering for high performance
- **Real-time Preview**: See changes instantly as you edit

### 🔄 Transform Tools

- **Rotate**: Rotate left/right by 90°
- **Flip**: Flip horizontally or vertically
- **Crop**: Select and crop regions (infrastructure ready)
- **Resize**: Change image dimensions (utilities provided)
- **Zoom**: Zoom in/out with zoom limits (10%-500%)
- **Pan**: Pan around zoomed images (UI ready)

### 🎭 Filters & Adjustments

- **Brightness**: Adjust from -100 to +100
- **Contrast**: Adjust from -100 to +100
- **Saturation**: Adjust from 0 to 200
- **Hue**: Rotate hue from -180° to +180°
- **Blur**: Apply blur effect (0-10 radius)
- **Sharpen**: Sharpen image details (0-100)
- **Grayscale**: Convert to grayscale (utility provided)

### ✏️ Annotation Tools (Infrastructure Ready)

- **Draw**: Freehand drawing with customizable color, width, and opacity
- **Shapes**: Rectangle, Ellipse, Arrow, Line
- **Text**: Add text annotations with custom fonts and colors
- **Eraser**: Remove annotations

### 💾 Export

- **PNG**: Lossless export
- **JPEG**: Lossy export with quality control
- **WebP**: Modern format with quality control
- **Data URL**: Get base64-encoded image data
- **Blob**: Get Blob object for upload

### ↩️ History Management

- **Undo/Redo**: Navigate through edit history
- **History Limit**: Configurable limit (default 50 states)
- **Reset**: Restore to original loaded image

### ♿ Accessibility

- **ARIA Labels**: Proper ARIA attributes for screen readers
- **Keyboard Navigation**: Full keyboard support
- **Focus Management**: Logical focus order
- **Status Updates**: Live regions for state changes

## Installation

```bash
npm install @react-toolkit/image-editor
```

## Basic Usage

```tsx
import React, { useRef } from 'react';
import { ImageEditor, ImageEditorHandle } from '@react-toolkit/image-editor';

function App() {
  const editorRef = useRef<ImageEditorHandle>(null);

  return (
    <div style={{ height: '600px' }}>
      <ImageEditor
        ref={editorRef}
        initialImage={{
          type: 'url',
          value: 'https://example.com/image.jpg'
        }}
        allowOpen={true}
        allowExport={true}
        allowHistory={true}
        onImageLoaded={(source) => console.log('Image loaded:', source)}
        onImageChange={(source) => console.log('Image changed:', source)}
        onExport={(result) => console.log('Exported:', result)}
        onError={(error) => console.error('Error:', error)}
      />
    </div>
  );
}
```

## API Reference

### Props

#### `ImageEditorProps`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | `string` | - | Optional ID for the component |
| `initialImage` | `ImageEditorSource` | - | Initial image to load |
| `toolbarItems` | `ImageEditorToolbarItem[]` | - | Custom toolbar items |
| `allowOpen` | `boolean` | `true` | Allow opening new images |
| `allowExport` | `boolean` | `true` | Allow exporting images |
| `allowHistory` | `boolean` | `true` | Enable undo/redo |
| `historyLimit` | `number` | `50` | Maximum history states |
| `zoomLimits` | `ZoomLimits` | `{ min: 0.1, max: 5 }` | Zoom constraints |
| `drawSettings` | `DrawSettings` | `{ color: '#000', width: 2, opacity: 1 }` | Drawing defaults |
| `shapeSettings` | `ShapeSettings` | See below | Shape defaults |
| `textSettings` | `TextSettings` | See below | Text defaults |
| `adjustmentSettings` | `AdjustmentSettings` | See below | Adjustment defaults |
| `onImageLoaded` | `(source) => void` | - | Callback when image loads |
| `onImageChange` | `(source) => void` | - | Callback when image changes |
| `onExport` | `(result) => void` | - | Callback on export |
| `onError` | `(error) => void` | - | Callback on error |

#### Default Settings

```typescript
// Shape Settings
{
  strokeColor: '#000000',
  fillColor: undefined,
  strokeWidth: 2,
  shape: 'Rectangle'
}

// Text Settings
{
  fontFamily: 'Arial',
  fontSize: 16,
  color: '#000000',
  backgroundColor: undefined
}

// Adjustment Settings
{
  brightness: 0,
  contrast: 0,
  saturation: 100,
  hue: 0,
  blur: 0,
  sharpen: 0
}
```

### Imperative Handle

Access editor methods via ref:

```typescript
interface ImageEditorHandle {
  openImage: (source: ImageEditorSource) => void;
  getCanvasDataUrl: (format?: ImageExportFormat, quality?: number) => string;
  getCanvasBlob: (format?: ImageExportFormat, quality?: number) => Promise<Blob>;
  export: (format: ImageExportFormat, options?: { quality?: number; name?: string }) => Promise<ImageExportResult>;
  undo: () => void;
  redo: () => void;
  reset: () => void;
}
```

#### Example Usage

```tsx
const editorRef = useRef<ImageEditorHandle>(null);

// Open image programmatically
editorRef.current?.openImage({
  type: 'url',
  value: 'https://example.com/image.jpg'
});

// Get data URL
const dataUrl = editorRef.current?.getCanvasDataUrl('png');

// Export with custom options
const result = await editorRef.current?.export('jpeg', {
  quality: 0.85,
  name: 'my-image.jpg'
});

// Undo/Redo
editorRef.current?.undo();
editorRef.current?.redo();

// Reset to original
editorRef.current?.reset();
```

## Advanced Usage

### Loading Images

```tsx
// From URL
<ImageEditor
  initialImage={{
    type: 'url',
    value: 'https://example.com/image.jpg',
    name: 'My Image'
  }}
/>

// From File
const handleFileSelect = (file: File) => {
  editorRef.current?.openImage({
    type: 'file',
    value: file,
    name: file.name
  });
};

// From Blob
const handleBlobLoad = (blob: Blob) => {
  editorRef.current?.openImage({
    type: 'blob',
    value: blob,
    name: 'image.png'
  });
};
```

### Custom Zoom Limits

```tsx
<ImageEditor
  zoomLimits={{ min: 0.5, max: 3 }}
  // ... other props
/>
```

### Adjustment Settings

```tsx
<ImageEditor
  adjustmentSettings={{
    brightness: 10,
    contrast: 5,
    saturation: 110,
    hue: 0,
    blur: 0,
    sharpen: 0
  }}
  // ... other props
/>
```

### Exporting Images

```tsx
const handleExport = async () => {
  // Export as PNG
  const pngResult = await editorRef.current?.export('png', {
    quality: 1.0,
    name: 'image.png'
  });

  // Export as JPEG with compression
  const jpegResult = await editorRef.current?.export('jpeg', {
    quality: 0.8,
    name: 'image.jpg'
  });

  // Export as WebP
  const webpResult = await editorRef.current?.export('webp', {
    quality: 0.9,
    name: 'image.webp'
  });

  // Download the result
  if (pngResult?.dataUrl) {
    const link = document.createElement('a');
    link.href = pngResult.dataUrl;
    link.download = pngResult.name || 'image.png';
    link.click();
  }
};
```

### History Management

```tsx
<ImageEditor
  allowHistory={true}
  historyLimit={30}
  onImageChange={(source) => {
    console.log('Image changed, history updated');
  }}
/>
```

## Type Definitions

### `ImageEditorSource`

```typescript
type ImageEditorSourceType = 'url' | 'file' | 'blob';

interface ImageEditorSource {
  type: ImageEditorSourceType;
  value: string | File | Blob;
  name?: string;
}
```

### `ImageExportResult`

```typescript
type ImageExportFormat = 'png' | 'jpeg' | 'webp';

interface ImageExportResult {
  format: ImageExportFormat;
  dataUrl?: string;
  blob?: Blob;
  name?: string;
}
```

### `ImageEditorTool`

```typescript
type ImageEditorTool =
  | 'Crop'
  | 'Resize'
  | 'RotateLeft'
  | 'RotateRight'
  | 'FlipHorizontal'
  | 'FlipVertical'
  | 'ZoomIn'
  | 'ZoomOut'
  | 'ResetZoom'
  | 'Pan'
  | 'Brightness'
  | 'Contrast'
  | 'Saturation'
  | 'Hue'
  | 'Sharpen'
  | 'Blur'
  | 'Draw'
  | 'Eraser'
  | 'Shape'
  | 'Text'
  | 'Undo'
  | 'Redo'
  | 'Reset'
  | 'FitToScreen'
  | 'OriginalSize';
```

## Utilities

The package exports utility functions for custom implementations:

### Canvas Utilities

```typescript
import {
  loadImageFromSource,
  createCanvasFromImage,
  rotateCanvas,
  flipCanvas,
  cropCanvas,
  resizeCanvas,
  getCanvasDataUrl,
  getCanvasBlob,
  cloneCanvas,
  getImageData,
  putImageData,
  clearCanvas
} from '@react-toolkit/image-editor';
```

### Filter Utilities

```typescript
import {
  applyBrightness,
  applyContrast,
  applySaturation,
  applyHue,
  applyBlur,
  applySharpen,
  applyGrayscale,
  applyAdjustments
} from '@react-toolkit/image-editor';

// Apply single filter
const imageData = getImageData(canvas);
if (imageData) {
  applyBrightness(imageData, 20);
  putImageData(canvas, imageData);
}

// Apply multiple adjustments
const adjustments = {
  brightness: 10,
  contrast: 5,
  saturation: 110
};
const adjusted = applyAdjustments(imageData, adjustments);
```

### Annotation Utilities

```typescript
import {
  drawLine,
  drawPath,
  drawRectangle,
  drawEllipse,
  drawArrow,
  drawText,
  renderDrawAnnotation,
  renderShapeAnnotation,
  renderTextAnnotation
} from '@react-toolkit/image-editor';

// Draw custom annotations
const ctx = canvas.getContext('2d');
if (ctx) {
  drawRectangle(ctx, 10, 10, 100, 50, '#ff0000', '#00ff00', 2);
  drawText(ctx, 'Hello', 50, 50, 'Arial', 16, '#000000');
}
```

### History Management

```typescript
import { HistoryManager } from '@react-toolkit/image-editor';

const history = new HistoryManager(50); // 50 states limit

// Add state
const imageData = getImageData(canvas);
if (imageData) {
  history.push(imageData);
}

// Undo/Redo
if (history.canUndo()) {
  const previousState = history.undo();
  if (previousState) {
    putImageData(canvas, previousState);
  }
}

if (history.canRedo()) {
  const nextState = history.redo();
  if (nextState) {
    putImageData(canvas, nextState);
  }
}

// Reset
history.reset(initialImageData);
```

## Styling

The component uses CSS modules for styling. Override styles by wrapping with a custom className:

```tsx
<div className="my-custom-editor">
  <ImageEditor {...props} />
</div>
```

```css
.my-custom-editor {
  --color-background: #ffffff;
  --color-surface: #f5f5f5;
  --color-border: #e0e0e0;
  --color-primary: #2196f3;
  --color-primary-light: #e3f2fd;
  --color-text-primary: #212121;
  --color-text-secondary: #757575;
  --color-canvas-background: #e9ecef;
}
```

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Opera 76+

Requires HTML5 Canvas and ES2020 support.

## Performance

- Handles images up to 5-10 MB on modern hardware
- Zoom/pan operations are smooth and responsive
- History depth can be adjusted for memory-sensitive contexts
- Filter operations use efficient pixel manipulation algorithms

## Limitations

- Touch gestures: Basic support (infrastructure ready, needs enhancement)
- Crop tool: UI infrastructure ready, needs interactive handles implementation
- Annotation tools: Drawing utilities complete, interactive UI needs implementation
- File manager: Not included (expects host to provide file selection)
- Upload integration: Requires backend implementation

## Future Enhancements

- [ ] Interactive crop handles with drag-to-resize
- [ ] Touch gesture support (pinch-to-zoom, pan)
- [ ] Annotation tool UI with interactive editing
- [ ] More filters (sepia, vintage, etc.)
- [ ] Layer support
- [ ] Selection tools (magic wand, lasso)
- [ ] Batch processing
- [ ] History visualization
- [ ] Custom toolbar configuration

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for development setup and guidelines.

## License

MIT © React Toolkit

## Related Packages

- `@react-toolkit/core` - Core utilities
- `@react-toolkit/design-tokens` - Design system tokens
- `@react-toolkit/rich-text-editor` - WYSIWYG text editor

## Support

For issues and feature requests, visit the [GitHub repository](https://github.com/your-org/react-toolkit).


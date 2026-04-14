/**
 * @file types.ts
 * @description Type definitions for Image Editor component
 */

import React from 'react';

/**
 * Image source types
 */
export type ImageEditorSourceType = 'url' | 'file' | 'blob';

/**
 * Image source configuration
 */
export interface ImageEditorSource {
  type: ImageEditorSourceType;
  value: string | File | Blob;
  name?: string;
}

/**
 * Export format types
 */
export type ImageExportFormat = 'png' | 'jpeg' | 'webp';

/**
 * Export result
 */
export interface ImageExportResult {
  format: ImageExportFormat;
  dataUrl?: string;
  blob?: Blob;
  name?: string;
}

/**
 * Tool types
 */
export type ImageEditorTool =
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

/**
 * Shape types for annotation tools
 */
export type ImageEditorShapeType = 'Rectangle' | 'Ellipse' | 'Arrow' | 'Line';

/**
 * Toolbar item configuration
 */
export interface ImageEditorToolbarItem {
  id: string;
  tool: ImageEditorTool;
  icon?: React.ReactNode;
  label?: string;
  tooltip?: string;
  template?: React.ReactNode;
}

/**
 * Draw settings
 */
export interface DrawSettings {
  color?: string;
  width?: number;
  opacity?: number;
}

/**
 * Shape settings
 */
export interface ShapeSettings {
  strokeColor?: string;
  fillColor?: string;
  strokeWidth?: number;
  shape?: ImageEditorShapeType;
}

/**
 * Text settings
 */
export interface TextSettings {
  fontFamily?: string;
  fontSize?: number;
  color?: string;
  backgroundColor?: string;
}

/**
 * Adjustment settings
 */
export interface AdjustmentSettings {
  brightness?: number;
  contrast?: number;
  saturation?: number;
  hue?: number;
  sharpen?: number;
  blur?: number;
}

/**
 * Zoom limits
 */
export interface ZoomLimits {
  min: number;
  max: number;
}

/**
 * History state for undo/redo
 */
export interface HistoryState {
  imageData: ImageData;
  timestamp: number;
}

/**
 * Crop region
 */
export interface CropRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Annotation base
 */
export interface Annotation {
  id: string;
  type: 'draw' | 'shape' | 'text';
  committed: boolean;
}

/**
 * Draw annotation
 */
export interface DrawAnnotation extends Annotation {
  type: 'draw';
  points: Array<{ x: number; y: number }>;
  color: string;
  width: number;
  opacity: number;
}

/**
 * Shape annotation
 */
export interface ShapeAnnotation extends Annotation {
  type: 'shape';
  shape: ImageEditorShapeType;
  x: number;
  y: number;
  width: number;
  height: number;
  strokeColor: string;
  fillColor?: string;
  strokeWidth: number;
}

/**
 * Text annotation
 */
export interface TextAnnotation extends Annotation {
  type: 'text';
  text: string;
  x: number;
  y: number;
  fontFamily: string;
  fontSize: number;
  color: string;
  backgroundColor?: string;
}

/**
 * Image Editor component props
 */
export interface ImageEditorProps {
  id?: string;
  initialImage?: ImageEditorSource;
  toolbarItems?: ImageEditorToolbarItem[];
  allowOpen?: boolean;
  allowExport?: boolean;
  allowHistory?: boolean;
  historyLimit?: number;
  zoomLimits?: ZoomLimits;
  drawSettings?: DrawSettings;
  shapeSettings?: ShapeSettings;
  textSettings?: TextSettings;
  adjustmentSettings?: AdjustmentSettings;
  onImageLoaded?: (source: ImageEditorSource) => void;
  onImageChange?: (source: ImageEditorSource) => void;
  onExport?: (result: ImageExportResult) => void;
  onError?: (error: unknown) => void;
}

/**
 * Imperative handle for Image Editor
 */
export interface ImageEditorHandle {
  openImage: (source: ImageEditorSource) => void;
  getCanvasDataUrl: (format?: ImageExportFormat, quality?: number) => string;
  getCanvasBlob: (format?: ImageExportFormat, quality?: number) => Promise<Blob>;
  export: (format: ImageExportFormat, options?: { quality?: number; name?: string }) => Promise<ImageExportResult>;
  undo: () => void;
  redo: () => void;
  reset: () => void;
}


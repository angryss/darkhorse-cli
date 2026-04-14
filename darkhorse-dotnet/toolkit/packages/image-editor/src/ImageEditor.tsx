/**
 * @file ImageEditor.tsx
 * @description Main Image Editor component
 */

import React, { useRef, useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import {
  ImageEditorProps,
  ImageEditorHandle,
  ImageEditorTool,
  ImageEditorSource,
  ImageExportFormat,
  ImageExportResult,
  DrawAnnotation,
  ShapeAnnotation,
  TextAnnotation,
  CropRegion,
  AdjustmentSettings,
} from './types';
import { HistoryManager } from './utils/history';
import {
  loadImageFromSource,
  createCanvasFromImage,
  rotateCanvas,
  flipCanvas,
  getCanvasDataUrl,
  getCanvasBlob,
  cloneCanvas,
  getImageData,
  putImageData,
} from './utils/canvas';
import { applyAdjustments } from './utils/filters';
import {
  renderDrawAnnotation,
  renderShapeAnnotation,
  renderTextAnnotation,
} from './utils/annotations';
import styles from './ImageEditor.module.css';

/**
 * ImageEditor component with forwardRef for imperative handle
 */
export const ImageEditor = forwardRef<ImageEditorHandle, ImageEditorProps>((props, ref) => {
  const {
    id,
    initialImage,
    allowOpen = true,
    allowExport = true,
    allowHistory = true,
    historyLimit = 50,
    zoomLimits = { min: 0.1, max: 5 },
    adjustmentSettings = { brightness: 0, contrast: 0, saturation: 100, hue: 0, blur: 0, sharpen: 0 },
    onImageLoaded,
    onImageChange,
    onExport,
    onError,
  } = props;

  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const historyRef = useRef<HistoryManager>(new HistoryManager(historyLimit));

  // State
  const [currentImage, setCurrentImage] = useState<ImageEditorSource | null>(null);
  const [workingCanvas, setWorkingCanvas] = useState<HTMLCanvasElement | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [annotations, setAnnotations] = useState<Array<DrawAnnotation | ShapeAnnotation | TextAnnotation>>([]);
  const [cropRegion, setCropRegion] = useState<CropRegion | null>(null);
  const [currentAdjustments, setCurrentAdjustments] = useState<AdjustmentSettings>(adjustmentSettings);
  const [showAdjustmentPanel, setShowAdjustmentPanel] = useState<boolean>(false);

  // Load initial image
  useEffect(() => {
    if (initialImage) {
      handleOpenImage(initialImage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Load image from source
   */
  const handleOpenImage = useCallback(async (source: ImageEditorSource) => {
    try {
      setLoading(true);
      const img = await loadImageFromSource(source);
      const canvas = createCanvasFromImage(img);
      setWorkingCanvas(canvas);
      setCurrentImage(source);

      // Initialize history
      const imageData = getImageData(canvas);
      if (imageData && allowHistory) {
        historyRef.current.reset(imageData);
      }

      // Reset state
      setAnnotations([]);
      setCropRegion(null);
      setZoom(1);

      onImageLoaded?.(source);
    } catch (error) {
      onError?.(error);
    } finally {
      setLoading(false);
    }
  }, [allowHistory, onImageLoaded, onError]);

  /**
   * Render canvas to display
   */
  const renderCanvas = useCallback(() => {
    if (!workingCanvas || !canvasRef.current) return;

    const displayCanvas = canvasRef.current;
    const ctx = displayCanvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    displayCanvas.width = workingCanvas.width;
    displayCanvas.height = workingCanvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, displayCanvas.width, displayCanvas.height);

    // Draw image
    ctx.drawImage(workingCanvas, 0, 0);

    // Draw annotations
    annotations.forEach((annotation) => {
      if (annotation.type === 'draw') {
        renderDrawAnnotation(ctx, annotation);
      } else if (annotation.type === 'shape') {
        renderShapeAnnotation(ctx, annotation);
      } else if (annotation.type === 'text') {
        renderTextAnnotation(ctx, annotation);
      }
    });

    // Draw crop overlay
    if (cropRegion) {
      ctx.save();
      ctx.strokeStyle = '#2196f3';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(cropRegion.x, cropRegion.y, cropRegion.width, cropRegion.height);
      ctx.restore();
    }
  }, [workingCanvas, annotations, cropRegion]);

  /**
   * Effect to render canvas when state changes
   */
  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  /**
   * Add to history
   */
  const addToHistory = useCallback(() => {
    if (!workingCanvas || !allowHistory) return;
    const imageData = getImageData(workingCanvas);
    if (imageData) {
      historyRef.current.push(imageData);
    }
  }, [workingCanvas, allowHistory]);

  /**
   * Handle tool click
   */
  const handleToolClick = useCallback((tool: ImageEditorTool) => {
    if (!workingCanvas) return;

    try {
      switch (tool) {
        case 'RotateLeft':
          addToHistory();
          setWorkingCanvas(rotateCanvas(workingCanvas, -90));
          onImageChange?.(currentImage!);
          break;
        case 'RotateRight':
          addToHistory();
          setWorkingCanvas(rotateCanvas(workingCanvas, 90));
          onImageChange?.(currentImage!);
          break;
        case 'FlipHorizontal':
          addToHistory();
          setWorkingCanvas(flipCanvas(workingCanvas, true));
          onImageChange?.(currentImage!);
          break;
        case 'FlipVertical':
          addToHistory();
          setWorkingCanvas(flipCanvas(workingCanvas, false));
          onImageChange?.(currentImage!);
          break;
        case 'ZoomIn':
          setZoom((prev) => Math.min(prev * 1.2, zoomLimits.max));
          break;
        case 'ZoomOut':
          setZoom((prev) => Math.max(prev / 1.2, zoomLimits.min));
          break;
        case 'ResetZoom':
          setZoom(1);
          break;
        case 'FitToScreen':
          setZoom(1);
          break;
        case 'OriginalSize':
          setZoom(1);
          break;
        case 'Undo':
          handleUndo();
          break;
        case 'Redo':
          handleRedo();
          break;
        case 'Reset':
          handleReset();
          break;
        case 'Brightness':
        case 'Contrast':
        case 'Saturation':
        case 'Hue':
        case 'Blur':
        case 'Sharpen':
          setShowAdjustmentPanel(true);
          break;
      }
    } catch (error) {
      onError?.(error);
    }
  }, [workingCanvas, currentImage, zoomLimits, onImageChange, onError, addToHistory]);

  /**
   * Handle undo
   */
  const handleUndo = useCallback(() => {
    if (!historyRef.current.canUndo()) return;
    const imageData = historyRef.current.undo();
    if (imageData && workingCanvas) {
      putImageData(workingCanvas, imageData);
      setWorkingCanvas(cloneCanvas(workingCanvas));
      onImageChange?.(currentImage!);
    }
  }, [workingCanvas, currentImage, onImageChange]);

  /**
   * Handle redo
   */
  const handleRedo = useCallback(() => {
    if (!historyRef.current.canRedo()) return;
    const imageData = historyRef.current.redo();
    if (imageData && workingCanvas) {
      putImageData(workingCanvas, imageData);
      setWorkingCanvas(cloneCanvas(workingCanvas));
      onImageChange?.(currentImage!);
    }
  }, [workingCanvas, currentImage, onImageChange]);

  /**
   * Handle reset
   */
  const handleReset = useCallback(() => {
    if (currentImage) {
      handleOpenImage(currentImage);
    }
  }, [currentImage, handleOpenImage]);

  /**
   * Apply adjustments
   */
  const applyCurrentAdjustments = useCallback(() => {
    if (!workingCanvas) return;

    addToHistory();

    const imageData = getImageData(workingCanvas);
    if (!imageData) return;

    const adjusted = applyAdjustments(imageData, currentAdjustments);
    putImageData(workingCanvas, adjusted);
    setWorkingCanvas(cloneCanvas(workingCanvas));

    setShowAdjustmentPanel(false);
    setCurrentAdjustments({ brightness: 0, contrast: 0, saturation: 100, hue: 0, blur: 0, sharpen: 0 });
    onImageChange?.(currentImage!);
  }, [workingCanvas, currentAdjustments, currentImage, onImageChange, addToHistory]);

  /**
   * Handle export
   */
  const handleExport = useCallback(async (format: ImageExportFormat = 'png', quality: number = 0.92) => {
    if (!workingCanvas) return;

    try {
      const mimeType = `image/${format}`;
      const dataUrl = getCanvasDataUrl(workingCanvas, mimeType, quality);
      const blob = await getCanvasBlob(workingCanvas, mimeType, quality);

      const result: ImageExportResult = {
        format,
        dataUrl,
        blob,
        name: `image-${Date.now()}.${format}`,
      };

      onExport?.(result);
      return result;
    } catch (error) {
      onError?.(error);
      throw error;
    }
  }, [workingCanvas, onExport, onError]);

  /**
   * Handle file input
   */
  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleOpenImage({ type: 'file', value: file, name: file.name });
    }
  }, [handleOpenImage]);

  /**
   * Imperative handle
   */
  useImperativeHandle(ref, () => ({
    openImage: handleOpenImage,
    getCanvasDataUrl: (format = 'png', quality = 0.92) => {
      if (!workingCanvas) return '';
      return getCanvasDataUrl(workingCanvas, `image/${format}`, quality);
    },
    getCanvasBlob: async (format = 'png', quality = 0.92) => {
      if (!workingCanvas) throw new Error('No image loaded');
      return getCanvasBlob(workingCanvas, `image/${format}`, quality);
    },
    export: async (format: ImageExportFormat, options?: { quality?: number; name?: string }) => {
      if (!workingCanvas) throw new Error('No image loaded');
      const quality = options?.quality ?? 0.92;
      const mimeType = `image/${format}`;
      const dataUrl = getCanvasDataUrl(workingCanvas, mimeType, quality);
      const blob = await getCanvasBlob(workingCanvas, mimeType, quality);
      const result: ImageExportResult = {
        format,
        dataUrl,
        blob,
        name: options?.name ?? `image-${Date.now()}.${format}`,
      };
      onExport?.(result);
      return result;
    },
    undo: handleUndo,
    redo: handleRedo,
    reset: handleReset,
  }));

  // Render empty state
  if (!workingCanvas && !loading) {
    return (
      <div className={styles.imageEditor} id={id}>
        <div className={styles.toolbar}>
          {allowOpen && (
            <>
              <button
                className={styles.toolbarButton}
                onClick={() => fileInputRef.current?.click()}
                aria-label="Open image"
              >
                Open Image
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                style={{ display: 'none' }}
              />
            </>
          )}
        </div>
        <div className={styles.emptyState}>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
          </svg>
          <p>No image loaded. Click "Open Image" to get started.</p>
        </div>
      </div>
    );
  }

  // Render loading state
  if (loading) {
    return (
      <div className={styles.imageEditor} id={id}>
        <div className={styles.loading}>
          <div className={styles.spinner} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.imageEditor} id={id} role="application" aria-label="Image editor">
      {/* Toolbar */}
      <div className={styles.toolbar} role="toolbar">
        {/* File operations */}
        <div className={styles.toolbarGroup}>
          {allowOpen && (
            <>
              <button
                className={styles.toolbarButton}
                onClick={() => fileInputRef.current?.click()}
                aria-label="Open image"
              >
                Open
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                style={{ display: 'none' }}
              />
            </>
          )}
          {allowExport && (
            <button
              className={styles.toolbarButton}
              onClick={() => handleExport('png')}
              aria-label="Export image"
            >
              Export
            </button>
          )}
        </div>

        {/* Transform tools */}
        <div className={styles.toolbarGroup}>
          <button
            className={styles.toolbarButton}
            onClick={() => handleToolClick('RotateLeft')}
            aria-label="Rotate left"
            title="Rotate left 90°"
          >
            ⟲
          </button>
          <button
            className={styles.toolbarButton}
            onClick={() => handleToolClick('RotateRight')}
            aria-label="Rotate right"
            title="Rotate right 90°"
          >
            ⟳
          </button>
          <button
            className={styles.toolbarButton}
            onClick={() => handleToolClick('FlipHorizontal')}
            aria-label="Flip horizontal"
            title="Flip horizontal"
          >
            ⇄
          </button>
          <button
            className={styles.toolbarButton}
            onClick={() => handleToolClick('FlipVertical')}
            aria-label="Flip vertical"
            title="Flip vertical"
          >
            ⇅
          </button>
        </div>

        {/* Zoom tools */}
        <div className={styles.toolbarGroup}>
          <button
            className={styles.toolbarButton}
            onClick={() => handleToolClick('ZoomIn')}
            aria-label="Zoom in"
          >
            +
          </button>
          <button
            className={styles.toolbarButton}
            onClick={() => handleToolClick('ZoomOut')}
            aria-label="Zoom out"
          >
            −
          </button>
          <button
            className={styles.toolbarButton}
            onClick={() => handleToolClick('ResetZoom')}
            aria-label="Reset zoom"
          >
            100%
          </button>
        </div>

        {/* Adjustment tools */}
        <div className={styles.toolbarGroup}>
          <button
            className={styles.toolbarButton}
            onClick={() => setShowAdjustmentPanel(!showAdjustmentPanel)}
            aria-label="Adjustments"
          >
            Adjustments
          </button>
        </div>

        {/* History tools */}
        {allowHistory && (
          <div className={styles.toolbarGroup}>
            <button
              className={styles.toolbarButton}
              onClick={() => handleToolClick('Undo')}
              disabled={!historyRef.current.canUndo()}
              aria-label="Undo"
            >
              ↶
            </button>
            <button
              className={styles.toolbarButton}
              onClick={() => handleToolClick('Redo')}
              disabled={!historyRef.current.canRedo()}
              aria-label="Redo"
            >
              ↷
            </button>
            <button
              className={styles.toolbarButton}
              onClick={() => handleToolClick('Reset')}
              aria-label="Reset"
            >
              Reset
            </button>
          </div>
        )}
      </div>

      {/* Canvas container */}
      <div className={styles.canvasContainer}>
        <canvas
          ref={canvasRef}
          className={styles.canvas}
          style={{ transform: `scale(${zoom})` }}
        />
      </div>

      {/* Adjustment panel */}
      {showAdjustmentPanel && (
        <div className={styles.adjustmentPanel}>
          <div className={styles.adjustmentGroup}>
            <div className={styles.adjustmentControl}>
              <label className={styles.adjustmentLabel}>Brightness</label>
              <input
                type="range"
                min="-100"
                max="100"
                value={currentAdjustments.brightness || 0}
                onChange={(e) => setCurrentAdjustments({ ...currentAdjustments, brightness: Number(e.target.value) })}
                className={styles.adjustmentSlider}
              />
              <span className={styles.adjustmentValue}>{currentAdjustments.brightness || 0}</span>
            </div>
            <div className={styles.adjustmentControl}>
              <label className={styles.adjustmentLabel}>Contrast</label>
              <input
                type="range"
                min="-100"
                max="100"
                value={currentAdjustments.contrast || 0}
                onChange={(e) => setCurrentAdjustments({ ...currentAdjustments, contrast: Number(e.target.value) })}
                className={styles.adjustmentSlider}
              />
              <span className={styles.adjustmentValue}>{currentAdjustments.contrast || 0}</span>
            </div>
            <div className={styles.adjustmentControl}>
              <label className={styles.adjustmentLabel}>Saturation</label>
              <input
                type="range"
                min="0"
                max="200"
                value={currentAdjustments.saturation || 100}
                onChange={(e) => setCurrentAdjustments({ ...currentAdjustments, saturation: Number(e.target.value) })}
                className={styles.adjustmentSlider}
              />
              <span className={styles.adjustmentValue}>{currentAdjustments.saturation || 100}</span>
            </div>
            <div className={styles.adjustmentControl}>
              <label className={styles.adjustmentLabel}>Hue</label>
              <input
                type="range"
                min="-180"
                max="180"
                value={currentAdjustments.hue || 0}
                onChange={(e) => setCurrentAdjustments({ ...currentAdjustments, hue: Number(e.target.value) })}
                className={styles.adjustmentSlider}
              />
              <span className={styles.adjustmentValue}>{currentAdjustments.hue || 0}</span>
            </div>
            <div className={styles.adjustmentControl}>
              <label className={styles.adjustmentLabel}>Blur</label>
              <input
                type="range"
                min="0"
                max="10"
                value={currentAdjustments.blur || 0}
                onChange={(e) => setCurrentAdjustments({ ...currentAdjustments, blur: Number(e.target.value) })}
                className={styles.adjustmentSlider}
              />
              <span className={styles.adjustmentValue}>{currentAdjustments.blur || 0}</span>
            </div>
            <div className={styles.adjustmentControl}>
              <label className={styles.adjustmentLabel}>Sharpen</label>
              <input
                type="range"
                min="0"
                max="100"
                value={currentAdjustments.sharpen || 0}
                onChange={(e) => setCurrentAdjustments({ ...currentAdjustments, sharpen: Number(e.target.value) })}
                className={styles.adjustmentSlider}
              />
              <span className={styles.adjustmentValue}>{currentAdjustments.sharpen || 0}</span>
            </div>
          </div>
          <div className={styles.adjustmentActions}>
            <button className={styles.toolbarButton} onClick={applyCurrentAdjustments}>
              Apply
            </button>
            <button className={styles.toolbarButton} onClick={() => setShowAdjustmentPanel(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Status bar */}
      <div className={styles.statusBar}>
        <div className={styles.statusInfo}>
          {workingCanvas && (
            <>
              <span>Size: {workingCanvas.width} × {workingCanvas.height}</span>
              <span>Zoom: {Math.round(zoom * 100)}%</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
});

ImageEditor.displayName = 'ImageEditor';


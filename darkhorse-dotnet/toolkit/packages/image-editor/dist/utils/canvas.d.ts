/**
 * @file canvas.ts
 * @description Canvas utility functions for image manipulation
 */
import { ImageEditorSource, CropRegion } from '../types';
/**
 * Load image from source
 */
export declare function loadImageFromSource(source: ImageEditorSource): Promise<HTMLImageElement>;
/**
 * Create canvas from image
 */
export declare function createCanvasFromImage(img: HTMLImageElement): HTMLCanvasElement;
/**
 * Rotate canvas
 */
export declare function rotateCanvas(canvas: HTMLCanvasElement, degrees: number): HTMLCanvasElement;
/**
 * Flip canvas
 */
export declare function flipCanvas(canvas: HTMLCanvasElement, horizontal: boolean): HTMLCanvasElement;
/**
 * Crop canvas
 */
export declare function cropCanvas(canvas: HTMLCanvasElement, region: CropRegion): HTMLCanvasElement;
/**
 * Resize canvas
 */
export declare function resizeCanvas(canvas: HTMLCanvasElement, width: number, height: number): HTMLCanvasElement;
/**
 * Get canvas data URL
 */
export declare function getCanvasDataUrl(canvas: HTMLCanvasElement, format?: string, quality?: number): string;
/**
 * Get canvas blob
 */
export declare function getCanvasBlob(canvas: HTMLCanvasElement, format?: string, quality?: number): Promise<Blob>;
/**
 * Clone canvas
 */
export declare function cloneCanvas(canvas: HTMLCanvasElement): HTMLCanvasElement;
/**
 * Get image data from canvas
 */
export declare function getImageData(canvas: HTMLCanvasElement): ImageData | null;
/**
 * Put image data to canvas
 */
export declare function putImageData(canvas: HTMLCanvasElement, imageData: ImageData): void;
/**
 * Clear canvas
 */
export declare function clearCanvas(canvas: HTMLCanvasElement): void;
//# sourceMappingURL=canvas.d.ts.map
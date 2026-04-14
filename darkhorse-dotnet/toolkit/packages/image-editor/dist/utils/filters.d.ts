/**
 * @file filters.ts
 * @description Image filter functions
 */
import { AdjustmentSettings } from '../types';
/**
 * Apply brightness filter
 */
export declare function applyBrightness(imageData: ImageData, value: number): ImageData;
/**
 * Apply contrast filter
 */
export declare function applyContrast(imageData: ImageData, value: number): ImageData;
/**
 * Apply saturation filter
 */
export declare function applySaturation(imageData: ImageData, value: number): ImageData;
/**
 * Apply hue rotation filter
 */
export declare function applyHue(imageData: ImageData, value: number): ImageData;
/**
 * Apply blur filter (simple box blur)
 */
export declare function applyBlur(imageData: ImageData, radius: number): ImageData;
/**
 * Apply sharpen filter
 */
export declare function applySharpen(imageData: ImageData, amount: number): ImageData;
/**
 * Apply grayscale filter
 */
export declare function applyGrayscale(imageData: ImageData): ImageData;
/**
 * Apply all adjustments from settings
 */
export declare function applyAdjustments(imageData: ImageData, settings: AdjustmentSettings): ImageData;
//# sourceMappingURL=filters.d.ts.map
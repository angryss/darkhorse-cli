/**
 * @file annotations.ts
 * @description Annotation drawing utilities
 */
import { DrawAnnotation, ShapeAnnotation, TextAnnotation } from '../types';
/**
 * Draw a line annotation
 */
export declare function drawLine(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, color: string, width: number): void;
/**
 * Draw a path annotation (freehand drawing)
 */
export declare function drawPath(ctx: CanvasRenderingContext2D, points: Array<{
    x: number;
    y: number;
}>, color: string, width: number, opacity: number): void;
/**
 * Draw a rectangle
 */
export declare function drawRectangle(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, strokeColor: string, fillColor: string | undefined, strokeWidth: number): void;
/**
 * Draw an ellipse
 */
export declare function drawEllipse(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, strokeColor: string, fillColor: string | undefined, strokeWidth: number): void;
/**
 * Draw an arrow
 */
export declare function drawArrow(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, strokeColor: string, strokeWidth: number): void;
/**
 * Draw text annotation
 */
export declare function drawText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, fontFamily: string, fontSize: number, color: string, backgroundColor?: string): void;
/**
 * Render draw annotation
 */
export declare function renderDrawAnnotation(ctx: CanvasRenderingContext2D, annotation: DrawAnnotation): void;
/**
 * Render shape annotation
 */
export declare function renderShapeAnnotation(ctx: CanvasRenderingContext2D, annotation: ShapeAnnotation): void;
/**
 * Render text annotation
 */
export declare function renderTextAnnotation(ctx: CanvasRenderingContext2D, annotation: TextAnnotation): void;
//# sourceMappingURL=annotations.d.ts.map
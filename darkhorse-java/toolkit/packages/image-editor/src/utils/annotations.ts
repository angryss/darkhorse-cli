/**
 * @file annotations.ts
 * @description Annotation drawing utilities
 */

import { DrawAnnotation, ShapeAnnotation, TextAnnotation } from '../types';

/**
 * Draw a line annotation
 */
export function drawLine(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string,
  width: number
): void {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.restore();
}

/**
 * Draw a path annotation (freehand drawing)
 */
export function drawPath(
  ctx: CanvasRenderingContext2D,
  points: Array<{ x: number; y: number }>,
  color: string,
  width: number,
  opacity: number
): void {
  if (points.length < 2) return;

  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.globalAlpha = opacity;
  ctx.beginPath();
  
  const firstPoint = points[0];
  if (firstPoint) {
    ctx.moveTo(firstPoint.x, firstPoint.y);
  }

  for (let i = 1; i < points.length; i++) {
    const point = points[i];
    if (point) {
      ctx.lineTo(point.x, point.y);
    }
  }

  ctx.stroke();
  ctx.restore();
}

/**
 * Draw a rectangle
 */
export function drawRectangle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  strokeColor: string,
  fillColor: string | undefined,
  strokeWidth: number
): void {
  ctx.save();
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = strokeWidth;

  if (fillColor) {
    ctx.fillStyle = fillColor;
    ctx.fillRect(x, y, Math.abs(width), Math.abs(height));
  }

  ctx.strokeRect(x, y, Math.abs(width), Math.abs(height));
  ctx.restore();
}

/**
 * Draw an ellipse
 */
export function drawEllipse(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  strokeColor: string,
  fillColor: string | undefined,
  strokeWidth: number
): void {
  ctx.save();
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = strokeWidth;

  const radiusX = Math.abs(width) / 2;
  const radiusY = Math.abs(height) / 2;
  const centerX = x + width / 2;
  const centerY = y + height / 2;

  ctx.beginPath();
  if (radiusX > 0 && radiusY > 0) {
    ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
  }

  if (fillColor) {
    ctx.fillStyle = fillColor;
    ctx.fill();
  }

  ctx.stroke();
  ctx.restore();
}

/**
 * Draw an arrow
 */
export function drawArrow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  strokeColor: string,
  strokeWidth: number
): void {
  ctx.save();
  ctx.strokeStyle = strokeColor;
  ctx.fillStyle = strokeColor;
  ctx.lineWidth = strokeWidth;

  const x2 = x + width;
  const y2 = y + height;

  // Draw line
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  // Draw arrowhead
  const angle = Math.atan2(height, width);
  const arrowLength = 15;
  const arrowAngle = Math.PI / 6;

  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(
    x2 - arrowLength * Math.cos(angle - arrowAngle),
    y2 - arrowLength * Math.sin(angle - arrowAngle)
  );
  ctx.lineTo(
    x2 - arrowLength * Math.cos(angle + arrowAngle),
    y2 - arrowLength * Math.sin(angle + arrowAngle)
  );
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

/**
 * Draw text annotation
 */
export function drawText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  fontFamily: string,
  fontSize: number,
  color: string,
  backgroundColor?: string
): void {
  ctx.save();
  ctx.font = `${fontSize}px ${fontFamily}`;
  ctx.fillStyle = color;

  // Draw background if specified
  if (backgroundColor) {
    const metrics = ctx.measureText(text);
    const padding = 4;
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(
      x - padding,
      y - fontSize - padding,
      metrics.width + padding * 2,
      fontSize + padding * 2
    );
    ctx.fillStyle = color;
  }

  ctx.fillText(text, x, y);
  ctx.restore();
}

/**
 * Render draw annotation
 */
export function renderDrawAnnotation(ctx: CanvasRenderingContext2D, annotation: DrawAnnotation): void {
  drawPath(ctx, annotation.points, annotation.color, annotation.width, annotation.opacity);
}

/**
 * Render shape annotation
 */
export function renderShapeAnnotation(ctx: CanvasRenderingContext2D, annotation: ShapeAnnotation): void {
  const { shape, x, y, width, height, strokeColor, fillColor, strokeWidth } = annotation;

  switch (shape) {
    case 'Rectangle':
      drawRectangle(ctx, x, y, width, height, strokeColor, fillColor, strokeWidth);
      break;
    case 'Ellipse':
      drawEllipse(ctx, x, y, width, height, strokeColor, fillColor, strokeWidth);
      break;
    case 'Arrow':
      drawArrow(ctx, x, y, width, height, strokeColor, strokeWidth);
      break;
    case 'Line':
      drawLine(ctx, x, y, x + width, y + height, strokeColor, strokeWidth);
      break;
  }
}

/**
 * Render text annotation
 */
export function renderTextAnnotation(ctx: CanvasRenderingContext2D, annotation: TextAnnotation): void {
  drawText(
    ctx,
    annotation.text,
    annotation.x,
    annotation.y,
    annotation.fontFamily,
    annotation.fontSize,
    annotation.color,
    annotation.backgroundColor
  );
}


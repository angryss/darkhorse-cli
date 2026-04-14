/**
 * Chart utility functions
 */

/**
 * Combines class names, filtering out falsy values
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Calculate percentage from value and total
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return (value / total) * 100;
}

/**
 * Format number with commas
 */
export function formatNumber(value: number, decimals = 0): string {
  return value.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Generate color palette from theme
 */
export function getChartColors(count: number, theme: 'light' | 'dark'): string[] {
  const lightPalette = [
    '#3b82f6', // blue
    '#10b981', // green
    '#f59e0b', // amber
    '#ef4444', // red
    '#8b5cf6', // violet
    '#ec4899', // pink
    '#06b6d4', // cyan
    '#f97316', // orange
  ];

  const darkPalette = [
    '#60a5fa', // blue
    '#34d399', // green
    '#fbbf24', // amber
    '#f87171', // red
    '#a78bfa', // violet
    '#f472b6', // pink
    '#22d3ee', // cyan
    '#fb923c', // orange
  ];

  const palette = theme === 'dark' ? darkPalette : lightPalette;
  
  // Repeat colors if needed
  const colors: string[] = [];
  for (let i = 0; i < count; i++) {
    const color = palette[i % palette.length];
    if (color) {
      colors.push(color);
    }
  }
  
  return colors;
}

/**
 * Calculate scale for axis
 */
export function calculateScale(
  min: number,
  max: number,
  tickCount = 5
): { min: number; max: number; ticks: number[] } {
  const range = max - min;
  const roughStep = range / (tickCount - 1);
  
  // Round to nice number
  const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
  const normalized = roughStep / magnitude;
  
  let niceStep: number;
  if (normalized < 1.5) {
    niceStep = magnitude;
  } else if (normalized < 3) {
    niceStep = 2 * magnitude;
  } else if (normalized < 7) {
    niceStep = 5 * magnitude;
  } else {
    niceStep = 10 * magnitude;
  }
  
  const niceMin = Math.floor(min / niceStep) * niceStep;
  const niceMax = Math.ceil(max / niceStep) * niceStep;
  
  const ticks: number[] = [];
  for (let i = niceMin; i <= niceMax; i += niceStep) {
    ticks.push(i);
  }
  
  return { min: niceMin, max: niceMax, ticks };
}

/**
 * Generate SVG path for spline (Catmull-Rom)
 */
export function generateSplinePath(points: Array<{ x: number; y: number }>): string {
  if (points.length < 2) return '';
  
  const p0 = points[0];
  const p1 = points[1];
  
  if (!p0 || !p1) return '';
  
  if (points.length === 2) {
    return `M ${p0.x} ${p0.y} L ${p1.x} ${p1.y}`;
  }
  
  let path = `M ${p0.x} ${p0.y}`;
  
  for (let i = 0; i < points.length - 1; i++) {
    const pp0 = points[i === 0 ? i : i - 1];
    const pp1 = points[i];
    const pp2 = points[i + 1];
    const pp3 = points[i + 2];
    
    if (!pp0 || !pp1 || !pp2) continue;
    
    const p3 = pp3 || pp2;
    
    // Catmull-Rom to Bezier conversion
    const cp1x = pp1.x + (pp2.x - pp0.x) / 6;
    const cp1y = pp1.y + (pp2.y - pp0.y) / 6;
    const cp2x = pp2.x - (p3.x - pp1.x) / 6;
    const cp2y = pp2.y - (p3.y - pp1.y) / 6;
    
    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${pp2.x} ${pp2.y}`;
  }
  
  return path;
}

/**
 * Calculate pie slice path
 */
export function calculatePieSlicePath(
  centerX: number,
  centerY: number,
  radius: number,
  innerRadius: number,
  startAngle: number,
  endAngle: number
): string {
  const startX = centerX + radius * Math.cos(startAngle);
  const startY = centerY + radius * Math.sin(startAngle);
  const endX = centerX + radius * Math.cos(endAngle);
  const endY = centerY + radius * Math.sin(endAngle);
  
  const innerStartX = centerX + innerRadius * Math.cos(startAngle);
  const innerStartY = centerY + innerRadius * Math.sin(startAngle);
  const innerEndX = centerX + innerRadius * Math.cos(endAngle);
  const innerEndY = centerY + innerRadius * Math.sin(endAngle);
  
  const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
  
  if (innerRadius === 0) {
    // Full pie slice
    return `
      M ${centerX} ${centerY}
      L ${startX} ${startY}
      A ${radius} ${radius} 0 ${largeArc} 1 ${endX} ${endY}
      Z
    `;
  } else {
    // Donut slice
    return `
      M ${startX} ${startY}
      A ${radius} ${radius} 0 ${largeArc} 1 ${endX} ${endY}
      L ${innerEndX} ${innerEndY}
      A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${innerStartX} ${innerStartY}
      Z
    `;
  }
}

/**
 * Calculate label position for pie slice
 */
export function calculatePieLabelPosition(
  centerX: number,
  centerY: number,
  radius: number,
  angle: number,
  offset = 20
): { x: number; y: number } {
  const labelRadius = radius + offset;
  return {
    x: centerX + labelRadius * Math.cos(angle),
    y: centerY + labelRadius * Math.sin(angle),
  };
}


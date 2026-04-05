/**
 * Pivot Engine - Core aggregation logic
 */
import type { PivotRecord, PivotConfig, PivotMatrix } from './types';
/**
 * Build pivot matrix from data and configuration
 */
export declare function buildPivotMatrix(data: PivotRecord[], config: PivotConfig): PivotMatrix;
/**
 * Export pivot matrix to CSV
 */
export declare function exportToCSV(matrix: PivotMatrix): string;
//# sourceMappingURL=pivotEngine.d.ts.map
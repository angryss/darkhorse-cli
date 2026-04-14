/**
 * Pivot Engine Tests
 */

import { describe, it, expect } from 'vitest';
import { buildPivotMatrix, exportToCSV } from '../pivotEngine';
import type { PivotConfig, PivotRecord } from '../types';

describe('pivotEngine', () => {
  const sampleData: PivotRecord[] = [
    { region: 'North', product: 'Widget', sales: 1000, units: 50 },
    { region: 'North', product: 'Gadget', sales: 1500, units: 75 },
    { region: 'South', product: 'Widget', sales: 800, units: 40 },
    { region: 'South', product: 'Gadget', sales: 1200, units: 60 },
  ];

  describe('buildPivotMatrix', () => {
    it('should build a basic pivot matrix', () => {
      const config: PivotConfig = {
        rows: [{ field: 'region' }],
        columns: [{ field: 'product' }],
        values: [{ field: 'sales', aggregation: 'sum' }],
      };

      const matrix = buildPivotMatrix(sampleData, config);

      expect(matrix.rowHeaders).toHaveLength(2); // North, South
      expect(matrix.columnHeaders).toHaveLength(2); // Widget, Gadget
      expect(matrix.cells).toHaveLength(2);
      expect(matrix.cells[0]).toHaveLength(2);
    });

    it('should calculate sum aggregation correctly', () => {
      const config: PivotConfig = {
        rows: [{ field: 'region' }],
        columns: [{ field: 'product' }],
        values: [{ field: 'sales', aggregation: 'sum' }],
      };

      const matrix = buildPivotMatrix(sampleData, config);

      // Columns are sorted alphabetically: Gadget, Widget
      // North + Gadget = 1500
      expect(matrix.cells[0][0].value).toBe(1500);
      // North + Widget = 1000
      expect(matrix.cells[0][1].value).toBe(1000);
    });

    it('should calculate average aggregation correctly', () => {
      const config: PivotConfig = {
        rows: [{ field: 'region' }],
        columns: [{ field: 'product' }],
        values: [{ field: 'sales', aggregation: 'avg' }],
      };

      const matrix = buildPivotMatrix(sampleData, config);

      // Columns are sorted alphabetically: Gadget, Widget
      expect(matrix.cells[0][0].value).toBe(1500);
      expect(matrix.cells[0][1].value).toBe(1000);
    });

    it('should calculate min aggregation correctly', () => {
      const config: PivotConfig = {
        rows: [{ field: 'region' }],
        columns: [{ field: 'product' }],
        values: [{ field: 'sales', aggregation: 'min' }],
      };

      const matrix = buildPivotMatrix(sampleData, config);

      // Columns are sorted alphabetically: Gadget, Widget
      expect(matrix.cells[0][0].value).toBe(1500);
      expect(matrix.cells[1][0].value).toBe(1200);
    });

    it('should calculate max aggregation correctly', () => {
      const config: PivotConfig = {
        rows: [{ field: 'region' }],
        columns: [{ field: 'product' }],
        values: [{ field: 'sales', aggregation: 'max' }],
      };

      const matrix = buildPivotMatrix(sampleData, config);

      // Columns are sorted alphabetically: Gadget, Widget
      expect(matrix.cells[0][0].value).toBe(1500);
      expect(matrix.cells[0][1].value).toBe(1000);
    });

    it('should calculate count aggregation correctly', () => {
      const config: PivotConfig = {
        rows: [{ field: 'region' }],
        columns: [{ field: 'product' }],
        values: [{ field: 'sales', aggregation: 'count' }],
      };

      const matrix = buildPivotMatrix(sampleData, config);

      // Each cell should have count of 1
      expect(matrix.cells[0][0].value).toBe(1);
      expect(matrix.cells[0][1].value).toBe(1);
    });

    it('should calculate distinctCount aggregation correctly', () => {
      const dataWithDuplicates: PivotRecord[] = [
        { region: 'North', product: 'Widget', sales: 1000 },
        { region: 'North', product: 'Widget', sales: 1000 },
        { region: 'North', product: 'Widget', sales: 1500 },
      ];

      const config: PivotConfig = {
        rows: [{ field: 'region' }],
        columns: [{ field: 'product' }],
        values: [{ field: 'sales', aggregation: 'distinctCount' }],
      };

      const matrix = buildPivotMatrix(dataWithDuplicates, config);

      // Should count distinct values: 1000, 1500 = 2
      expect(matrix.cells[0][0].value).toBe(2);
    });

    it('should calculate grand totals', () => {
      const config: PivotConfig = {
        rows: [{ field: 'region' }],
        columns: [{ field: 'product' }],
        values: [{ field: 'sales', aggregation: 'sum' }],
      };

      const matrix = buildPivotMatrix(sampleData, config);

      expect(matrix.grandTotalRow).toBeDefined();
      expect(matrix.grandTotalColumn).toBeDefined();
      expect(matrix.grandTotal).toBeDefined();
      expect(matrix.grandTotal?.value).toBe(4500); // Sum of all sales
    });

    it('should apply include filters', () => {
      const config: PivotConfig = {
        rows: [{ field: 'region' }],
        columns: [{ field: 'product' }],
        values: [{ field: 'sales', aggregation: 'sum' }],
        filters: [{ field: 'region', filterType: 'include', items: ['North'] }],
      };

      const matrix = buildPivotMatrix(sampleData, config);

      expect(matrix.rowHeaders).toHaveLength(1); // Only North
      expect(matrix.rowHeaders[0][0]).toBe('North');
    });

    it('should apply exclude filters', () => {
      const config: PivotConfig = {
        rows: [{ field: 'region' }],
        columns: [{ field: 'product' }],
        values: [{ field: 'sales', aggregation: 'sum' }],
        filters: [{ field: 'region', filterType: 'exclude', items: ['North'] }],
      };

      const matrix = buildPivotMatrix(sampleData, config);

      expect(matrix.rowHeaders).toHaveLength(1); // Only South
      expect(matrix.rowHeaders[0][0]).toBe('South');
    });

    it('should handle empty data gracefully', () => {
      const config: PivotConfig = {
        rows: [{ field: 'region' }],
        columns: [{ field: 'product' }],
        values: [{ field: 'sales', aggregation: 'sum' }],
      };

      const matrix = buildPivotMatrix([], config);

      expect(matrix.rowHeaders).toHaveLength(0);
      expect(matrix.columnHeaders).toHaveLength(0);
    });

    it('should format values correctly', () => {
      const config: PivotConfig = {
        rows: [{ field: 'region' }],
        columns: [{ field: 'product' }],
        values: [{ field: 'sales', aggregation: 'sum', format: '0.00' }],
      };

      const matrix = buildPivotMatrix(sampleData, config);

      // Columns are sorted alphabetically: Gadget, Widget
      expect(matrix.cells[0][0].formattedValue).toContain('1500');
    });
  });

  describe('exportToCSV', () => {
    it('should export pivot matrix to CSV', () => {
      const config: PivotConfig = {
        rows: [{ field: 'region' }],
        columns: [{ field: 'product' }],
        values: [{ field: 'sales', aggregation: 'sum' }],
      };

      const matrix = buildPivotMatrix(sampleData, config);
      const csv = exportToCSV(matrix);

      expect(csv).toContain('Gadget');
      expect(csv).toContain('Widget');
      expect(csv).toContain('North');
      expect(csv).toContain('South');
      expect(csv).toContain('Grand Total');
    });

    it('should include grand totals in CSV', () => {
      const config: PivotConfig = {
        rows: [{ field: 'region' }],
        columns: [{ field: 'product' }],
        values: [{ field: 'sales', aggregation: 'sum' }],
      };

      const matrix = buildPivotMatrix(sampleData, config);
      const csv = exportToCSV(matrix);

      const lines = csv.split('\n');
      expect(lines[lines.length - 1]).toContain('Grand Total');
    });
  });
});


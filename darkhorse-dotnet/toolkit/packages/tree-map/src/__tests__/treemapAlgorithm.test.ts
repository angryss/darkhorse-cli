/**
 * Treemap Algorithm Tests
 */

import { describe, it, expect } from 'vitest';
import { buildHierarchy, layoutTreeMap, flattenRects } from '../treemapAlgorithm';
import type { TreeMapDataItem } from '../types';

describe('treemapAlgorithm', () => {
  const sampleData: TreeMapDataItem[] = [
    { id: 1, label: 'Root', value: 0, parentId: null },
    { id: 2, label: 'Child 1', value: 100, parentId: 1 },
    { id: 3, label: 'Child 2', value: 150, parentId: 1 },
    { id: 4, label: 'Child 3', value: 50, parentId: 1 },
  ];

  describe('buildHierarchy', () => {
    it('should build hierarchy from flat data', () => {
      const hierarchy = buildHierarchy(sampleData);
      
      expect(hierarchy).toHaveLength(1); // One root
      expect(hierarchy[0].children).toHaveLength(3); // Three children
    });

    it('should calculate total values correctly', () => {
      const hierarchy = buildHierarchy(sampleData);
      
      expect(hierarchy[0].totalValue).toBe(300); // Sum of children
    });

    it('should handle multiple roots', () => {
      const multiRootData: TreeMapDataItem[] = [
        { id: 1, label: 'Root 1', value: 100, parentId: null },
        { id: 2, label: 'Root 2', value: 150, parentId: null },
      ];
      
      const hierarchy = buildHierarchy(multiRootData);
      
      expect(hierarchy).toHaveLength(2);
    });

    it('should handle empty data', () => {
      const hierarchy = buildHierarchy([]);
      
      expect(hierarchy).toHaveLength(0);
    });

    it('should handle orphaned nodes (missing parent)', () => {
      const orphanedData: TreeMapDataItem[] = [
        { id: 1, label: 'Child', value: 100, parentId: 999 }, // Parent doesn't exist
      ];
      
      const hierarchy = buildHierarchy(orphanedData);
      
      expect(hierarchy).toHaveLength(1); // Treated as root
    });
  });

  describe('layoutTreeMap', () => {
    const getColor = () => '#3b82f6';

    it('should layout rectangles', () => {
      const hierarchy = buildHierarchy(sampleData);
      const rects = layoutTreeMap(hierarchy, 0, 0, 800, 600, 0, 2, getColor);
      
      expect(rects).toHaveLength(1); // One root rectangle
    });

    it('should respect dimensions', () => {
      const hierarchy = buildHierarchy(sampleData);
      const rects = layoutTreeMap(hierarchy, 0, 0, 800, 600, 0, 2, getColor);
      
      // Width/height include gap adjustments
      expect(rects[0].width).toBeLessThanOrEqual(800);
      expect(rects[0].height).toBeGreaterThan(0);
      expect(rects[0].height).toBeLessThan(1000); // Reasonable bound
    });

    it('should apply gap', () => {
      const hierarchy = buildHierarchy(sampleData);
      const rectsWithGap = layoutTreeMap(hierarchy, 0, 0, 800, 600, 0, 10, getColor);
      const rectsWithoutGap = layoutTreeMap(hierarchy, 0, 0, 800, 600, 0, 0, getColor);
      
      expect(rectsWithGap[0].width).toBeLessThan(rectsWithoutGap[0].width);
    });

    it('should handle empty node list', () => {
      const rects = layoutTreeMap([], 0, 0, 800, 600, 0, 2, getColor);
      
      expect(rects).toHaveLength(0);
    });

    it('should handle zero dimensions', () => {
      const hierarchy = buildHierarchy(sampleData);
      const rects = layoutTreeMap(hierarchy, 0, 0, 0, 0, 0, 2, getColor);
      
      expect(rects).toHaveLength(0);
    });

    it('should layout children recursively', () => {
      const hierarchy = buildHierarchy(sampleData);
      const rects = layoutTreeMap(hierarchy, 0, 0, 800, 600, 0, 2, getColor);
      
      expect(rects[0].children).toBeDefined();
      expect(rects[0].children?.length).toBe(3);
    });
  });

  describe('flattenRects', () => {
    const getColor = () => '#3b82f6';

    it('should flatten nested rectangles', () => {
      const hierarchy = buildHierarchy(sampleData);
      const rects = layoutTreeMap(hierarchy, 0, 0, 800, 600, 0, 2, getColor);
      const flat = flattenRects(rects);
      
      expect(flat.length).toBeGreaterThan(rects.length); // Includes children
    });

    it('should preserve all rectangle data', () => {
      const hierarchy = buildHierarchy(sampleData);
      const rects = layoutTreeMap(hierarchy, 0, 0, 800, 600, 0, 2, getColor);
      const flat = flattenRects(rects);
      
      flat.forEach(rect => {
        expect(rect.item).toBeDefined();
        expect(rect.x).toBeDefined();
        expect(rect.y).toBeDefined();
        expect(rect.width).toBeDefined();
        expect(rect.height).toBeDefined();
      });
    });

    it('should handle empty input', () => {
      const flat = flattenRects([]);
      
      expect(flat).toHaveLength(0);
    });
  });
});


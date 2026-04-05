/**
 * TreeGrid Component Tests
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TreeGrid } from '../TreeGrid';
import type { TreeGridColumn, TreeGridRecord, TreeGridProps } from '../types';

// Test data
const createTestData = (): TreeGridRecord[] => [
  {
    id: 1,
    name: 'Parent 1',
    value: 100,
    children: [
      { id: 2, name: 'Child 1.1', value: 50 },
      {
        id: 3,
        name: 'Child 1.2',
        value: 50,
        children: [{ id: 4, name: 'Grandchild 1.2.1', value: 25 }],
      },
    ],
  },
  {
    id: 5,
    name: 'Parent 2',
    value: 200,
    children: [{ id: 6, name: 'Child 2.1', value: 100 }],
  },
];

const createTestColumns = (): TreeGridColumn[] => [
  { field: 'name', headerText: 'Name', width: 200 },
  { field: 'value', headerText: 'Value', width: 100, textAlign: 'Right' },
];

const defaultProps: TreeGridProps = {
  data: createTestData(),
  columns: createTestColumns(),
};

describe('TreeGrid', () => {
  describe('Rendering', () => {
    it('should render the tree grid', () => {
      render(<TreeGrid {...defaultProps} />);
      expect(screen.getByRole('treegrid')).toBeInTheDocument();
    });

    it('should render column headers', () => {
      render(<TreeGrid {...defaultProps} />);
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Value')).toBeInTheDocument();
    });

    it('should render top-level rows', () => {
      render(<TreeGrid {...defaultProps} />);
      expect(screen.getByText('Parent 1')).toBeInTheDocument();
      expect(screen.getByText('Parent 2')).toBeInTheDocument();
    });

    it('should not render children initially when collapsed', () => {
      render(<TreeGrid {...defaultProps} />);
      expect(screen.queryByText('Child 1.1')).not.toBeInTheDocument();
      expect(screen.queryByText('Child 2.1')).not.toBeInTheDocument();
    });

    it('should render empty state when data is empty', () => {
      render(<TreeGrid {...defaultProps} data={[]} />);
      expect(screen.getByText('No data available')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(<TreeGrid {...defaultProps} className="custom-class" />);
      expect(container.querySelector('.custom-class')).toBeInTheDocument();
    });

    it('should apply custom height', () => {
      const { container } = render(<TreeGrid {...defaultProps} height="500px" />);
      const grid = container.querySelector('[role="treegrid"]');
      expect(grid).toHaveStyle({ height: '500px' });
    });
  });

  describe('Expand/Collapse', () => {
    it('should show expand button for rows with children', () => {
      render(<TreeGrid {...defaultProps} />);
      const expandButtons = screen.getAllByRole('button', { name: /expand/i });
      expect(expandButtons).toHaveLength(2); // Parent 1 and Parent 2
    });

    it('should expand row when expand button is clicked', () => {
      render(<TreeGrid {...defaultProps} />);
      const expandButton = screen.getAllByRole('button', { name: /expand/i })[0];

      fireEvent.click(expandButton);

      expect(screen.getByText('Child 1.1')).toBeInTheDocument();
      expect(screen.getByText('Child 1.2')).toBeInTheDocument();
    });

    it('should collapse row when collapse button is clicked', () => {
      render(<TreeGrid {...defaultProps} initiallyExpandedIds={[1]} />);

      // Children should be visible initially
      expect(screen.getByText('Child 1.1')).toBeInTheDocument();

      const collapseButton = screen.getByRole('button', { name: /collapse/i });
      fireEvent.click(collapseButton);

      expect(screen.queryByText('Child 1.1')).not.toBeInTheDocument();
    });

    it('should call onToggleExpand callback', () => {
      const onToggleExpand = vi.fn();
      render(<TreeGrid {...defaultProps} onToggleExpand={onToggleExpand} />);

      const expandButton = screen.getAllByRole('button', { name: /expand/i })[0];
      fireEvent.click(expandButton);

      expect(onToggleExpand).toHaveBeenCalledWith({
        record: expect.objectContaining({ id: 1, name: 'Parent 1' }),
        expanded: true,
      });
    });

    it('should expand nested rows independently', () => {
      render(<TreeGrid {...defaultProps} initiallyExpandedIds={[1]} />);

      // Expand child with grandchildren
      const expandButtons = screen.getAllByRole('button', { name: /expand/i });
      fireEvent.click(expandButtons[0]);

      expect(screen.getByText('Grandchild 1.2.1')).toBeInTheDocument();
    });

    it('should respect initiallyExpandedIds', () => {
      render(<TreeGrid {...defaultProps} initiallyExpandedIds={[1, 5]} />);

      expect(screen.getByText('Child 1.1')).toBeInTheDocument();
      expect(screen.getByText('Child 2.1')).toBeInTheDocument();
    });
  });

  describe('Sorting', () => {
    it('should not allow sorting when allowSorting is false', () => {
      render(<TreeGrid {...defaultProps} allowSorting={false} />);
      const header = screen.getByText('Name').closest('[role="columnheader"]');
      expect(header).not.toHaveClass('sortable');
    });

    it('should sort ascending when header is clicked', () => {
      const onSortChange = vi.fn();
      render(<TreeGrid {...defaultProps} allowSorting={true} onSortChange={onSortChange} />);

      const header = screen.getByText('Name').closest('[role="columnheader"]');
      fireEvent.click(header!);

      expect(onSortChange).toHaveBeenCalledWith({
        column: expect.objectContaining({ field: 'name' }),
        direction: 'asc',
      });
    });

    it('should cycle through sort directions (asc -> desc -> none)', () => {
      const onSortChange = vi.fn();
      render(<TreeGrid {...defaultProps} allowSorting={true} onSortChange={onSortChange} />);

      const header = screen.getByText('Name').closest('[role="columnheader"]');

      // First click: asc
      fireEvent.click(header!);
      expect(onSortChange).toHaveBeenLastCalledWith({
        column: expect.objectContaining({ field: 'name' }),
        direction: 'asc',
      });

      // Second click: desc
      fireEvent.click(header!);
      expect(onSortChange).toHaveBeenLastCalledWith({
        column: expect.objectContaining({ field: 'name' }),
        direction: 'desc',
      });

      // Third click: none
      fireEvent.click(header!);
      expect(onSortChange).toHaveBeenLastCalledWith({
        column: expect.objectContaining({ field: 'name' }),
        direction: undefined,
      });
    });

    it('should show sort indicator when sorted', () => {
      render(<TreeGrid {...defaultProps} allowSorting={true} />);

      const header = screen.getByText('Name').closest('[role="columnheader"]');
      fireEvent.click(header!);

      expect(screen.getByLabelText(/sorted asc/i)).toBeInTheDocument();
    });

    it('should respect column-level allowSorting=false', () => {
      const columns: TreeGridColumn[] = [
        { field: 'name', headerText: 'Name', allowSorting: false },
        { field: 'value', headerText: 'Value' },
      ];

      render(<TreeGrid {...defaultProps} columns={columns} allowSorting={true} />);

      const nameHeader = screen.getByText('Name').closest('[role="columnheader"]');
      expect(nameHeader?.className).not.toContain('sortable');

      const valueHeader = screen.getByText('Value').closest('[role="columnheader"]');
      expect(valueHeader?.className).toContain('sortable');
    });
  });

  describe('Selection', () => {
    it('should not allow selection when allowSelection is false', () => {
      const onSelectionChange = vi.fn();
      render(
        <TreeGrid
          {...defaultProps}
          allowSelection={false}
          onSelectionChange={onSelectionChange}
        />
      );

      const row = screen.getByText('Parent 1').closest('[role="row"]');
      fireEvent.click(row!);

      expect(onSelectionChange).not.toHaveBeenCalled();
    });

    it('should select row on click with single selection', () => {
      const onSelectionChange = vi.fn();
      render(
        <TreeGrid
          {...defaultProps}
          allowSelection={true}
          selectionSettings={{ mode: 'Row', type: 'Single' }}
          onSelectionChange={onSelectionChange}
        />
      );

      const row = screen.getByText('Parent 1').closest('[role="row"]');
      fireEvent.click(row!);

      expect(onSelectionChange).toHaveBeenCalledWith({
        selection: [1],
      });
    });

    it('should toggle selection with Ctrl+click for multiple selection', () => {
      const onSelectionChange = vi.fn();
      render(
        <TreeGrid
          {...defaultProps}
          allowSelection={true}
          selectionSettings={{ mode: 'Row', type: 'Multiple' }}
          onSelectionChange={onSelectionChange}
        />
      );

      const row1 = screen.getByText('Parent 1').closest('[role="row"]');
      const row2 = screen.getByText('Parent 2').closest('[role="row"]');

      // Select first row
      fireEvent.click(row1!);
      expect(onSelectionChange).toHaveBeenLastCalledWith({ selection: [1] });

      // Ctrl+click second row
      fireEvent.click(row2!, { ctrlKey: true });
      expect(onSelectionChange).toHaveBeenLastCalledWith({ selection: [1, 5] });
    });

    it('should call onRowClick when row is clicked', () => {
      const onRowClick = vi.fn();
      render(<TreeGrid {...defaultProps} onRowClick={onRowClick} />);

      const row = screen.getByText('Parent 1').closest('[role="row"]');
      fireEvent.click(row!);

      expect(onRowClick).toHaveBeenCalledWith({
        record: expect.objectContaining({ id: 1, name: 'Parent 1' }),
        rowIndex: 0,
        originalEvent: expect.any(Object),
      });
    });
  });

  describe('Custom Templates', () => {
    it('should render custom cell template', () => {
      const columns: TreeGridColumn[] = [
        {
          field: 'name',
          headerText: 'Name',
          template: ({ value }) => <strong data-testid="custom-cell">{String(value)}</strong>,
        },
        { field: 'value', headerText: 'Value' },
      ];

      render(<TreeGrid {...defaultProps} columns={columns} />);

      const customCells = screen.getAllByTestId('custom-cell');
      expect(customCells.length).toBeGreaterThan(0);
      expect(customCells[0].tagName).toBe('STRONG');
    });

    it('should use valueAccessor when provided', () => {
      const columns: TreeGridColumn[] = [
        {
          field: 'value',
          headerText: 'Value',
          valueAccessor: (field, data) => {
            const value = data[field] as number;
            return `$${value}`;
          },
        },
      ];

      render(<TreeGrid {...defaultProps} columns={columns} initiallyExpandedIds={[1]} />);

      expect(screen.getByText('$100')).toBeInTheDocument();
      expect(screen.getAllByText('$50').length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('should have treegrid role', () => {
      render(<TreeGrid {...defaultProps} />);
      expect(screen.getByRole('treegrid')).toBeInTheDocument();
    });

    it('should have proper ARIA attributes on rows', () => {
      render(<TreeGrid {...defaultProps} initiallyExpandedIds={[1]} />);

      const parentRow = screen.getByText('Parent 1').closest('[role="row"]');
      expect(parentRow).toHaveAttribute('aria-level', '1');
      expect(parentRow).toHaveAttribute('aria-expanded', 'true');

      const childRow = screen.getByText('Child 1.1').closest('[role="row"]');
      expect(childRow).toHaveAttribute('aria-level', '2');
    });

    it('should have aria-label on expand buttons', () => {
      render(<TreeGrid {...defaultProps} />);
      const expandButton = screen.getAllByRole('button')[0];
      expect(expandButton).toHaveAttribute('aria-label', 'Expand');
    });

    it('should support keyboard navigation on sortable headers', () => {
      const onSortChange = vi.fn();
      render(<TreeGrid {...defaultProps} allowSorting={true} onSortChange={onSortChange} />);

      const header = screen.getByText('Name').closest('[role="columnheader"]');

      // Press Enter
      fireEvent.keyDown(header!, { key: 'Enter' });
      expect(onSortChange).toHaveBeenCalled();

      onSortChange.mockClear();

      // Press Space
      fireEvent.keyDown(header!, { key: ' ' });
      expect(onSortChange).toHaveBeenCalled();
    });

    it('should be focusable', () => {
      render(<TreeGrid {...defaultProps} />);
      const row = screen.getByText('Parent 1').closest('[role="row"]');
      expect(row).toHaveAttribute('tabIndex', '0');
    });
  });

  describe('Error Handling', () => {
    it('should call onError when error occurs in event handler', () => {
      const onError = vi.fn();
      const onToggleExpand = vi.fn(() => {
        throw new Error('Test error');
      });

      render(<TreeGrid {...defaultProps} onToggleExpand={onToggleExpand} onError={onError} />);

      const expandButton = screen.getAllByRole('button', { name: /expand/i })[0];
      fireEvent.click(expandButton);

      expect(onError).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle records without children property', () => {
      const data: TreeGridRecord[] = [{ id: 1, name: 'Item 1', value: 100 }];
      render(<TreeGrid {...defaultProps} data={data} />);

      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /expand/i })).not.toBeInTheDocument();
    });

    it('should handle records with empty children array', () => {
      const data: TreeGridRecord[] = [{ id: 1, name: 'Item 1', value: 100, children: [] }];
      render(<TreeGrid {...defaultProps} data={data} />);

      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /expand/i })).not.toBeInTheDocument();
    });

    it('should handle custom childField', () => {
      const data = [
        {
          id: 1,
          name: 'Parent',
          value: 100,
          items: [{ id: 2, name: 'Child', value: 50 }],
        },
      ];

      render(<TreeGrid {...defaultProps} data={data} childField="items" />);

      expect(screen.getByText('Parent')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /expand/i })).toBeInTheDocument();
    });

    it('should handle very deep nesting', () => {
      const deepData: TreeGridRecord[] = [
        {
          id: 1,
          name: 'Level 1',
          value: 100,
          children: [
            {
              id: 2,
              name: 'Level 2',
              value: 50,
              children: [
                {
                  id: 3,
                  name: 'Level 3',
                  value: 25,
                  children: [{ id: 4, name: 'Level 4', value: 12 }],
                },
              ],
            },
          ],
        },
      ];

      render(<TreeGrid {...defaultProps} data={deepData} initiallyExpandedIds={[1, 2, 3]} />);

      expect(screen.getByText('Level 1')).toBeInTheDocument();
      expect(screen.getByText('Level 2')).toBeInTheDocument();
      expect(screen.getByText('Level 3')).toBeInTheDocument();
      expect(screen.getByText('Level 4')).toBeInTheDocument();
    });
  });
});


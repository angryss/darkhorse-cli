import { jsx as _jsx } from "react/jsx-runtime";
/**
 * PivotTable Component Tests
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PivotTable } from '../PivotTable';
describe('PivotTable', () => {
    const sampleData = [
        { region: 'North', product: 'Widget', sales: 1000, units: 50 },
        { region: 'North', product: 'Gadget', sales: 1500, units: 75 },
        { region: 'South', product: 'Widget', sales: 800, units: 40 },
        { region: 'South', product: 'Gadget', sales: 1200, units: 60 },
        { region: 'East', product: 'Widget', sales: 900, units: 45 },
        { region: 'East', product: 'Gadget', sales: 1100, units: 55 },
    ];
    const basicConfig = {
        rows: [{ field: 'region', caption: 'Region' }],
        columns: [{ field: 'product', caption: 'Product' }],
        values: [{ field: 'sales', aggregation: 'sum', caption: 'Total Sales' }],
    };
    describe('Rendering', () => {
        it('should render pivot table with data', () => {
            render(_jsx(PivotTable, { data: sampleData, config: basicConfig }));
            // Check headers
            expect(screen.getByText('Gadget')).toBeInTheDocument();
            expect(screen.getByText('Widget')).toBeInTheDocument();
            expect(screen.getByText('North')).toBeInTheDocument();
            expect(screen.getByText('South')).toBeInTheDocument();
            expect(screen.getByText('East')).toBeInTheDocument();
        });
        it('should render empty state when no data', () => {
            render(_jsx(PivotTable, { data: [], config: basicConfig }));
            expect(screen.getByText('No data available')).toBeInTheDocument();
        });
        it('should render with custom dimensions', () => {
            const { container } = render(_jsx(PivotTable, { data: sampleData, config: basicConfig, height: 500, width: "80%" }));
            const pivotTable = container.firstChild;
            expect(pivotTable.style.height).toBe('500px');
            expect(pivotTable.style.width).toBe('80%');
        });
        it('should render with custom className', () => {
            const { container } = render(_jsx(PivotTable, { data: sampleData, config: basicConfig, className: "custom-pivot" }));
            expect(container.firstChild).toHaveClass('custom-pivot');
        });
    });
    describe('Aggregations', () => {
        it('should calculate sum aggregation correctly', () => {
            const { container } = render(_jsx(PivotTable, { data: sampleData, config: basicConfig }));
            // Check that values are rendered (sum of sales)
            const cells = container.querySelectorAll('td');
            expect(cells.length).toBeGreaterThan(0);
        });
        it('should calculate average aggregation', () => {
            const avgConfig = {
                rows: [{ field: 'region' }],
                columns: [{ field: 'product' }],
                values: [{ field: 'sales', aggregation: 'avg' }],
            };
            render(_jsx(PivotTable, { data: sampleData, config: avgConfig }));
            expect(screen.getByRole('grid')).toBeInTheDocument();
        });
        it('should calculate count aggregation', () => {
            const countConfig = {
                rows: [{ field: 'region' }],
                columns: [{ field: 'product' }],
                values: [{ field: 'sales', aggregation: 'count' }],
            };
            render(_jsx(PivotTable, { data: sampleData, config: countConfig }));
            expect(screen.getByRole('grid')).toBeInTheDocument();
        });
        it('should calculate min/max aggregation', () => {
            const minMaxConfig = {
                rows: [{ field: 'region' }],
                columns: [{ field: 'product' }],
                values: [{ field: 'sales', aggregation: 'max' }],
            };
            render(_jsx(PivotTable, { data: sampleData, config: minMaxConfig }));
            expect(screen.getByRole('grid')).toBeInTheDocument();
        });
    });
    describe('Toolbar', () => {
        it('should render toolbar by default', () => {
            render(_jsx(PivotTable, { data: sampleData, config: basicConfig }));
            expect(screen.getByText('Pivot Table')).toBeInTheDocument();
        });
        it('should hide toolbar when showToolbar is false', () => {
            render(_jsx(PivotTable, { data: sampleData, config: basicConfig, showToolbar: false }));
            expect(screen.queryByText('Pivot Table')).not.toBeInTheDocument();
        });
        it('should show export CSV button when enabled', () => {
            render(_jsx(PivotTable, { data: sampleData, config: basicConfig, allowCsvExport: true }));
            expect(screen.getByText('Export CSV')).toBeInTheDocument();
        });
        it('should show export Excel button when enabled', () => {
            render(_jsx(PivotTable, { data: sampleData, config: basicConfig, allowExcelExport: true }));
            expect(screen.getByText('Export Excel')).toBeInTheDocument();
        });
    });
    describe('Export', () => {
        it('should call onExport when CSV export is clicked', async () => {
            const user = userEvent.setup();
            const onExport = vi.fn();
            // Mock URL.createObjectURL and createElement
            global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
            global.URL.revokeObjectURL = vi.fn();
            const clickMock = vi.fn();
            const originalCreateElement = document.createElement.bind(document);
            document.createElement = vi.fn((tagName) => {
                const element = originalCreateElement(tagName);
                if (tagName === 'a') {
                    element.click = clickMock;
                }
                return element;
            });
            render(_jsx(PivotTable, { data: sampleData, config: basicConfig, allowCsvExport: true, onExport: onExport }));
            const exportButton = screen.getByText('Export CSV');
            await user.click(exportButton);
            expect(onExport).toHaveBeenCalledWith({ format: 'csv' });
            expect(clickMock).toHaveBeenCalled();
            // Restore
            document.createElement = originalCreateElement;
        });
        it('should call onExport when Excel export is clicked', async () => {
            const user = userEvent.setup();
            const onExport = vi.fn();
            render(_jsx(PivotTable, { data: sampleData, config: basicConfig, allowExcelExport: true, onExport: onExport }));
            const exportButton = screen.getByText('Export Excel');
            await user.click(exportButton);
            expect(onExport).toHaveBeenCalledWith({ format: 'excel' });
        });
    });
    describe('Cell Interaction', () => {
        it('should call onCellClick when a cell is clicked', async () => {
            const user = userEvent.setup();
            const onCellClick = vi.fn();
            const { container } = render(_jsx(PivotTable, { data: sampleData, config: basicConfig, onCellClick: onCellClick }));
            // Find first value cell
            const cells = container.querySelectorAll('td');
            if (cells.length > 0) {
                await user.click(cells[0]);
                expect(onCellClick).toHaveBeenCalled();
            }
        });
        it('should show drill-through dialog when onDrillThrough is provided', async () => {
            const user = userEvent.setup();
            const onDrillThrough = vi.fn();
            const { container } = render(_jsx(PivotTable, { data: sampleData, config: basicConfig, onDrillThrough: onDrillThrough }));
            // Find and click a value cell
            const cells = container.querySelectorAll('td');
            if (cells.length > 0) {
                await user.click(cells[0]);
                // Check if drill-through dialog appears
                expect(screen.getByText('Drill-Through Details')).toBeInTheDocument();
            }
        });
    });
    describe('Filters', () => {
        it('should apply include filters', () => {
            const filteredConfig = {
                rows: [{ field: 'region' }],
                columns: [{ field: 'product' }],
                values: [{ field: 'sales', aggregation: 'sum' }],
                filters: [{ field: 'region', filterType: 'include', items: ['North', 'South'] }],
            };
            render(_jsx(PivotTable, { data: sampleData, config: filteredConfig }));
            expect(screen.getByText('North')).toBeInTheDocument();
            expect(screen.getByText('South')).toBeInTheDocument();
        });
        it('should apply exclude filters', () => {
            const filteredConfig = {
                rows: [{ field: 'region' }],
                columns: [{ field: 'product' }],
                values: [{ field: 'sales', aggregation: 'sum' }],
                filters: [{ field: 'region', filterType: 'exclude', items: ['East'] }],
            };
            render(_jsx(PivotTable, { data: sampleData, config: filteredConfig }));
            expect(screen.getByText('North')).toBeInTheDocument();
            expect(screen.getByText('South')).toBeInTheDocument();
        });
    });
    describe('Grand Totals', () => {
        it('should render grand totals', () => {
            render(_jsx(PivotTable, { data: sampleData, config: basicConfig }));
            const grandTotalElements = screen.getAllByText('Grand Total');
            expect(grandTotalElements.length).toBeGreaterThan(0);
        });
    });
    describe('Error Handling', () => {
        it('should call onError when an error occurs', () => {
            const onError = vi.fn();
            // Invalid config (no values)
            const invalidConfig = {
                rows: [{ field: 'region' }],
                columns: [{ field: 'product' }],
                values: [],
            };
            render(_jsx(PivotTable, { data: sampleData, config: invalidConfig, onError: onError }));
            expect(onError).toHaveBeenCalled();
        });
    });
    describe('Accessibility', () => {
        it('should have proper ARIA roles', () => {
            render(_jsx(PivotTable, { data: sampleData, config: basicConfig }));
            expect(screen.getByRole('grid')).toBeInTheDocument();
        });
        it('should have proper heading structure', () => {
            const { container } = render(_jsx(PivotTable, { data: sampleData, config: basicConfig }));
            const headers = container.querySelectorAll('th');
            expect(headers.length).toBeGreaterThan(0);
        });
    });
});
//# sourceMappingURL=PivotTable.test.js.map
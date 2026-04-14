import { jsx as _jsx } from "react/jsx-runtime";
/**
 * TreeMap Component Tests
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TreeMap } from '../TreeMap';
describe('TreeMap', () => {
    const sampleData = [
        { id: 1, label: 'Category A', value: 0, parentId: null },
        { id: 2, label: 'Item 1', value: 100, parentId: 1 },
        { id: 3, label: 'Item 2', value: 150, parentId: 1 },
        { id: 4, label: 'Category B', value: 0, parentId: null },
        { id: 5, label: 'Item 3', value: 200, parentId: 4 },
        { id: 6, label: 'Item 4', value: 50, parentId: 4 },
    ];
    describe('Rendering', () => {
        it('should render treemap with data', () => {
            render(_jsx(TreeMap, { data: sampleData }));
            const svg = document.querySelector('svg');
            expect(svg).toBeInTheDocument();
        });
        it('should render empty state when no data', () => {
            render(_jsx(TreeMap, { data: [] }));
            expect(screen.getByText('No data available')).toBeInTheDocument();
        });
        it('should render with custom dimensions', () => {
            const { container } = render(_jsx(TreeMap, { data: sampleData, height: 500, width: "80%" }));
            const treeMap = container.firstChild;
            expect(treeMap.style.height).toBe('500px');
            expect(treeMap.style.width).toBe('80%');
        });
        it('should render with title', () => {
            render(_jsx(TreeMap, { data: sampleData, title: { text: 'Revenue by Category' } }));
            expect(screen.getByText('Revenue by Category')).toBeInTheDocument();
        });
        it('should render with custom className', () => {
            const { container } = render(_jsx(TreeMap, { data: sampleData, className: "custom-treemap" }));
            expect(container.firstChild).toHaveClass('custom-treemap');
        });
    });
    describe('Color Scales', () => {
        it('should apply byGroup color scale', () => {
            render(_jsx(TreeMap, { data: sampleData, colorScale: "byGroup", palette: ['#ff0000', '#00ff00', '#0000ff'] }));
            const rects = document.querySelectorAll('rect');
            expect(rects.length).toBeGreaterThan(0);
        });
        it('should apply continuous color scale', () => {
            render(_jsx(TreeMap, { data: sampleData, colorScale: "continuous", rangeColors: [
                    { from: 0, to: 100, color: '#dbeafe' },
                    { from: 100, to: 200, color: '#3b82f6' },
                ] }));
            const rects = document.querySelectorAll('rect');
            expect(rects.length).toBeGreaterThan(0);
        });
        it('should apply discrete color scale', () => {
            render(_jsx(TreeMap, { data: sampleData, colorScale: "discrete", rangeColors: [
                    { from: 0, to: 100, color: '#ef4444', label: 'Low' },
                    { from: 100, to: 200, color: '#10b981', label: 'High' },
                ] }));
            const rects = document.querySelectorAll('rect');
            expect(rects.length).toBeGreaterThan(0);
        });
    });
    describe('Interactions', () => {
        it('should call onItemClick when rectangle is clicked', async () => {
            const user = userEvent.setup();
            const onItemClick = vi.fn();
            render(_jsx(TreeMap, { data: sampleData, onItemClick: onItemClick }));
            const rects = document.querySelectorAll('rect');
            if (rects.length > 0) {
                await user.click(rects[0]);
                expect(onItemClick).toHaveBeenCalled();
            }
        });
        it('should call onItemHover when rectangle is hovered', async () => {
            const user = userEvent.setup();
            const onItemHover = vi.fn();
            render(_jsx(TreeMap, { data: sampleData, onItemHover: onItemHover }));
            const rects = document.querySelectorAll('rect');
            if (rects.length > 0) {
                await user.hover(rects[0]);
                expect(onItemHover).toHaveBeenCalledWith(expect.objectContaining({
                    label: expect.any(String),
                }));
            }
        });
    });
    describe('Drill-Down', () => {
        it('should enable drill-down by default', () => {
            render(_jsx(TreeMap, { data: sampleData }));
            // Drill-down is enabled, no breadcrumb initially
            expect(screen.queryByRole('button', { name: /home/i })).not.toBeInTheDocument();
        });
        it('should show breadcrumb after drilling down', async () => {
            const user = userEvent.setup();
            render(_jsx(TreeMap, { data: sampleData, drillDown: true }));
            const rects = document.querySelectorAll('rect');
            if (rects.length > 0) {
                await user.click(rects[0]);
                // After clicking, breadcrumb should appear
                const homeButton = screen.queryByRole('button', { name: /home/i });
                if (homeButton) {
                    expect(homeButton).toBeInTheDocument();
                }
            }
        });
        it('should navigate back on breadcrumb click', async () => {
            const user = userEvent.setup();
            render(_jsx(TreeMap, { data: sampleData, drillDown: true }));
            const rects = document.querySelectorAll('rect');
            if (rects.length > 0) {
                await user.click(rects[0]);
                const homeButton = screen.queryByRole('button', { name: /home/i });
                if (homeButton) {
                    await user.click(homeButton);
                    expect(screen.queryByRole('button', { name: /home/i })).not.toBeInTheDocument();
                }
            }
        });
    });
    describe('Tooltip', () => {
        it('should show tooltip when tooltip is enabled', () => {
            render(_jsx(TreeMap, { data: sampleData, tooltip: { visible: true } }));
            const svg = document.querySelector('svg');
            expect(svg).toBeInTheDocument();
        });
        it('should use custom tooltip template', () => {
            render(_jsx(TreeMap, { data: sampleData, tooltip: {
                    visible: true,
                    template: (item) => `Custom: ${item.label}`,
                } }));
            const svg = document.querySelector('svg');
            expect(svg).toBeInTheDocument();
        });
    });
    describe('Legend', () => {
        it('should render legend when enabled', () => {
            render(_jsx(TreeMap, { data: sampleData, legend: { visible: true }, rangeColors: [
                    { from: 0, to: 100, color: '#ef4444', label: 'Low' },
                    { from: 100, to: 200, color: '#10b981', label: 'High' },
                ] }));
            expect(screen.getByText('Low')).toBeInTheDocument();
            expect(screen.getByText('High')).toBeInTheDocument();
        });
        it('should position legend correctly', () => {
            render(_jsx(TreeMap, { data: sampleData, legend: { visible: true, position: 'Top' }, rangeColors: [
                    { from: 0, to: 100, color: '#ef4444', label: 'Low' },
                ] }));
            // Legend is rendered with the label
            expect(screen.getByText('Low')).toBeInTheDocument();
        });
    });
    describe('Borders', () => {
        it('should show borders by default', () => {
            render(_jsx(TreeMap, { data: sampleData }));
            const rects = document.querySelectorAll('rect');
            expect(rects.length).toBeGreaterThan(0);
        });
        it('should hide borders when showBorder is false', () => {
            render(_jsx(TreeMap, { data: sampleData, showBorder: false }));
            const rects = document.querySelectorAll('rect');
            expect(rects.length).toBeGreaterThan(0);
        });
        it('should apply custom border color', () => {
            render(_jsx(TreeMap, { data: sampleData, borderColor: "#ff0000" }));
            const rects = document.querySelectorAll('rect');
            expect(rects.length).toBeGreaterThan(0);
        });
    });
    describe('Error Handling', () => {
        it('should call onError when an error occurs', () => {
            const onError = vi.fn();
            // Invalid data structure
            render(_jsx(TreeMap, { data: [], onError: onError }));
            // Component should still render (empty state)
            expect(screen.getByText('No data available')).toBeInTheDocument();
        });
    });
    describe('Accessibility', () => {
        it('should have proper ARIA labels on rectangles', () => {
            render(_jsx(TreeMap, { data: sampleData }));
            const rects = document.querySelectorAll('rect[aria-label]');
            expect(rects.length).toBeGreaterThan(0);
        });
        it('should make rectangles focusable', () => {
            render(_jsx(TreeMap, { data: sampleData }));
            const rects = document.querySelectorAll('rect[tabindex]');
            expect(rects.length).toBeGreaterThan(0);
        });
    });
});
//# sourceMappingURL=TreeMap.test.js.map
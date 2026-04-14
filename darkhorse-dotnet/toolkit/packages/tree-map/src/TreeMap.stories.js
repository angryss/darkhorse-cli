import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { TreeMap } from './TreeMap';
const meta = {
    title: 'Visualization/TreeMap',
    component: TreeMap,
    parameters: {
        layout: 'padded',
    },
    tags: ['autodocs'],
};
export default meta;
// Sample data
const revenueData = [
    { id: 'products', label: 'Products', value: 0, parentId: null, group: 'sales' },
    { id: 'services', label: 'Services', value: 0, parentId: null, group: 'sales' },
    { id: 'widget', label: 'Widgets', value: 150000, parentId: 'products', group: 'products' },
    { id: 'gadget', label: 'Gadgets', value: 120000, parentId: 'products', group: 'products' },
    { id: 'gizmo', label: 'Gizmos', value: 80000, parentId: 'products', group: 'products' },
    { id: 'consulting', label: 'Consulting', value: 200000, parentId: 'services', group: 'services' },
    { id: 'support', label: 'Support', value: 80000, parentId: 'services', group: 'services' },
    { id: 'training', label: 'Training', value: 50000, parentId: 'services', group: 'services' },
];
const filesData = [
    { id: 'root', label: 'Root', value: 0, parentId: null },
    { id: 'docs', label: 'Documents', value: 2500, parentId: 'root' },
    { id: 'images', label: 'Images', value: 8500, parentId: 'root' },
    { id: 'videos', label: 'Videos', value: 15000, parentId: 'root' },
    { id: 'music', label: 'Music', value: 5000, parentId: 'root' },
    { id: 'downloads', label: 'Downloads', value: 3000, parentId: 'root' },
];
/**
 * Basic treemap visualization
 */
export const Basic = {
    args: {
        data: revenueData,
        height: 600,
        width: 800,
    },
};
/**
 * Treemap with title
 */
export const WithTitle = {
    args: {
        data: revenueData,
        height: 600,
        width: 800,
        title: {
            text: 'Revenue by Category',
            fontSize: '20px',
            fontWeight: 600,
        },
    },
};
/**
 * Treemap with byGroup color scale
 */
export const ByGroupColorScale = {
    args: {
        data: revenueData,
        height: 600,
        width: 800,
        colorScale: 'byGroup',
        palette: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'],
    },
};
/**
 * Treemap with continuous color scale
 */
export const ContinuousColorScale = {
    args: {
        data: filesData,
        height: 600,
        width: 800,
        colorScale: 'continuous',
        rangeColors: [
            { from: 0, to: 5000, color: '#dbeafe' },
            { from: 5000, to: 10000, color: '#93c5fd' },
            { from: 10000, to: 20000, color: '#3b82f6' },
        ],
    },
};
/**
 * Treemap with discrete color scale
 */
export const DiscreteColorScale = {
    args: {
        data: filesData,
        height: 600,
        width: 800,
        colorScale: 'discrete',
        rangeColors: [
            { from: 0, to: 5000, color: '#ef4444', label: 'Small' },
            { from: 5000, to: 10000, color: '#f59e0b', label: 'Medium' },
            { from: 10000, to: Infinity, color: '#10b981', label: 'Large' },
        ],
        legend: {
            visible: true,
            position: 'Bottom',
        },
    },
};
/**
 * Treemap with tooltips
 */
export const WithTooltips = {
    args: {
        data: revenueData,
        height: 600,
        width: 800,
        tooltip: {
            visible: true,
            useGroupingSeparator: true,
        },
    },
};
/**
 * Treemap with custom tooltip template
 */
export const CustomTooltip = {
    args: {
        data: revenueData,
        height: 600,
        width: 800,
        tooltip: {
            visible: true,
            template: (item) => (_jsxs("div", { children: [_jsx("strong", { children: item.label }), _jsx("br", {}), "Revenue: $", (item.value || 0).toLocaleString()] })),
        },
    },
};
/**
 * Treemap with drill-down navigation
 */
export const WithDrillDown = {
    args: {
        data: revenueData,
        height: 600,
        width: 800,
        drillDown: true,
        onItemClick: (item) => {
            console.log('Clicked:', item.label);
        },
    },
};
/**
 * Treemap without borders
 */
export const NoBorders = {
    args: {
        data: filesData,
        height: 600,
        width: 800,
        showBorder: false,
    },
};
/**
 * Treemap with custom borders
 */
export const CustomBorders = {
    args: {
        data: filesData,
        height: 600,
        width: 800,
        showBorder: true,
        borderColor: '#1e40af',
        borderWidth: 3,
    },
};
/**
 * Treemap with custom gap
 */
export const CustomGap = {
    args: {
        data: filesData,
        height: 600,
        width: 800,
        gap: 8,
    },
};
/**
 * Treemap with legend
 */
export const WithLegend = {
    args: {
        data: revenueData,
        height: 600,
        width: 800,
        colorScale: 'discrete',
        rangeColors: [
            { from: 0, to: 100000, color: '#ef4444', label: 'Low Revenue' },
            { from: 100000, to: 150000, color: '#f59e0b', label: 'Medium Revenue' },
            { from: 150000, to: Infinity, color: '#10b981', label: 'High Revenue' },
        ],
        legend: {
            visible: true,
            position: 'Bottom',
        },
    },
};
/**
 * Compact treemap
 */
export const Compact = {
    args: {
        data: filesData,
        height: 400,
        width: 600,
    },
};
/**
 * Large treemap
 */
export const Large = {
    args: {
        data: revenueData,
        height: 800,
        width: 1200,
    },
};
/**
 * Empty state
 */
export const Empty = {
    args: {
        data: [],
        height: 600,
        width: 800,
    },
};
/**
 * Custom styling
 */
export const CustomStyling = {
    args: {
        data: revenueData,
        height: 600,
        width: 800,
        className: 'custom-treemap',
        style: {
            border: '2px solid #3b82f6',
            borderRadius: '12px',
        },
    },
};
/**
 * Interactive example
 */
export const Interactive = {
    args: {
        data: revenueData,
        height: 600,
        width: 800,
        drillDown: true,
        tooltip: {
            visible: true,
        },
        onItemClick: (item) => {
            alert(`Clicked: ${item.label} ($${item.value?.toLocaleString()})`);
        },
        onItemHover: (item) => {
            console.log('Hovering:', item?.label || 'none');
        },
    },
};
//# sourceMappingURL=TreeMap.stories.js.map
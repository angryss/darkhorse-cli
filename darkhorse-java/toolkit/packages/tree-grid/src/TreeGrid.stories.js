import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * TreeGrid Component Stories
 */
import { useState } from 'react';
import { TreeGrid } from './TreeGrid';
const meta = {
    title: 'Components/TreeGrid',
    component: TreeGrid,
    parameters: {
        layout: 'padded',
    },
    tags: ['autodocs'],
};
export default meta;
// Sample data
const sampleData = [
    {
        id: 1,
        country: 'United States',
        population: 331900000,
        area: 9833520,
        gdp: 23315080,
        children: [
            { id: 2, country: 'California', population: 39538223, area: 423970, gdp: 3357000 },
            { id: 3, country: 'Texas', population: 29145505, area: 695662, gdp: 2006000 },
            { id: 4, country: 'Florida', population: 21538187, area: 170312, gdp: 1216000 },
        ],
    },
    {
        id: 5,
        country: 'China',
        population: 1439323776,
        area: 9596961,
        gdp: 17734060,
        children: [
            { id: 6, country: 'Beijing', population: 21540000, area: 16410, gdp: 580000 },
            { id: 7, country: 'Shanghai', population: 27058000, area: 6340, gdp: 612000 },
        ],
    },
    {
        id: 8,
        country: 'India',
        population: 1380004385,
        area: 3287263,
        gdp: 3173398,
        children: [
            { id: 9, country: 'Maharashtra', population: 124904771, area: 307713, gdp: 490000 },
            { id: 10, country: 'Uttar Pradesh', population: 237882725, area: 243286, gdp: 260000 },
        ],
    },
];
const basicColumns = [
    { field: 'country', headerText: 'Country/State', width: 250 },
    { field: 'population', headerText: 'Population', width: 150, textAlign: 'Right' },
    { field: 'area', headerText: 'Area (km²)', width: 150, textAlign: 'Right' },
    { field: 'gdp', headerText: 'GDP (M USD)', width: 150, textAlign: 'Right' },
];
// Basic story
export const Basic = {
    args: {
        data: sampleData,
        columns: basicColumns,
        height: 400,
    },
};
// Initially expanded
export const InitiallyExpanded = {
    args: {
        data: sampleData,
        columns: basicColumns,
        height: 400,
        initiallyExpandedIds: [1, 5],
    },
};
// With sorting
export const WithSorting = {
    args: {
        data: sampleData,
        columns: basicColumns,
        height: 400,
        allowSorting: true,
        onSortChange: (args) => {
            console.log('Sort changed:', args);
        },
    },
};
// With selection
export const WithSelection = {
    args: {
        data: sampleData,
        columns: basicColumns,
        height: 400,
        allowSelection: true,
        selectionSettings: {
            mode: 'Row',
            type: 'Multiple',
        },
        onSelectionChange: (args) => {
            console.log('Selection changed:', args);
        },
    },
};
// Custom templates
export const CustomTemplates = {
    args: {
        data: sampleData,
        columns: [
            {
                field: 'country',
                headerText: 'Country/State',
                width: 250,
                template: ({ value }) => (_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '8px' }, children: [_jsx("span", { style: { fontSize: '20px' }, children: "\uD83C\uDF0D" }), _jsx("strong", { children: String(value) })] })),
            },
            {
                field: 'population',
                headerText: 'Population',
                width: 150,
                textAlign: 'Right',
                template: ({ value }) => (_jsx("span", { style: { color: '#0066cc' }, children: Number(value).toLocaleString() })),
            },
            {
                field: 'gdp',
                headerText: 'GDP',
                width: 150,
                textAlign: 'Right',
                template: ({ value }) => {
                    const gdpValue = Number(value);
                    const color = gdpValue > 1000000 ? '#22c55e' : gdpValue > 500000 ? '#eab308' : '#94a3b8';
                    return (_jsxs("span", { style: { color, fontWeight: 'bold' }, children: ["$", (gdpValue / 1000).toFixed(0), "B"] }));
                },
            },
        ],
        height: 400,
    },
};
// Value accessor
export const ValueAccessor = {
    args: {
        data: sampleData,
        columns: [
            { field: 'country', headerText: 'Country/State', width: 250 },
            {
                field: 'population',
                headerText: 'Population',
                width: 150,
                textAlign: 'Right',
                valueAccessor: (field, data) => {
                    const value = data[field];
                    return value.toLocaleString();
                },
            },
            {
                field: 'area',
                headerText: 'Area',
                width: 150,
                textAlign: 'Right',
                valueAccessor: (field, data) => {
                    const value = data[field];
                    return `${value.toLocaleString()} km²`;
                },
            },
            {
                field: 'gdp',
                headerText: 'GDP',
                width: 150,
                textAlign: 'Right',
                valueAccessor: (field, data) => {
                    const value = data[field];
                    return `$${value.toLocaleString()}M`;
                },
            },
        ],
        height: 400,
    },
};
// Empty state
export const EmptyState = {
    args: {
        data: [],
        columns: basicColumns,
        height: 400,
    },
};
// Interactive example with state
export const Interactive = {
    render: () => {
        const InteractiveGrid = () => {
            const [expandedIds, setExpandedIds] = useState([1]);
            const [selectedIds, setSelectedIds] = useState([]);
            return (_jsxs("div", { style: { fontFamily: 'sans-serif' }, children: [_jsxs("div", { style: { marginBottom: '16px' }, children: [_jsx("h3", { style: { marginBottom: '8px' }, children: "Interactive TreeGrid" }), _jsx("p", { style: { color: '#666', fontSize: '14px' }, children: "Click expand/collapse buttons to toggle rows. Click rows to select them." }), _jsxs("div", { style: { marginTop: '8px' }, children: [_jsx("strong", { children: "Expanded IDs:" }), " ", expandedIds.join(', ') || 'None', _jsx("br", {}), _jsx("strong", { children: "Selected IDs:" }), " ", selectedIds.join(', ') || 'None'] })] }), _jsx(TreeGrid, { data: sampleData, columns: basicColumns, height: 400, initiallyExpandedIds: expandedIds, allowSorting: true, allowSelection: true, selectionSettings: { mode: 'Row', type: 'Multiple' }, onToggleExpand: (args) => {
                            if (args.expanded) {
                                setExpandedIds([...expandedIds, args.record.id]);
                            }
                            else {
                                setExpandedIds(expandedIds.filter((id) => id !== args.record.id));
                            }
                        }, onSelectionChange: (args) => {
                            setSelectedIds(args.selection);
                        } })] }));
        };
        return _jsx(InteractiveGrid, {});
    },
};
// Deep nesting
const deepData = [
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
                        children: [
                            {
                                id: 4,
                                name: 'Level 4',
                                value: 12,
                                children: [
                                    { id: 5, name: 'Level 5', value: 6 },
                                ],
                            },
                        ],
                    },
                ],
            },
        ],
    },
];
export const DeepNesting = {
    args: {
        data: deepData,
        columns: [
            { field: 'name', headerText: 'Name', width: 300 },
            { field: 'value', headerText: 'Value', width: 100, textAlign: 'Right' },
        ],
        height: 400,
        initiallyExpandedIds: [1, 2, 3, 4],
    },
};
// Large dataset
const generateLargeData = () => {
    const data = [];
    for (let i = 1; i <= 20; i++) {
        data.push({
            id: i,
            name: `Parent ${i}`,
            value: i * 100,
            children: Array.from({ length: 5 }, (_, j) => ({
                id: i * 100 + j,
                name: `Child ${i}.${j + 1}`,
                value: (i * 100 + j) * 10,
            })),
        });
    }
    return data;
};
export const LargeDataset = {
    args: {
        data: generateLargeData(),
        columns: [
            { field: 'name', headerText: 'Name', width: 250 },
            { field: 'value', headerText: 'Value', width: 150, textAlign: 'Right' },
        ],
        height: 500,
        allowSorting: true,
        allowSelection: true,
        selectionSettings: { mode: 'Row', type: 'Multiple' },
    },
};
//# sourceMappingURL=TreeGrid.stories.js.map
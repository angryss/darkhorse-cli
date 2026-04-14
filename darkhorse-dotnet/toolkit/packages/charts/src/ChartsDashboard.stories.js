/**
 * Charts Dashboard Stories
 */
import { ChartsDashboard } from './ChartsDashboard';
const meta = {
    title: 'Components/ChartsDashboard',
    component: ChartsDashboard,
    parameters: {
        layout: 'padded',
    },
    tags: ['autodocs'],
};
export default meta;
// Sample data
const salesData = [
    { month: 'Jan', productA: 42000, productB: 35000, productC: 28000 },
    { month: 'Feb', productA: 51000, productB: 38000, productC: 32000 },
    { month: 'Mar', productA: 48000, productB: 42000, productC: 35000 },
    { month: 'Apr', productA: 54000, productB: 45000, productC: 38000 },
    { month: 'May', productA: 59000, productB: 48000, productC: 41000 },
    { month: 'Jun', productA: 62000, productB: 52000, productC: 44000 },
];
const growthData = [
    { week: 'Week 1', users: 1000, revenue: 12000 },
    { week: 'Week 2', users: 1500, revenue: 18500 },
    { week: 'Week 3', users: 2200, revenue: 24000 },
    { week: 'Week 4', users: 2800, revenue: 31000 },
    { week: 'Week 5', users: 3500, revenue: 38000 },
    { week: 'Week 6', users: 4200, revenue: 46000 },
];
const categoryData = [
    { name: 'Electronics', value: 45000, color: '#3b82f6' },
    { name: 'Clothing', value: 32000, color: '#10b981' },
    { name: 'Food', value: 28000, color: '#f59e0b' },
    { name: 'Books', value: 15000, color: '#ef4444' },
    { name: 'Home', value: 22000, color: '#8b5cf6' },
];
// Basic Dashboard
const basicPanels = [
    {
        id: 'revenue',
        title: 'Monthly Revenue',
        chart: {
            type: 'column',
            data: salesData,
            series: [
                { name: 'Product A', xField: 'month', yField: 'productA' },
                { name: 'Product B', xField: 'month', yField: 'productB' },
                { name: 'Product C', xField: 'month', yField: 'productC' },
            ],
            xAxis: { title: 'Month' },
            yAxis: { title: 'Revenue (USD)' },
            legend: { visible: true },
            tooltip: { visible: true },
        },
    },
    {
        id: 'growth',
        title: 'User Growth',
        chart: {
            type: 'splineArea',
            data: growthData,
            series: [{ name: 'Users', xField: 'week', yField: 'users' }],
            xAxis: { title: 'Time Period' },
            yAxis: { title: 'Total Users' },
            legend: { visible: true },
            areaOpacity: 0.3,
            strokeWidth: 3,
            markerVisible: true,
        },
    },
    {
        id: 'categories',
        title: 'Sales by Category',
        chart: {
            type: 'pie',
            data: categoryData,
            innerRadius: 40,
            legend: { visible: true, position: 'Right' },
            dataLabelFormat: '{percentage}%',
        },
    },
];
export const Basic = {
    args: {
        panels: basicPanels,
        grid: { columns: 2, rowHeight: 350, gap: 16 },
        height: 750,
        showPanelBorders: true,
    },
};
// Column Chart Only
export const ColumnChart = {
    args: {
        panels: [
            {
                id: 'sales',
                title: 'Product Sales Comparison',
                chart: {
                    type: 'column',
                    data: salesData,
                    series: [
                        { name: 'Product A', xField: 'month', yField: 'productA', color: '#3b82f6' },
                        { name: 'Product B', xField: 'month', yField: 'productB', color: '#10b981' },
                        { name: 'Product C', xField: 'month', yField: 'productC', color: '#f59e0b' },
                    ],
                    xAxis: { title: 'Month', valueType: 'Category' },
                    yAxis: { title: 'Sales (USD)', min: 0, max: 70000 },
                    legend: { visible: true, position: 'Top' },
                    useGradientFill: true,
                },
                colSpan: 2,
            },
        ],
        grid: { columns: 2, rowHeight: 400, gap: 16 },
        height: 450,
    },
};
// Spline Area Chart
export const SplineAreaChart = {
    args: {
        panels: [
            {
                id: 'metrics',
                title: 'Growth Metrics Over Time',
                chart: {
                    type: 'splineArea',
                    data: growthData,
                    series: [
                        { name: 'Users', xField: 'week', yField: 'users', color: '#3b82f6' },
                        { name: 'Revenue', xField: 'week', yField: 'revenue', color: '#10b981' },
                    ],
                    xAxis: { title: 'Week' },
                    yAxis: { title: 'Count' },
                    legend: { visible: true },
                    areaOpacity: 0.25,
                    strokeWidth: 2,
                    markerVisible: true,
                },
                colSpan: 2,
            },
        ],
        grid: { columns: 2, rowHeight: 400, gap: 16 },
        height: 450,
    },
};
// Pie Chart
export const PieChart = {
    args: {
        panels: [
            {
                id: 'distribution',
                title: 'Revenue Distribution',
                chart: {
                    type: 'pie',
                    data: categoryData,
                    innerRadius: 0, // Full pie
                    legend: { visible: true },
                    dataLabelFormat: '{name}: {percentage}%',
                },
            },
        ],
        grid: { columns: 1, rowHeight: 400, gap: 16 },
        height: 450,
    },
};
// Donut Chart
export const DonutChart = {
    args: {
        panels: [
            {
                id: 'donut',
                title: 'Market Share',
                chart: {
                    type: 'pie',
                    data: categoryData,
                    innerRadius: 50, // Donut style
                    legend: { visible: true },
                    dataLabelFormat: '{percentage}%',
                },
            },
        ],
        grid: { columns: 1, rowHeight: 400, gap: 16 },
        height: 450,
    },
};
// Dark Theme
export const DarkTheme = {
    args: {
        panels: basicPanels,
        grid: { columns: 2, rowHeight: 350, gap: 16 },
        height: 750,
        theme: 'dark',
        showPanelBorders: true,
    },
    parameters: {
        backgrounds: { default: 'dark' },
    },
};
// Responsive Grid
export const ResponsiveGrid = {
    args: {
        panels: basicPanels,
        grid: {
            columns: 3,
            rowHeight: 300,
            gap: 16,
            responsive: [
                { breakpoint: 768, columns: 1 },
                { breakpoint: 1024, columns: 2 },
            ],
        },
        height: 650,
    },
};
// Large Dashboard
const largePanels = [
    {
        id: 'overview',
        title: 'Revenue Overview',
        chart: {
            type: 'column',
            data: salesData,
            series: [
                { name: 'Product A', xField: 'month', yField: 'productA' },
                { name: 'Product B', xField: 'month', yField: 'productB' },
            ],
            xAxis: { title: 'Month' },
            yAxis: { title: 'Revenue' },
            legend: { visible: true },
            useGradientFill: true,
        },
        colSpan: 2,
    },
    {
        id: 'users',
        title: 'User Growth',
        chart: {
            type: 'splineArea',
            data: growthData,
            series: [{ name: 'Users', xField: 'week', yField: 'users' }],
            xAxis: { title: 'Week' },
            yAxis: { title: 'Users' },
            areaOpacity: 0.3,
            markerVisible: true,
        },
    },
    {
        id: 'categories',
        title: 'Categories',
        chart: {
            type: 'pie',
            data: categoryData,
            innerRadius: 40,
            legend: { visible: true },
        },
    },
    {
        id: 'revenue-trend',
        title: 'Revenue Trend',
        chart: {
            type: 'splineArea',
            data: growthData,
            series: [{ name: 'Revenue', xField: 'week', yField: 'revenue' }],
            xAxis: { title: 'Week' },
            yAxis: { title: 'Revenue' },
            areaOpacity: 0.3,
            strokeWidth: 2,
        },
    },
    {
        id: 'comparison',
        title: 'Product Comparison',
        chart: {
            type: 'column',
            data: salesData.slice(0, 4),
            series: [
                { name: 'Product A', xField: 'month', yField: 'productA' },
                { name: 'Product C', xField: 'month', yField: 'productC' },
            ],
            xAxis: { title: 'Month' },
            yAxis: { title: 'Sales' },
            legend: { visible: true },
        },
    },
];
export const LargeDashboard = {
    args: {
        panels: largePanels,
        grid: { columns: 2, rowHeight: 300, gap: 16 },
        height: 950,
    },
};
// Without Borders
export const WithoutBorders = {
    args: {
        panels: basicPanels,
        grid: { columns: 2, rowHeight: 350, gap: 24 },
        height: 750,
        showPanelBorders: false,
    },
};
//# sourceMappingURL=ChartsDashboard.stories.js.map
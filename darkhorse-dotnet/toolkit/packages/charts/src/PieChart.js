import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Pie/Donut Chart Component
 */
import { useMemo } from 'react';
import { calculatePercentage, calculatePieSlicePath, calculatePieLabelPosition, getChartColors } from './utils';
export const PieChart = ({ config, width, height, theme = 'light', onError, }) => {
    const chartData = useMemo(() => {
        try {
            const { data } = config;
            const total = data.reduce((sum, slice) => sum + slice.value, 0);
            let currentAngle = -Math.PI / 2; // Start at top
            const slices = data.map((slice) => {
                const percentage = calculatePercentage(slice.value, total);
                const angle = (percentage / 100) * 2 * Math.PI;
                const startAngle = currentAngle;
                const endAngle = currentAngle + angle;
                const midAngle = currentAngle + angle / 2;
                currentAngle = endAngle;
                return {
                    ...slice,
                    percentage,
                    startAngle,
                    endAngle,
                    midAngle,
                };
            });
            return { slices, total };
        }
        catch (error) {
            onError?.(error);
            return null;
        }
    }, [config, onError]);
    if (!chartData) {
        return (_jsx("div", { style: { width, height, display: 'flex', alignItems: 'center', justifyContent: 'center' }, children: _jsx("span", { children: "Error loading chart" }) }));
    }
    const { innerRadius = 0, legend, dataLabelFormat = '{percentage}%' } = config;
    const { slices, total } = chartData;
    // Chart dimensions
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 60;
    const actualInnerRadius = (innerRadius / 100) * radius;
    // Colors
    const colors = useMemo(() => {
        const themeType = theme === 'dark' ? 'dark' : 'light';
        return slices.map((s, i) => s.color || getChartColors(slices.length, themeType)[i]);
    }, [slices, theme]);
    return (_jsxs("svg", { width: width, height: height, children: [_jsxs("g", { children: [slices.map((slice, i) => {
                        const path = calculatePieSlicePath(centerX, centerY, radius, actualInnerRadius, slice.startAngle, slice.endAngle);
                        return (_jsx("path", { d: path, fill: colors[i], stroke: theme === 'dark' ? '#1f2937' : '#ffffff', strokeWidth: 2, opacity: 0.9, children: _jsx("title", { children: slice.tooltipText || `${slice.name}: ${slice.value} (${slice.percentage.toFixed(1)}%)` }) }, i));
                    }), slices.map((slice, i) => {
                        const labelPos = calculatePieLabelPosition(centerX, centerY, radius, slice.midAngle, 20);
                        const lineEndPos = calculatePieLabelPosition(centerX, centerY, radius, slice.midAngle, 0);
                        const textAnchor = labelPos.x > centerX ? 'start' : 'end';
                        let labelText = dataLabelFormat
                            .replace('{name}', slice.name)
                            .replace('{value}', slice.value.toString())
                            .replace('{percentage}', slice.percentage.toFixed(1));
                        if (slice.percentage < 5)
                            return null; // Skip labels for small slices
                        return (_jsxs("g", { children: [_jsx("line", { x1: lineEndPos.x, y1: lineEndPos.y, x2: labelPos.x, y2: labelPos.y, stroke: theme === 'dark' ? '#6b7280' : '#9ca3af', strokeWidth: 1 }), _jsx("text", { x: labelPos.x, y: labelPos.y, textAnchor: textAnchor, dominantBaseline: "middle", fill: theme === 'dark' ? '#d1d5db' : '#4b5563', fontSize: 12, fontWeight: "500", children: labelText })] }, i));
                    }), innerRadius > 0 && (_jsxs("g", { children: [_jsx("text", { x: centerX, y: centerY - 10, textAnchor: "middle", fill: theme === 'dark' ? '#d1d5db' : '#4b5563', fontSize: 24, fontWeight: "700", children: total }), _jsx("text", { x: centerX, y: centerY + 15, textAnchor: "middle", fill: theme === 'dark' ? '#9ca3af' : '#6b7280', fontSize: 14, children: "Total" })] }))] }), legend?.visible && (_jsx("g", { transform: `translate(10, ${height - slices.length * 25 - 10})`, children: slices.map((slice, i) => (_jsxs("g", { transform: `translate(0, ${i * 25})`, children: [_jsx("rect", { x: 0, y: 0, width: 12, height: 12, fill: colors[i], rx: 2 }), _jsx("text", { x: 18, y: 10, fill: theme === 'dark' ? '#d1d5db' : '#4b5563', fontSize: 12, children: slice.name })] }, i))) }))] }));
};
//# sourceMappingURL=PieChart.js.map
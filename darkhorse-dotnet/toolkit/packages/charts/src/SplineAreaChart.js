import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Spline Area Chart Component
 */
import { useMemo } from 'react';
import { calculateScale, getChartColors, formatNumber, generateSplinePath } from './utils';
export const SplineAreaChart = ({ config, width, height, theme = 'light', onError, }) => {
    const chartData = useMemo(() => {
        try {
            const { data, series, yAxis } = config;
            // Extract all y values
            const allYValues = [];
            series.forEach(s => {
                data.forEach(d => {
                    const value = d[s.yField];
                    if (typeof value === 'number') {
                        allYValues.push(value);
                    }
                });
            });
            const minValue = Math.min(...allYValues, 0);
            const maxValue = Math.max(...allYValues);
            const scale = calculateScale(yAxis.min ?? minValue, yAxis.max ?? maxValue);
            return { scale, minValue, maxValue };
        }
        catch (error) {
            onError?.(error);
            return null;
        }
    }, [config, onError]);
    if (!chartData) {
        return (_jsx("div", { style: { width, height, display: 'flex', alignItems: 'center', justifyContent: 'center' }, children: _jsx("span", { children: "Error loading chart" }) }));
    }
    const { data, series, yAxis, legend, areaOpacity = 0.3, strokeWidth = 2, markerVisible = true, } = config;
    const { scale } = chartData;
    // Chart dimensions
    const margin = { top: 20, right: 20, bottom: 50, left: 60 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
    // Colors
    const colors = useMemo(() => {
        const themeType = theme === 'dark' ? 'dark' : 'light';
        return series.map((s, i) => s.color || getChartColors(series.length, themeType)[i]);
    }, [series, theme]);
    // Scale functions
    const xScale = (index) => (index / (data.length - 1)) * chartWidth;
    const yScale = (value) => {
        const range = scale.max - scale.min;
        return chartHeight - ((value - scale.min) / range) * chartHeight;
    };
    return (_jsxs("svg", { width: width, height: height, children: [_jsx("defs", { children: colors.map((color, i) => (_jsxs("linearGradient", { id: `area-gradient-${i}`, x1: "0%", y1: "0%", x2: "0%", y2: "100%", children: [_jsx("stop", { offset: "0%", style: { stopColor: color, stopOpacity: areaOpacity } }), _jsx("stop", { offset: "100%", style: { stopColor: color, stopOpacity: 0.1 } })] }, i))) }), _jsxs("g", { transform: `translate(${margin.left}, ${margin.top})`, children: [!yAxis.hideGridLines && scale.ticks.map((tick, i) => (_jsx("line", { x1: 0, y1: yScale(tick), x2: chartWidth, y2: yScale(tick), stroke: theme === 'dark' ? '#374151' : '#e5e7eb', strokeWidth: 1 }, i))), _jsx("line", { x1: 0, y1: 0, x2: 0, y2: chartHeight, stroke: theme === 'dark' ? '#6b7280' : '#9ca3af', strokeWidth: 2 }), scale.ticks.map((tick, i) => (_jsx("text", { x: -10, y: yScale(tick), textAnchor: "end", dominantBaseline: "middle", fill: theme === 'dark' ? '#d1d5db' : '#4b5563', fontSize: 12, children: formatNumber(tick) }, i))), yAxis.title && (_jsx("text", { x: -chartHeight / 2, y: -40, transform: "rotate(-90)", textAnchor: "middle", fill: theme === 'dark' ? '#d1d5db' : '#4b5563', fontSize: 14, fontWeight: "600", children: yAxis.title })), _jsx("line", { x1: 0, y1: chartHeight, x2: chartWidth, y2: chartHeight, stroke: theme === 'dark' ? '#6b7280' : '#9ca3af', strokeWidth: 2 }), series.map((s, seriesIndex) => {
                        const points = data.map((item, i) => ({
                            x: xScale(i),
                            y: yScale(item[s.yField]),
                        }));
                        const linePath = generateSplinePath(points);
                        const areaPath = linePath + ` L ${xScale(data.length - 1)} ${chartHeight} L 0 ${chartHeight} Z`;
                        return (_jsxs("g", { children: [_jsx("path", { d: areaPath, fill: `url(#area-gradient-${seriesIndex})` }), _jsx("path", { d: linePath, fill: "none", stroke: colors[seriesIndex], strokeWidth: strokeWidth }), markerVisible && points.map((point, i) => (_jsx("circle", { cx: point.x, cy: point.y, r: 4, fill: colors[seriesIndex], stroke: theme === 'dark' ? '#1f2937' : '#ffffff', strokeWidth: 2, children: _jsx("title", { children: `${s.name}: ${formatNumber(data[i][s.yField])}` }) }, i)))] }, seriesIndex));
                    }), data.map((item, i) => {
                        const showLabel = i % Math.ceil(data.length / 8) === 0 || i === data.length - 1;
                        if (!showLabel)
                            return null;
                        const firstSeries = series[0];
                        if (!firstSeries)
                            return null;
                        return (_jsx("text", { x: xScale(i), y: chartHeight + 20, textAnchor: "middle", fill: theme === 'dark' ? '#d1d5db' : '#4b5563', fontSize: 12, children: String(item[firstSeries.xField]) }, i));
                    }), config.xAxis.title && (_jsx("text", { x: chartWidth / 2, y: chartHeight + 40, textAnchor: "middle", fill: theme === 'dark' ? '#d1d5db' : '#4b5563', fontSize: 14, fontWeight: "600", children: config.xAxis.title }))] }), legend?.visible && (_jsx("g", { transform: `translate(${width / 2 - (series.length * 100) / 2}, ${height - 10})`, children: series.map((s, i) => (_jsxs("g", { transform: `translate(${i * 100}, 0)`, children: [_jsx("rect", { x: 0, y: -10, width: 12, height: 12, fill: colors[i], rx: 2 }), _jsx("text", { x: 18, y: 0, fill: theme === 'dark' ? '#d1d5db' : '#4b5563', fontSize: 12, children: s.name })] }, i))) }))] }));
};
//# sourceMappingURL=SplineAreaChart.js.map
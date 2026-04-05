/**
 * Spline Area Chart Component
 */

import React, { useMemo } from 'react';
import type { SplineAreaChartConfig, BaseChartProps } from './types';
import { calculateScale, getChartColors, formatNumber, generateSplinePath } from './utils';

interface SplineAreaChartProps extends Omit<BaseChartProps, 'config'> {
  config: SplineAreaChartConfig;
}

export const SplineAreaChart: React.FC<SplineAreaChartProps> = ({
  config,
  width,
  height,
  theme = 'light',
  onError,
}) => {
  const chartData = useMemo(() => {
    try {
      const { data, series, yAxis } = config;
      
      // Extract all y values
      const allYValues: number[] = [];
      series.forEach(s => {
        data.forEach(d => {
          const value = d[s.yField] as number;
          if (typeof value === 'number') {
            allYValues.push(value);
          }
        });
      });
      
      const minValue = Math.min(...allYValues, 0);
      const maxValue = Math.max(...allYValues);
      
      const scale = calculateScale(
        yAxis.min ?? minValue,
        yAxis.max ?? maxValue
      );
      
      return { scale, minValue, maxValue };
    } catch (error) {
      onError?.(error);
      return null;
    }
  }, [config, onError]);

  if (!chartData) {
    return (
      <div style={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span>Error loading chart</span>
      </div>
    );
  }

  const {
    data,
    series,
    yAxis,
    legend,
    areaOpacity = 0.3,
    strokeWidth = 2,
    markerVisible = true,
  } = config;
  const { scale } = chartData;
  
  // Chart dimensions
  const margin = { top: 20, right: 20, bottom: 50, left: 60 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;
  
  // Colors
  const colors = useMemo(() => {
    const themeType: 'light' | 'dark' = theme === 'dark' ? 'dark' : 'light';
    return series.map((s, i) => s.color || getChartColors(series.length, themeType)[i]);
  }, [series, theme]);
  
  // Scale functions
  const xScale = (index: number) => (index / (data.length - 1)) * chartWidth;
  const yScale = (value: number) => {
    const range = scale.max - scale.min;
    return chartHeight - ((value - scale.min) / range) * chartHeight;
  };

  return (
    <svg width={width} height={height}>
      {/* Gradient definitions for areas */}
      <defs>
        {colors.map((color, i) => (
          <linearGradient key={i} id={`area-gradient-${i}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: color, stopOpacity: areaOpacity }} />
            <stop offset="100%" style={{ stopColor: color, stopOpacity: 0.1 }} />
          </linearGradient>
        ))}
      </defs>
      
      <g transform={`translate(${margin.left}, ${margin.top})`}>
        {/* Grid lines */}
        {!yAxis.hideGridLines && scale.ticks.map((tick, i) => (
          <line
            key={i}
            x1={0}
            y1={yScale(tick)}
            x2={chartWidth}
            y2={yScale(tick)}
            stroke={theme === 'dark' ? '#374151' : '#e5e7eb'}
            strokeWidth={1}
          />
        ))}
        
        {/* Y axis */}
        <line
          x1={0}
          y1={0}
          x2={0}
          y2={chartHeight}
          stroke={theme === 'dark' ? '#6b7280' : '#9ca3af'}
          strokeWidth={2}
        />
        
        {/* Y axis labels */}
        {scale.ticks.map((tick, i) => (
          <text
            key={i}
            x={-10}
            y={yScale(tick)}
            textAnchor="end"
            dominantBaseline="middle"
            fill={theme === 'dark' ? '#d1d5db' : '#4b5563'}
            fontSize={12}
          >
            {formatNumber(tick)}
          </text>
        ))}
        
        {/* Y axis title */}
        {yAxis.title && (
          <text
            x={-chartHeight / 2}
            y={-40}
            transform="rotate(-90)"
            textAnchor="middle"
            fill={theme === 'dark' ? '#d1d5db' : '#4b5563'}
            fontSize={14}
            fontWeight="600"
          >
            {yAxis.title}
          </text>
        )}
        
        {/* X axis */}
        <line
          x1={0}
          y1={chartHeight}
          x2={chartWidth}
          y2={chartHeight}
          stroke={theme === 'dark' ? '#6b7280' : '#9ca3af'}
          strokeWidth={2}
        />
        
        {/* Series */}
        {series.map((s, seriesIndex) => {
          const points = data.map((item, i) => ({
            x: xScale(i),
            y: yScale(item[s.yField] as number),
          }));
          
          const linePath = generateSplinePath(points);
          const areaPath = linePath + ` L ${xScale(data.length - 1)} ${chartHeight} L 0 ${chartHeight} Z`;
          
          return (
            <g key={seriesIndex}>
              {/* Area fill */}
              <path
                d={areaPath}
                fill={`url(#area-gradient-${seriesIndex})`}
              />
              
              {/* Line */}
              <path
                d={linePath}
                fill="none"
                stroke={colors[seriesIndex]}
                strokeWidth={strokeWidth}
              />
              
              {/* Markers */}
              {markerVisible && points.map((point, i) => (
                <circle
                  key={i}
                  cx={point.x}
                  cy={point.y}
                  r={4}
                  fill={colors[seriesIndex]}
                  stroke={theme === 'dark' ? '#1f2937' : '#ffffff'}
                  strokeWidth={2}
                >
                  <title>{`${s.name}: ${formatNumber(data[i][s.yField] as number)}`}</title>
                </circle>
              ))}
            </g>
          );
        })}
        
        {/* X axis labels */}
        {data.map((item, i) => {
          const showLabel = i % Math.ceil(data.length / 8) === 0 || i === data.length - 1;
          if (!showLabel) return null;
          
          const firstSeries = series[0];
          if (!firstSeries) return null;
          
          return (
            <text
              key={i}
              x={xScale(i)}
              y={chartHeight + 20}
              textAnchor="middle"
              fill={theme === 'dark' ? '#d1d5db' : '#4b5563'}
              fontSize={12}
            >
              {String(item[firstSeries.xField])}
            </text>
          );
        })}
        
        {/* X axis title */}
        {config.xAxis.title && (
          <text
            x={chartWidth / 2}
            y={chartHeight + 40}
            textAnchor="middle"
            fill={theme === 'dark' ? '#d1d5db' : '#4b5563'}
            fontSize={14}
            fontWeight="600"
          >
            {config.xAxis.title}
          </text>
        )}
      </g>
      
      {/* Legend */}
      {legend?.visible && (
        <g transform={`translate(${width / 2 - (series.length * 100) / 2}, ${height - 10})`}>
          {series.map((s, i) => (
            <g key={i} transform={`translate(${i * 100}, 0)`}>
              <rect
                x={0}
                y={-10}
                width={12}
                height={12}
                fill={colors[i]}
                rx={2}
              />
              <text
                x={18}
                y={0}
                fill={theme === 'dark' ? '#d1d5db' : '#4b5563'}
                fontSize={12}
              >
                {s.name}
              </text>
            </g>
          ))}
        </g>
      )}
    </svg>
  );
};


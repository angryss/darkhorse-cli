/**
 * Pie/Donut Chart Component
 */
import React from 'react';
import type { PieChartConfig, BaseChartProps } from './types';
interface PieChartProps extends Omit<BaseChartProps, 'config'> {
    config: PieChartConfig;
}
export declare const PieChart: React.FC<PieChartProps>;
export {};
//# sourceMappingURL=PieChart.d.ts.map
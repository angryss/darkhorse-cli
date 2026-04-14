/**
 * Column Chart Component
 */
import React from 'react';
import type { ColumnChartConfig, BaseChartProps } from './types';
interface ColumnChartProps extends Omit<BaseChartProps, 'config'> {
    config: ColumnChartConfig;
}
export declare const ColumnChart: React.FC<ColumnChartProps>;
export {};
//# sourceMappingURL=ColumnChart.d.ts.map
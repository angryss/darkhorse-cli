/**
 * Spline Area Chart Component
 */
import React from 'react';
import type { SplineAreaChartConfig, BaseChartProps } from './types';
interface SplineAreaChartProps extends Omit<BaseChartProps, 'config'> {
    config: SplineAreaChartConfig;
}
export declare const SplineAreaChart: React.FC<SplineAreaChartProps>;
export {};
//# sourceMappingURL=SplineAreaChart.d.ts.map
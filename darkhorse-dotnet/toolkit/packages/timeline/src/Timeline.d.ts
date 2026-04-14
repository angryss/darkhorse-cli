/**
 * Timeline Component
 * Visualizes ordered events or milestones in vertical or horizontal layout
 */
import React from 'react';
import { TimelineProps } from './types';
/**
 * Timeline component for displaying ordered events and milestones
 *
 * @example
 * ```tsx
 * <Timeline
 *   items={[
 *     { id: '1', label: 'Order Placed', status: 'completed', timestamp: '2025-01-01' },
 *     { id: '2', label: 'Processing', status: 'inProgress', timestamp: '2025-01-02' },
 *     { id: '3', label: 'Shipped', status: 'pending' },
 *   ]}
 *   orientation="vertical"
 *   variant="detailed"
 * />
 * ```
 */
export declare const Timeline: React.FC<TimelineProps>;
export default Timeline;
//# sourceMappingURL=Timeline.d.ts.map
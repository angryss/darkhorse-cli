/**
 * Charts Dashboard Component
 * Main component that renders multiple chart panels in a responsive grid
 */

import React, { useState, useEffect, useRef, forwardRef } from 'react';
import { cn } from './utils';
import type { ChartsDashboardProps, DashboardPanel } from './types';
import { ColumnChart } from './ColumnChart';
import { SplineAreaChart } from './SplineAreaChart';
import { PieChart } from './PieChart';
import styles from './ChartsDashboard.module.css';

/**
 * ChartsDashboard component for displaying multiple charts in a grid
 */
export const ChartsDashboard = forwardRef<HTMLDivElement, ChartsDashboardProps>(
  (
    {
      id,
      panels,
      grid = { columns: 2, rowHeight: 300, gap: 16 },
      height,
      width = '100%',
      showPanelBorders = true,
      theme = 'light',
      onPanelClick,
      onError,
      className,
      style,
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [columns, setColumns] = useState(grid.columns);
    const [panelDimensions, setPanelDimensions] = useState<Map<string, { width: number; height: number }>>(new Map());

    // Handle responsive breakpoints
    useEffect(() => {
      if (!grid.responsive) return;

      const handleResize = () => {
        const containerWidth = containerRef.current?.offsetWidth || 0;
        
        // Find the appropriate column count for current width
        let newColumns = grid.columns;
        if (grid.responsive) {
          for (const breakpoint of grid.responsive) {
            if (containerWidth <= breakpoint.breakpoint) {
              newColumns = breakpoint.columns;
              break;
            }
          }
        }
        
        setColumns(newColumns);
      };

      handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, [grid]);

    // Calculate panel dimensions
    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      const containerWidth = container.offsetWidth;
      const gap = grid.gap || 0;
      const availableWidth = containerWidth - gap * (columns - 1);
      const panelWidth = availableWidth / columns;
      const panelHeight = grid.rowHeight || 300;

      const newDimensions = new Map();
      panels.forEach(panel => {
        const colSpan = Math.min(panel.colSpan || 1, columns);
        const rowSpan = panel.rowSpan || 1;
        
        newDimensions.set(panel.id, {
          width: panelWidth * colSpan + gap * (colSpan - 1),
          height: panelHeight * rowSpan + gap * (rowSpan - 1),
        });
      });

      setPanelDimensions(newDimensions);
    }, [panels, columns, grid]);

    // Render appropriate chart component
    const renderChart = (panel: DashboardPanel) => {
      try {
        const dimensions = panelDimensions.get(panel.id);
        if (!dimensions) return null;

        const chartWidth = dimensions.width - 32; // Account for padding
        const chartHeight = dimensions.height - (panel.title ? 72 : 40); // Account for padding and title

        const baseProps = {
          width: chartWidth,
          height: chartHeight,
          theme,
          onError,
        };

        switch (panel.chart.type) {
          case 'column':
            return <ColumnChart config={panel.chart} {...baseProps} />;
          case 'splineArea':
            return <SplineAreaChart config={panel.chart} {...baseProps} />;
          case 'pie':
            return <PieChart config={panel.chart} {...baseProps} />;
          default:
            return <div>Unknown chart type</div>;
        }
      } catch (error) {
        onError?.(error);
        return (
          <div className={styles.chartError}>
            <span>Error rendering chart</span>
          </div>
        );
      }
    };

    // Calculate grid template
    const gridStyle: React.CSSProperties = {
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gap: `${grid.gap || 0}px`,
    };

    return (
      <div
        ref={ref}
        id={id}
        className={cn(
          styles.dashboard,
          theme === 'dark' && styles.dark,
          className
        )}
        style={{ ...style, height, width }}
      >
        <div
          ref={containerRef}
          className={styles.grid}
          style={gridStyle}
        >
          {panels.map(panel => {
            const colSpan = Math.min(panel.colSpan || 1, columns);
            const rowSpan = panel.rowSpan || 1;

            return (
              <div
                key={panel.id}
                className={cn(
                  styles.panel,
                  showPanelBorders && styles.bordered,
                  onPanelClick && styles.clickable
                )}
                style={{
                  gridColumn: `span ${colSpan}`,
                  gridRow: `span ${rowSpan}`,
                }}
                onClick={() => onPanelClick?.(panel)}
              >
                {panel.title && (
                  <div className={styles.panelHeader}>
                    <h3 className={styles.panelTitle}>{panel.title}</h3>
                  </div>
                )}
                <div className={styles.panelBody}>
                  {renderChart(panel)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);

ChartsDashboard.displayName = 'ChartsDashboard';


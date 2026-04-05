/**
 * TreeMap Component
 * Hierarchical treemap visualization
 */

import { useMemo, useState, forwardRef } from 'react';
import type { TreeMapProps, TreeMapRect, TreeMapDataItem, TreeMapNode } from './types';
import { buildHierarchy, layoutTreeMap, flattenRects } from './treemapAlgorithm';
import { getColor, cn } from './utils';
import styles from './TreeMap.module.css';

/**
 * TreeMap component for hierarchical data visualization
 */
export const TreeMap = forwardRef<HTMLDivElement, TreeMapProps>(
  (
    {
      id,
      data,
      parentIdPath = 'parentId',
      colorPath,
      title,
      legend,
      tooltip,
      colorScale = 'byGroup',
      palette,
      rangeColors,
      showBorder = true,
      borderColor = '#fff',
      borderWidth = 2,
      gap = 2,
      drillDown = true,
      height = 600,
      width = '100%',
      onItemClick,
      onItemHover,
      onError,
      className,
      style,
    },
    ref
  ) => {
    const [hoveredItem, setHoveredItem] = useState<TreeMapDataItem | null>(null);
    const [drillPath, setDrillPath] = useState<TreeMapDataItem[]>([]);
    const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

    // Get current drill level data
    const currentData = useMemo(() => {
      if (drillPath.length === 0) return data;
      
      const currentParent = drillPath[drillPath.length - 1];
      if (!currentParent) return data;
      
      return data.filter(item => item[parentIdPath] === currentParent.id);
    }, [data, drillPath, parentIdPath]);

    // Build hierarchy and layout
    const { rects, totalValue } = useMemo(() => {
      try {
        const hierarchy = buildHierarchy(currentData, parentIdPath);
        const total = hierarchy.reduce((sum, node) => sum + node.totalValue, 0);

        const colorFn = (node: TreeMapNode, depth: number) =>
          getColor(node, depth, colorScale, palette, rangeColors, colorPath as string | undefined);

        const layoutRects = layoutTreeMap(
          hierarchy,
          0,
          0,
          typeof width === 'number' ? width : 800,
          typeof height === 'number' ? height : 600,
          0,
          gap,
          colorFn
        );

        return { rects: flattenRects(layoutRects), totalValue: total };
      } catch (error) {
        onError?.(error);
        return { rects: [], totalValue: 0 };
      }
    }, [currentData, parentIdPath, width, height, gap, colorScale, palette, rangeColors, colorPath, onError]);

    // Handle rectangle click
    const handleClick = (rect: TreeMapRect) => {
      onItemClick?.(rect.item);

      if (drillDown && rect.children && rect.children.length > 0) {
        setDrillPath([...drillPath, rect.item]);
      }
    };

    // Handle rectangle hover
    const handleMouseEnter = (rect: TreeMapRect, event: React.MouseEvent) => {
      setHoveredItem(rect.item);
      setTooltipPos({ x: event.clientX, y: event.clientY });
      onItemHover?.(rect.item);
    };

    const handleMouseLeave = () => {
      setHoveredItem(null);
      setTooltipPos(null);
      onItemHover?.(null);
    };

    // Handle breadcrumb click
    const handleBreadcrumbClick = (index: number) => {
      if (index === -1) {
        setDrillPath([]);
      } else {
        setDrillPath(drillPath.slice(0, index + 1));
      }
    };

    // Empty state
    if (data.length === 0 || totalValue === 0) {
      return (
        <div
          ref={ref}
          id={id}
          className={cn(styles.treeMap, styles.empty, className)}
          style={{ ...style, height, width }}
        >
          <div className={styles.emptyState}>No data available</div>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        id={id}
        className={cn(styles.treeMap, className)}
        style={{ ...style, height, width }}
      >
        {/* Title */}
        {title && (
          <div
            className={styles.title}
            style={{
              fontSize: title.fontSize,
              fontWeight: title.fontWeight,
            }}
          >
            {title.text}
          </div>
        )}

        {/* Breadcrumb navigation */}
        {drillDown && drillPath.length > 0 && (
          <div className={styles.breadcrumb}>
            <button
              className={styles.breadcrumbItem}
              onClick={() => handleBreadcrumbClick(-1)}
            >
              Home
            </button>
            {drillPath.map((item, index) => (
              <span key={item.id}>
                <span className={styles.breadcrumbSeparator}>/</span>
                <button
                  className={styles.breadcrumbItem}
                  onClick={() => handleBreadcrumbClick(index)}
                >
                  {item.label}
                </button>
              </span>
            ))}
          </div>
        )}

        {/* SVG Treemap */}
        <svg
          className={styles.svg}
          viewBox={`0 0 ${typeof width === 'number' ? width : 800} ${typeof height === 'number' ? height : 600}`}
          preserveAspectRatio="xMidYMid meet"
        >
          {rects.map((rect, index) => {
            const isHovered = hoveredItem?.id === rect.item.id;
            const canShowLabel = rect.width > 40 && rect.height > 20;

            return (
              <g key={`${rect.item.id}-${index}`}>
                <rect
                  x={rect.x}
                  y={rect.y}
                  width={rect.width}
                  height={rect.height}
                  fill={rect.color}
                  stroke={showBorder ? borderColor : 'none'}
                  strokeWidth={showBorder ? borderWidth : 0}
                  className={cn(
                    styles.rect,
                    isHovered && styles.hovered,
                    rect.children && rect.children.length > 0 && styles.hasChildren
                  )}
                  onClick={() => handleClick(rect)}
                  onMouseEnter={(e) => handleMouseEnter(rect, e)}
                  onMouseLeave={handleMouseLeave}
                  role="button"
                  tabIndex={0}
                  aria-label={`${rect.item.label}: ${rect.item.value}`}
                />
                {canShowLabel && (
                  <text
                    x={rect.x + rect.width / 2}
                    y={rect.y + rect.height / 2}
                    className={styles.label}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    pointerEvents="none"
                  >
                    {rect.item.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Tooltip */}
        {tooltip?.visible && hoveredItem && tooltipPos && (
          <div
            className={styles.tooltip}
            style={{
              left: tooltipPos.x + 10,
              top: tooltipPos.y + 10,
            }}
          >
            {tooltip.template ? (
              tooltip.template(hoveredItem)
            ) : (
              <div>
                <div className={styles.tooltipLabel}>{hoveredItem.label}</div>
                <div className={styles.tooltipValue}>
                  {tooltip.useGroupingSeparator !== false
                    ? hoveredItem.value?.toLocaleString()
                    : hoveredItem.value}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Legend */}
        {legend?.visible && rangeColors && (
          <div
            className={cn(
              styles.legend,
              legend.position === 'Top' ? styles.legendTop : undefined,
              legend.position === 'Bottom' ? styles.legendBottom : undefined
            )}
          >
            {rangeColors.map((range, index) => (
              <div key={index} className={styles.legendItem}>
                <div
                  className={styles.legendColor}
                  style={{ backgroundColor: range.color }}
                />
                <div className={styles.legendLabel}>
                  {range.label || `${range.from} - ${range.to}`}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
);

TreeMap.displayName = 'TreeMap';


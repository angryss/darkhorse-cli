import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * TreeMap Component
 * Hierarchical treemap visualization
 */
import { useMemo, useState, forwardRef } from 'react';
import { buildHierarchy, layoutTreeMap, flattenRects } from './treemapAlgorithm';
import { getColor, cn } from './utils';
import styles from './TreeMap.module.css';
/**
 * TreeMap component for hierarchical data visualization
 */
export const TreeMap = forwardRef(({ id, data, parentIdPath = 'parentId', colorPath, title, legend, tooltip, colorScale = 'byGroup', palette, rangeColors, showBorder = true, borderColor = '#fff', borderWidth = 2, gap = 2, drillDown = true, height = 600, width = '100%', onItemClick, onItemHover, onError, className, style, }, ref) => {
    const [hoveredItem, setHoveredItem] = useState(null);
    const [drillPath, setDrillPath] = useState([]);
    const [tooltipPos, setTooltipPos] = useState(null);
    // Get current drill level data
    const currentData = useMemo(() => {
        if (drillPath.length === 0)
            return data;
        const currentParent = drillPath[drillPath.length - 1];
        if (!currentParent)
            return data;
        return data.filter(item => item[parentIdPath] === currentParent.id);
    }, [data, drillPath, parentIdPath]);
    // Build hierarchy and layout
    const { rects, totalValue } = useMemo(() => {
        try {
            const hierarchy = buildHierarchy(currentData, parentIdPath);
            const total = hierarchy.reduce((sum, node) => sum + node.totalValue, 0);
            const colorFn = (node, depth) => getColor(node, depth, colorScale, palette, rangeColors, colorPath);
            const layoutRects = layoutTreeMap(hierarchy, 0, 0, typeof width === 'number' ? width : 800, typeof height === 'number' ? height : 600, 0, gap, colorFn);
            return { rects: flattenRects(layoutRects), totalValue: total };
        }
        catch (error) {
            onError?.(error);
            return { rects: [], totalValue: 0 };
        }
    }, [currentData, parentIdPath, width, height, gap, colorScale, palette, rangeColors, colorPath, onError]);
    // Handle rectangle click
    const handleClick = (rect) => {
        onItemClick?.(rect.item);
        if (drillDown && rect.children && rect.children.length > 0) {
            setDrillPath([...drillPath, rect.item]);
        }
    };
    // Handle rectangle hover
    const handleMouseEnter = (rect, event) => {
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
    const handleBreadcrumbClick = (index) => {
        if (index === -1) {
            setDrillPath([]);
        }
        else {
            setDrillPath(drillPath.slice(0, index + 1));
        }
    };
    // Empty state
    if (data.length === 0 || totalValue === 0) {
        return (_jsx("div", { ref: ref, id: id, className: cn(styles.treeMap, styles.empty, className), style: { ...style, height, width }, children: _jsx("div", { className: styles.emptyState, children: "No data available" }) }));
    }
    return (_jsxs("div", { ref: ref, id: id, className: cn(styles.treeMap, className), style: { ...style, height, width }, children: [title && (_jsx("div", { className: styles.title, style: {
                    fontSize: title.fontSize,
                    fontWeight: title.fontWeight,
                }, children: title.text })), drillDown && drillPath.length > 0 && (_jsxs("div", { className: styles.breadcrumb, children: [_jsx("button", { className: styles.breadcrumbItem, onClick: () => handleBreadcrumbClick(-1), children: "Home" }), drillPath.map((item, index) => (_jsxs("span", { children: [_jsx("span", { className: styles.breadcrumbSeparator, children: "/" }), _jsx("button", { className: styles.breadcrumbItem, onClick: () => handleBreadcrumbClick(index), children: item.label })] }, item.id)))] })), _jsx("svg", { className: styles.svg, viewBox: `0 0 ${typeof width === 'number' ? width : 800} ${typeof height === 'number' ? height : 600}`, preserveAspectRatio: "xMidYMid meet", children: rects.map((rect, index) => {
                    const isHovered = hoveredItem?.id === rect.item.id;
                    const canShowLabel = rect.width > 40 && rect.height > 20;
                    return (_jsxs("g", { children: [_jsx("rect", { x: rect.x, y: rect.y, width: rect.width, height: rect.height, fill: rect.color, stroke: showBorder ? borderColor : 'none', strokeWidth: showBorder ? borderWidth : 0, className: cn(styles.rect, isHovered && styles.hovered, rect.children && rect.children.length > 0 && styles.hasChildren), onClick: () => handleClick(rect), onMouseEnter: (e) => handleMouseEnter(rect, e), onMouseLeave: handleMouseLeave, role: "button", tabIndex: 0, "aria-label": `${rect.item.label}: ${rect.item.value}` }), canShowLabel && (_jsx("text", { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2, className: styles.label, textAnchor: "middle", dominantBaseline: "middle", pointerEvents: "none", children: rect.item.label }))] }, `${rect.item.id}-${index}`));
                }) }), tooltip?.visible && hoveredItem && tooltipPos && (_jsx("div", { className: styles.tooltip, style: {
                    left: tooltipPos.x + 10,
                    top: tooltipPos.y + 10,
                }, children: tooltip.template ? (tooltip.template(hoveredItem)) : (_jsxs("div", { children: [_jsx("div", { className: styles.tooltipLabel, children: hoveredItem.label }), _jsx("div", { className: styles.tooltipValue, children: tooltip.useGroupingSeparator !== false
                                ? hoveredItem.value?.toLocaleString()
                                : hoveredItem.value })] })) })), legend?.visible && rangeColors && (_jsx("div", { className: cn(styles.legend, legend.position === 'Top' ? styles.legendTop : undefined, legend.position === 'Bottom' ? styles.legendBottom : undefined), children: rangeColors.map((range, index) => (_jsxs("div", { className: styles.legendItem, children: [_jsx("div", { className: styles.legendColor, style: { backgroundColor: range.color } }), _jsx("div", { className: styles.legendLabel, children: range.label || `${range.from} - ${range.to}` })] }, index))) }))] }));
});
TreeMap.displayName = 'TreeMap';
//# sourceMappingURL=TreeMap.js.map
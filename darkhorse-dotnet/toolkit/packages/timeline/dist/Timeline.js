import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Timeline Component
 * Visualizes ordered events or milestones in vertical or horizontal layout
 */
import { useCallback, useEffect } from 'react';
import { TimelineItem } from './TimelineItem';
import styles from './Timeline.module.css';
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
export const Timeline = ({ items, orientation = 'vertical', alignment = 'start', variant = 'simple', title, showConnector = true, showDots = true, showTimestamps = true, renderItem, onItemClick, onItemFocus, className, style, onError, }) => {
    // Error boundary effect
    useEffect(() => {
        const handleError = (error) => {
            onError?.(error.error);
        };
        window.addEventListener('error', handleError);
        return () => window.removeEventListener('error', handleError);
    }, [onError]);
    // Handle keyboard navigation
    const handleKeyDown = useCallback((e) => {
        const target = e.target;
        const currentItem = target.closest('li');
        if (!currentItem)
            return;
        let nextItem = null;
        switch (e.key) {
            case 'ArrowDown':
                if (orientation === 'vertical') {
                    e.preventDefault();
                    nextItem = currentItem.nextElementSibling;
                }
                break;
            case 'ArrowUp':
                if (orientation === 'vertical') {
                    e.preventDefault();
                    nextItem = currentItem.previousElementSibling;
                }
                break;
            case 'ArrowRight':
                if (orientation === 'horizontal') {
                    e.preventDefault();
                    nextItem = currentItem.nextElementSibling;
                }
                break;
            case 'ArrowLeft':
                if (orientation === 'horizontal') {
                    e.preventDefault();
                    nextItem = currentItem.previousElementSibling;
                }
                break;
            case 'Home':
                e.preventDefault();
                nextItem = currentItem.parentElement?.firstElementChild;
                break;
            case 'End':
                e.preventDefault();
                nextItem = currentItem.parentElement?.lastElementChild;
                break;
        }
        if (nextItem) {
            nextItem.focus();
        }
    }, [orientation]);
    // Empty state
    if (!items || items.length === 0) {
        return (_jsxs("div", { className: styles.timeline__empty, role: "status", children: [_jsx("div", { className: styles.timeline__empty__icon, "aria-hidden": "true", children: "\u23F1\uFE0F" }), _jsx("div", { className: styles.timeline__empty__text, children: "No events yet" })] }));
    }
    const timelineClasses = [
        styles.timeline,
        orientation === 'vertical'
            ? styles['timeline--vertical']
            : styles['timeline--horizontal'],
        className,
    ].filter(Boolean).join(' ');
    const listClasses = [
        styles.timeline__list,
        orientation === 'vertical'
            ? styles['timeline__list--vertical']
            : styles['timeline__list--horizontal'],
    ].filter(Boolean).join(' ');
    return (_jsxs("div", { className: timelineClasses, style: style, role: "region", "aria-label": title || 'Timeline', children: [title && (_jsx("h2", { className: styles.timeline__title, children: title })), _jsx("ul", { className: listClasses, role: "list", onKeyDown: handleKeyDown, children: items.map((item, index) => (_jsx(TimelineItem, { item: item, index: index, orientation: orientation, alignment: alignment, variant: variant, showConnector: showConnector, showDots: showDots, showTimestamps: showTimestamps, isLast: index === items.length - 1, renderItem: renderItem, onItemClick: onItemClick, onItemFocus: onItemFocus }, item.id))) })] }));
};
Timeline.displayName = 'Timeline';
export default Timeline;
//# sourceMappingURL=Timeline.js.map
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import styles from './Timeline.module.css';
export const TimelineItem = ({ item, index, orientation, alignment, variant, showConnector, showDots, showTimestamps, isLast, renderItem, onItemClick, onItemFocus, }) => {
    const handleClick = () => {
        onItemClick?.(item, index);
    };
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onItemClick?.(item, index);
        }
    };
    const handleFocus = () => {
        onItemFocus?.(item, index);
    };
    // Determine alignment class for alternate mode
    const getAlignmentClass = () => {
        if (orientation === 'vertical' && alignment === 'alternate') {
            return index % 2 === 0
                ? styles['timeline__item--vertical-alternate-left']
                : styles['timeline__item--vertical-alternate-right'];
        }
        if (orientation === 'vertical') {
            return styles['timeline__item--vertical-start'];
        }
        return '';
    };
    const itemClasses = [
        styles.timeline__item,
        orientation === 'vertical'
            ? styles['timeline__item--vertical']
            : styles['timeline__item--horizontal'],
        getAlignmentClass(),
    ].filter(Boolean).join(' ');
    const markerClasses = [
        styles.timeline__marker,
        orientation === 'vertical'
            ? styles['timeline__marker--vertical']
            : styles['timeline__marker--horizontal'],
    ].filter(Boolean).join(' ');
    const dotClasses = [
        styles.timeline__dot,
        item.status ? styles[`timeline__dot--${item.status}`] : '',
        item.isActive ? styles['timeline__dot--active'] : '',
    ].filter(Boolean).join(' ');
    const connectorClasses = [
        styles.timeline__connector,
        orientation === 'vertical'
            ? styles['timeline__connector--vertical']
            : styles['timeline__connector--horizontal'],
        item.status ? styles[`timeline__connector--${item.status}`] : '',
    ].filter(Boolean).join(' ');
    const contentClasses = [
        styles.timeline__content,
        orientation === 'vertical'
            ? styles['timeline__content--vertical']
            : styles['timeline__content--horizontal'],
        variant === 'detailed' ? styles['timeline__content--detailed'] : '',
    ].filter(Boolean).join(' ');
    return (_jsxs("li", { className: itemClasses, role: "listitem", tabIndex: 0, onClick: handleClick, onKeyDown: handleKeyDown, onFocus: handleFocus, "aria-current": item.isActive ? 'step' : undefined, "aria-label": `${item.label}${item.timestamp ? `, ${item.timestamp}` : ''}`, children: [_jsxs("div", { className: markerClasses, children: [showDots && (_jsx("div", { className: dotClasses, children: item.icon && (_jsx("span", { className: styles.timeline__dot__icon, children: item.icon })) })), showConnector && !isLast && (_jsx("div", { className: connectorClasses, "aria-hidden": "true" }))] }), _jsx("div", { className: contentClasses, children: renderItem ? (renderItem(item, index)) : (_jsxs(_Fragment, { children: [_jsx("div", { className: styles.timeline__label, children: item.label }), showTimestamps && item.timestamp && (_jsx("div", { className: styles.timeline__timestamp, children: item.timestamp })), variant === 'detailed' && item.description && (_jsx("div", { className: styles.timeline__description, children: item.description })), item.content && (_jsx("div", { className: styles.timeline__custom_content, children: item.content }))] })) })] }));
};
TimelineItem.displayName = 'TimelineItem';
//# sourceMappingURL=TimelineItem.js.map
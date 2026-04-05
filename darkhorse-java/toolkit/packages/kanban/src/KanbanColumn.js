import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * KanbanColumn Component
 * @module @react-toolkit/kanban
 */
import { useCallback, useRef } from 'react';
import { KanbanCardComponent } from './KanbanCardComponent';
import styles from './KanbanBoard.module.css';
export const KanbanColumnComponent = ({ column, cards, swimlaneValue, collapsed, selectedCards, dragState, allowDragAndDrop, allowToggle, enableTooltip, cardTemplate, columnTemplate, onCardClick, onCardRendered, onDragStart, onDragEnd, onDrop, onColumnToggle, }) => {
    const columnRef = useRef(null);
    const dropZoneRef = useRef(null);
    // Check if WIP limit exceeded
    const isWipExceeded = column.maxItems !== undefined && cards.length > column.maxItems;
    // Check if this column is a valid drop target
    const isDropTarget = dragState.isDragging &&
        dragState.card !== null &&
        allowDragAndDrop;
    // Handle drag over
    const handleDragOver = useCallback((e) => {
        if (!isDropTarget)
            return;
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = 'move';
    }, [isDropTarget]);
    // Handle drop
    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isDropTarget)
            return;
        onDrop(column.key, swimlaneValue);
    }, [isDropTarget, onDrop, column.key, swimlaneValue]);
    // Handle toggle
    const handleToggle = useCallback(() => {
        if (allowToggle) {
            onColumnToggle(column.key);
        }
    }, [allowToggle, onColumnToggle, column.key]);
    // Build column classes
    const columnClasses = [
        styles.column,
        collapsed ? styles.columnCollapsed : '',
        isWipExceeded ? styles.columnWipExceeded : '',
        isDropTarget ? styles.columnDropTarget : '',
    ]
        .filter(Boolean)
        .join(' ');
    // Render custom column template if provided
    if (columnTemplate && !collapsed) {
        return (_jsx("div", { ref: columnRef, className: columnClasses, onDragOver: handleDragOver, onDrop: handleDrop, role: "region", "aria-label": `${column.headerText} column`, children: columnTemplate(column, cards) }));
    }
    return (_jsxs("div", { ref: columnRef, className: columnClasses, onDragOver: handleDragOver, onDrop: handleDrop, role: "region", "aria-label": `${column.headerText} column`, children: [_jsx("div", { className: styles.columnHeader, children: column.headerTemplate ? (column.headerTemplate(column)) : (_jsxs(_Fragment, { children: [_jsxs("div", { className: styles.columnHeaderContent, children: [_jsx("h3", { className: styles.columnTitle, children: column.headerText }), _jsxs("span", { className: styles.columnCount, children: [cards.length, column.maxItems !== undefined && ` / ${column.maxItems}`] })] }), allowToggle && (_jsx("button", { className: styles.columnToggleButton, onClick: handleToggle, "aria-label": collapsed ? `Expand ${column.headerText}` : `Collapse ${column.headerText}`, title: collapsed ? 'Expand' : 'Collapse', children: collapsed ? '›' : '‹' }))] })) }), !collapsed && (_jsx("div", { ref: dropZoneRef, className: styles.columnContent, "data-column-key": column.key, children: cards.length === 0 ? (_jsx("div", { className: styles.columnEmpty, children: isDropTarget ? 'Drop here' : 'No cards' })) : (cards.map((card) => (_jsx(KanbanCardComponent, { card: card, columnKey: column.key, swimlaneValue: swimlaneValue, isSelected: selectedCards.has(card.id), isDragging: dragState.card?.id === card.id, allowDragAndDrop: allowDragAndDrop, enableTooltip: enableTooltip, cardTemplate: cardTemplate, onClick: onCardClick, onRendered: onCardRendered, onDragStart: onDragStart, onDragEnd: onDragEnd }, card.id)))) }))] }));
};
KanbanColumnComponent.displayName = 'KanbanColumn';
//# sourceMappingURL=KanbanColumn.js.map
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * KanbanCardComponent
 * @module @react-toolkit/kanban
 */
import { useCallback, useRef, useEffect } from 'react';
import styles from './KanbanBoard.module.css';
export const KanbanCardComponent = ({ card, columnKey, swimlaneValue, isSelected, isDragging, allowDragAndDrop, enableTooltip, cardTemplate, onClick, onRendered, onDragStart, onDragEnd, }) => {
    const cardRef = useRef(null);
    // Notify when card is rendered
    useEffect(() => {
        if (cardRef.current && onRendered) {
            onRendered(card, cardRef.current);
        }
    }, [card, onRendered]);
    // Handle card click
    const handleClick = useCallback((e) => {
        const multiSelect = e.ctrlKey || e.metaKey;
        onClick(card, multiSelect);
    }, [card, onClick]);
    // Handle keyboard interaction
    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            const multiSelect = e.ctrlKey || e.metaKey;
            onClick(card, multiSelect);
        }
    }, [card, onClick]);
    // Handle drag start
    const handleDragStart = useCallback((e) => {
        if (!allowDragAndDrop) {
            e.preventDefault();
            return;
        }
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', String(card.id));
        // Set a custom drag image (optional)
        if (cardRef.current) {
            e.dataTransfer.setDragImage(cardRef.current, 0, 0);
        }
        onDragStart(card, columnKey, swimlaneValue);
    }, [allowDragAndDrop, card, columnKey, swimlaneValue, onDragStart]);
    // Handle drag end
    const handleDragEnd = useCallback((e) => {
        e.preventDefault();
        onDragEnd();
    }, [onDragEnd]);
    // Build card classes
    const getPriorityClass = (priority) => {
        if (!priority)
            return '';
        const key = `cardPriority${priority}`;
        return styles[key] || '';
    };
    const getPriorityBadgeClass = (priority) => {
        if (!priority)
            return '';
        const key = `priority${priority}`;
        return styles[key] || '';
    };
    const cardClasses = [
        styles.card,
        isSelected ? styles.cardSelected : '',
        isDragging ? styles.cardDragging : '',
        getPriorityClass(card.priority),
    ]
        .filter(Boolean)
        .join(' ');
    // Build tooltip
    const tooltip = enableTooltip
        ? `${card.title}${card.summary ? ` - ${card.summary}` : ''}`
        : undefined;
    return (_jsx("div", { ref: cardRef, className: cardClasses, draggable: allowDragAndDrop, onClick: handleClick, onKeyDown: handleKeyDown, onDragStart: handleDragStart, onDragEnd: handleDragEnd, role: "button", tabIndex: 0, "aria-label": `Card: ${card.title}`, "aria-pressed": isSelected, title: tooltip, "data-card-id": card.id, children: cardTemplate ? (cardTemplate(card)) : (_jsxs(_Fragment, { children: [_jsxs("div", { className: styles.cardHeader, children: [_jsx("h4", { className: styles.cardTitle, children: card.title }), card.priority && (_jsx("span", { className: `${styles.cardPriority} ${getPriorityBadgeClass(card.priority)}`, children: card.priority }))] }), card.summary && (_jsx("p", { className: styles.cardSummary, children: card.summary })), card.tags && card.tags.length > 0 && (_jsx("div", { className: styles.cardTags, children: card.tags.map((tag, index) => (_jsx("span", { className: styles.cardTag, children: tag }, `${tag}-${index}`))) })), card.assignee && (_jsx("div", { className: styles.cardFooter, children: _jsx("span", { className: styles.cardAssignee, children: card.assignee }) }))] })) }));
};
KanbanCardComponent.displayName = 'KanbanCard';
//# sourceMappingURL=KanbanCardComponent.js.map
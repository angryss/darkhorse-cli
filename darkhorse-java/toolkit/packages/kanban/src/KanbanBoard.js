import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * KanbanBoard Component
 * @module @react-toolkit/kanban
 */
import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { KanbanColumnComponent } from './KanbanColumn';
import { KanbanCardDialog } from './KanbanCardDialog';
import styles from './KanbanBoard.module.css';
/**
 * Kanban Board component for workflow visualization
 */
export const KanbanBoard = React.forwardRef((props, ref) => {
    const { id, cards, columns, keyField = 'status', swimlaneSettings, enableTooltip = false, selectionMode = 'None', allowDragAndDrop = false, allowCardSorting = false, allowColumnToggle = false, cardTemplate, columnTemplate, dialogFields, height, width, onCardDrop, onCardClick, onSelectionChange, onCardRendered, onCardSave, onCardDelete, onColumnToggle, onError, className, style, ...restProps } = props;
    // State management
    const [selectedCards, setSelectedCards] = useState(new Set());
    const [dragState, setDragState] = useState({
        card: null,
        sourceColumnKey: null,
        sourceSwimlane: null,
        isDragging: false,
    });
    const [columnStates, setColumnStates] = useState({});
    const [dialogCard, setDialogCard] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const boardRef = useRef(null);
    // Group cards by swimlane if configured
    const swimlaneGroups = useMemo(() => {
        if (!swimlaneSettings) {
            return new Map([['__all__', cards]]);
        }
        const groups = new Map();
        const { keyField: swimlaneKey, showUnassignedRow = true } = swimlaneSettings;
        cards.forEach((card) => {
            const value = card[swimlaneKey];
            const key = value ?? (showUnassignedRow ? '__unassigned__' : null);
            if (key !== null) {
                if (!groups.has(key)) {
                    groups.set(key, []);
                }
                groups.get(key).push(card);
            }
        });
        return groups;
    }, [cards, swimlaneSettings]);
    // Get cards for a specific column and swimlane
    const getCardsForColumn = useCallback((columnKey, swimlaneValue) => {
        const swimlaneCards = swimlaneGroups.get(swimlaneValue) || [];
        const columnCards = swimlaneCards.filter((card) => card[keyField] === columnKey);
        if (allowCardSorting && columnCards.length > 0) {
            return [...columnCards].sort((a, b) => {
                const rankA = a.rank ?? 0;
                const rankB = b.rank ?? 0;
                if (typeof rankA === 'string' && typeof rankB === 'string') {
                    return rankA.localeCompare(rankB);
                }
                return Number(rankA) - Number(rankB);
            });
        }
        return columnCards;
    }, [swimlaneGroups, keyField, allowCardSorting]);
    // Handle card selection
    const handleCardSelect = useCallback((card, multiSelect) => {
        if (selectionMode === 'None')
            return;
        setSelectedCards((prev) => {
            const newSelection = new Set(prev);
            if (selectionMode === 'Single') {
                newSelection.clear();
                newSelection.add(card.id);
            }
            else if (selectionMode === 'Multiple') {
                if (multiSelect) {
                    if (newSelection.has(card.id)) {
                        newSelection.delete(card.id);
                    }
                    else {
                        newSelection.add(card.id);
                    }
                }
                else {
                    newSelection.clear();
                    newSelection.add(card.id);
                }
            }
            return newSelection;
        });
    }, [selectionMode]);
    // Notify selection changes
    useEffect(() => {
        if (onSelectionChange && selectionMode !== 'None') {
            const selected = cards.filter((card) => selectedCards.has(card.id));
            onSelectionChange(selected);
        }
    }, [selectedCards, cards, onSelectionChange, selectionMode]);
    // Handle drag start
    const handleDragStart = useCallback((card, sourceColumnKey, sourceSwimlane) => {
        if (!allowDragAndDrop)
            return;
        setDragState({
            card,
            sourceColumnKey,
            sourceSwimlane,
            isDragging: true,
        });
    }, [allowDragAndDrop]);
    // Handle drag end
    const handleDragEnd = useCallback(() => {
        setDragState({
            card: null,
            sourceColumnKey: null,
            sourceSwimlane: null,
            isDragging: false,
        });
    }, []);
    // Handle drop
    const handleDrop = useCallback((targetColumnKey, targetSwimlane) => {
        if (!dragState.card || !onCardDrop) {
            handleDragEnd();
            return;
        }
        const { card, sourceColumnKey, sourceSwimlane } = dragState;
        // Only trigger if actually moved
        if (sourceColumnKey !== targetColumnKey || sourceSwimlane !== targetSwimlane) {
            try {
                onCardDrop(card, targetColumnKey, targetSwimlane);
            }
            catch (error) {
                if (onError) {
                    onError(error);
                }
            }
        }
        handleDragEnd();
    }, [dragState, onCardDrop, onError, handleDragEnd]);
    // Handle column toggle
    const handleColumnToggle = useCallback((columnKey) => {
        setColumnStates((prev) => {
            const newStates = { ...prev };
            const currentState = newStates[columnKey] || { collapsed: false };
            const newCollapsed = !currentState.collapsed;
            newStates[columnKey] = { collapsed: newCollapsed };
            if (onColumnToggle) {
                onColumnToggle(columnKey, newCollapsed);
            }
            return newStates;
        });
    }, [onColumnToggle]);
    // Handle card click
    const handleCardClickInternal = useCallback((card, multiSelect) => {
        if (onCardClick) {
            onCardClick(card);
        }
        if (dialogFields && dialogFields.length > 0) {
            setDialogCard(card);
            setDialogOpen(true);
        }
        else {
            handleCardSelect(card, multiSelect);
        }
    }, [onCardClick, dialogFields, handleCardSelect]);
    // Handle dialog save
    const handleDialogSave = useCallback((updatedCard) => {
        if (onCardSave) {
            onCardSave(updatedCard);
        }
        setDialogOpen(false);
        setDialogCard(null);
    }, [onCardSave]);
    // Handle dialog delete
    const handleDialogDelete = useCallback((cardId) => {
        if (onCardDelete) {
            onCardDelete(cardId);
        }
        setDialogOpen(false);
        setDialogCard(null);
    }, [onCardDelete]);
    // Handle dialog close
    const handleDialogClose = useCallback(() => {
        setDialogOpen(false);
        setDialogCard(null);
    }, []);
    // Render swimlane label
    const renderSwimlaneLabel = useCallback((swimlaneValue) => {
        if (!swimlaneSettings)
            return null;
        if (swimlaneValue === '__unassigned__') {
            return swimlaneSettings.labelTemplate
                ? swimlaneSettings.labelTemplate(null)
                : 'Unassigned';
        }
        return swimlaneSettings.labelTemplate
            ? swimlaneSettings.labelTemplate(swimlaneValue)
            : String(swimlaneValue);
    }, [swimlaneSettings]);
    // Build CSS classes
    const boardClasses = [
        styles.kanbanBoard,
        dragState.isDragging ? styles.isDragging : '',
        className,
    ]
        .filter(Boolean)
        .join(' ');
    const boardStyle = {
        ...style,
        height: height ? (typeof height === 'number' ? `${height}px` : height) : undefined,
        width: width ? (typeof width === 'number' ? `${width}px` : width) : undefined,
    };
    return (_jsxs(_Fragment, { children: [_jsx("div", { ref: ref || boardRef, id: id, className: boardClasses, style: boardStyle, role: "region", "aria-label": "Kanban board", ...restProps, children: swimlaneSettings ? (
                // Render with swimlanes
                _jsx("div", { className: styles.swimlanes, children: Array.from(swimlaneGroups.keys()).map((swimlaneValue) => (_jsxs("div", { className: styles.swimlane, children: [_jsx("div", { className: styles.swimlaneHeader, children: _jsx("h3", { className: styles.swimlaneLabel, children: renderSwimlaneLabel(swimlaneValue) }) }), _jsx("div", { className: styles.swimlaneColumns, children: columns.map((column) => (_jsx(KanbanColumnComponent, { column: column, cards: getCardsForColumn(column.key, swimlaneValue), swimlaneValue: swimlaneValue, collapsed: columnStates[column.key]?.collapsed || false, selectedCards: selectedCards, dragState: dragState, allowDragAndDrop: allowDragAndDrop, allowToggle: allowColumnToggle || column.allowToggle, enableTooltip: enableTooltip, cardTemplate: cardTemplate, columnTemplate: columnTemplate, onCardClick: handleCardClickInternal, onCardRendered: onCardRendered, onDragStart: handleDragStart, onDragEnd: handleDragEnd, onDrop: handleDrop, onColumnToggle: handleColumnToggle }, `${column.key}-${String(swimlaneValue)}`))) })] }, String(swimlaneValue)))) })) : (
                // Render without swimlanes
                _jsx("div", { className: styles.columns, children: columns.map((column) => (_jsx(KanbanColumnComponent, { column: column, cards: getCardsForColumn(column.key, '__all__'), swimlaneValue: null, collapsed: columnStates[column.key]?.collapsed || false, selectedCards: selectedCards, dragState: dragState, allowDragAndDrop: allowDragAndDrop, allowToggle: allowColumnToggle || column.allowToggle, enableTooltip: enableTooltip, cardTemplate: cardTemplate, columnTemplate: columnTemplate, onCardClick: handleCardClickInternal, onCardRendered: onCardRendered, onDragStart: handleDragStart, onDragEnd: handleDragEnd, onDrop: handleDrop, onColumnToggle: handleColumnToggle }, column.key))) })) }), dialogFields && dialogOpen && dialogCard && (_jsx(KanbanCardDialog, { card: dialogCard, fields: dialogFields, open: dialogOpen, onSave: handleDialogSave, onDelete: handleDialogDelete, onClose: handleDialogClose }))] }));
});
KanbanBoard.displayName = 'KanbanBoard';
//# sourceMappingURL=KanbanBoard.js.map
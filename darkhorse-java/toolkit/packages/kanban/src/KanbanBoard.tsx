/**
 * KanbanBoard Component
 * @module @react-toolkit/kanban
 */

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  KanbanBoardProps,
  KanbanCard,
  DragState,
  ColumnState,
} from './types';
import { KanbanColumnComponent } from './KanbanColumn';
import { KanbanCardDialog } from './KanbanCardDialog';
import styles from './KanbanBoard.module.css';

/**
 * Kanban Board component for workflow visualization
 */
export const KanbanBoard = React.forwardRef<HTMLDivElement, KanbanBoardProps>(
  (props, ref) => {
    const {
      id,
      cards,
      columns,
      keyField = 'status',
      swimlaneSettings,
      enableTooltip = false,
      selectionMode = 'None',
      allowDragAndDrop = false,
      allowCardSorting = false,
      allowColumnToggle = false,
      cardTemplate,
      columnTemplate,
      dialogFields,
      height,
      width,
      onCardDrop,
      onCardClick,
      onSelectionChange,
      onCardRendered,
      onCardSave,
      onCardDelete,
      onColumnToggle,
      onError,
      className,
      style,
      ...restProps
    } = props;

    // State management
    const [selectedCards, setSelectedCards] = useState<Set<string | number>>(new Set());
    const [dragState, setDragState] = useState<DragState>({
      card: null,
      sourceColumnKey: null,
      sourceSwimlane: null,
      isDragging: false,
    });
    const [columnStates, setColumnStates] = useState<ColumnState>({});
    const [dialogCard, setDialogCard] = useState<KanbanCard | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    const boardRef = useRef<HTMLDivElement>(null);

    // Group cards by swimlane if configured
    const swimlaneGroups = useMemo(() => {
      if (!swimlaneSettings) {
        return new Map<unknown, KanbanCard[]>([['__all__', cards]]);
      }

      const groups = new Map<unknown, KanbanCard[]>();
      const { keyField: swimlaneKey, showUnassignedRow = true } = swimlaneSettings;

      cards.forEach((card) => {
        const value = (card as Record<string, unknown>)[swimlaneKey as string];
        const key = value ?? (showUnassignedRow ? '__unassigned__' : null);
        
        if (key !== null) {
          if (!groups.has(key)) {
            groups.set(key, []);
          }
          groups.get(key)!.push(card);
        }
      });

      return groups;
    }, [cards, swimlaneSettings]);

    // Get cards for a specific column and swimlane
    const getCardsForColumn = useCallback(
      (columnKey: string, swimlaneValue: unknown) => {
        const swimlaneCards = swimlaneGroups.get(swimlaneValue) || [];
        const columnCards = swimlaneCards.filter(
          (card) => (card as Record<string, unknown>)[keyField as string] === columnKey
        );

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
      },
      [swimlaneGroups, keyField, allowCardSorting]
    );

    // Handle card selection
    const handleCardSelect = useCallback(
      (card: KanbanCard, multiSelect: boolean) => {
        if (selectionMode === 'None') return;

        setSelectedCards((prev) => {
          const newSelection = new Set(prev);

          if (selectionMode === 'Single') {
            newSelection.clear();
            newSelection.add(card.id);
          } else if (selectionMode === 'Multiple') {
            if (multiSelect) {
              if (newSelection.has(card.id)) {
                newSelection.delete(card.id);
              } else {
                newSelection.add(card.id);
              }
            } else {
              newSelection.clear();
              newSelection.add(card.id);
            }
          }

          return newSelection;
        });
      },
      [selectionMode]
    );

    // Notify selection changes
    useEffect(() => {
      if (onSelectionChange && selectionMode !== 'None') {
        const selected = cards.filter((card) => selectedCards.has(card.id));
        onSelectionChange(selected);
      }
    }, [selectedCards, cards, onSelectionChange, selectionMode]);

    // Handle drag start
    const handleDragStart = useCallback(
      (card: KanbanCard, sourceColumnKey: string, sourceSwimlane: unknown) => {
        if (!allowDragAndDrop) return;

        setDragState({
          card,
          sourceColumnKey,
          sourceSwimlane,
          isDragging: true,
        });
      },
      [allowDragAndDrop]
    );

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
    const handleDrop = useCallback(
      (targetColumnKey: string, targetSwimlane: unknown) => {
        if (!dragState.card || !onCardDrop) {
          handleDragEnd();
          return;
        }

        const { card, sourceColumnKey, sourceSwimlane } = dragState;

        // Only trigger if actually moved
        if (sourceColumnKey !== targetColumnKey || sourceSwimlane !== targetSwimlane) {
          try {
            onCardDrop(card, targetColumnKey, targetSwimlane);
          } catch (error) {
            if (onError) {
              onError(error as Error);
            }
          }
        }

        handleDragEnd();
      },
      [dragState, onCardDrop, onError, handleDragEnd]
    );

    // Handle column toggle
    const handleColumnToggle = useCallback(
      (columnKey: string) => {
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
      },
      [onColumnToggle]
    );

    // Handle card click
    const handleCardClickInternal = useCallback(
      (card: KanbanCard, multiSelect: boolean) => {
        if (onCardClick) {
          onCardClick(card);
        }

        if (dialogFields && dialogFields.length > 0) {
          setDialogCard(card);
          setDialogOpen(true);
        } else {
          handleCardSelect(card, multiSelect);
        }
      },
      [onCardClick, dialogFields, handleCardSelect]
    );

    // Handle dialog save
    const handleDialogSave = useCallback(
      (updatedCard: KanbanCard) => {
        if (onCardSave) {
          onCardSave(updatedCard);
        }
        setDialogOpen(false);
        setDialogCard(null);
      },
      [onCardSave]
    );

    // Handle dialog delete
    const handleDialogDelete = useCallback(
      (cardId: string | number) => {
        if (onCardDelete) {
          onCardDelete(cardId);
        }
        setDialogOpen(false);
        setDialogCard(null);
      },
      [onCardDelete]
    );

    // Handle dialog close
    const handleDialogClose = useCallback(() => {
      setDialogOpen(false);
      setDialogCard(null);
    }, []);

    // Render swimlane label
    const renderSwimlaneLabel = useCallback(
      (swimlaneValue: unknown) => {
        if (!swimlaneSettings) return null;

        if (swimlaneValue === '__unassigned__') {
          return swimlaneSettings.labelTemplate
            ? swimlaneSettings.labelTemplate(null)
            : 'Unassigned';
        }

        return swimlaneSettings.labelTemplate
          ? swimlaneSettings.labelTemplate(swimlaneValue)
          : String(swimlaneValue);
      },
      [swimlaneSettings]
    );

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

    return (
      <>
        <div
          ref={ref || boardRef}
          id={id}
          className={boardClasses}
          style={boardStyle}
          role="region"
          aria-label="Kanban board"
          {...restProps}
        >
          {swimlaneSettings ? (
            // Render with swimlanes
            <div className={styles.swimlanes}>
              {Array.from(swimlaneGroups.keys()).map((swimlaneValue) => (
                <div key={String(swimlaneValue)} className={styles.swimlane}>
                  <div className={styles.swimlaneHeader}>
                    <h3 className={styles.swimlaneLabel}>
                      {renderSwimlaneLabel(swimlaneValue)}
                    </h3>
                  </div>
                  <div className={styles.swimlaneColumns}>
                    {columns.map((column) => (
                      <KanbanColumnComponent
                        key={`${column.key}-${String(swimlaneValue)}`}
                        column={column}
                        cards={getCardsForColumn(column.key, swimlaneValue)}
                        swimlaneValue={swimlaneValue}
                        collapsed={columnStates[column.key]?.collapsed || false}
                        selectedCards={selectedCards}
                        dragState={dragState}
                        allowDragAndDrop={allowDragAndDrop}
                        allowToggle={allowColumnToggle || column.allowToggle}
                        enableTooltip={enableTooltip}
                        cardTemplate={cardTemplate}
                        columnTemplate={columnTemplate}
                        onCardClick={handleCardClickInternal}
                        onCardRendered={onCardRendered}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        onDrop={handleDrop}
                        onColumnToggle={handleColumnToggle}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Render without swimlanes
            <div className={styles.columns}>
              {columns.map((column) => (
                <KanbanColumnComponent
                  key={column.key}
                  column={column}
                  cards={getCardsForColumn(column.key, '__all__')}
                  swimlaneValue={null}
                  collapsed={columnStates[column.key]?.collapsed || false}
                  selectedCards={selectedCards}
                  dragState={dragState}
                  allowDragAndDrop={allowDragAndDrop}
                  allowToggle={allowColumnToggle || column.allowToggle}
                  enableTooltip={enableTooltip}
                  cardTemplate={cardTemplate}
                  columnTemplate={columnTemplate}
                  onCardClick={handleCardClickInternal}
                  onCardRendered={onCardRendered}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  onDrop={handleDrop}
                  onColumnToggle={handleColumnToggle}
                />
              ))}
            </div>
          )}
        </div>

        {dialogFields && dialogOpen && dialogCard && (
          <KanbanCardDialog
            card={dialogCard}
            fields={dialogFields}
            open={dialogOpen}
            onSave={handleDialogSave}
            onDelete={handleDialogDelete}
            onClose={handleDialogClose}
          />
        )}
      </>
    );
  }
);

KanbanBoard.displayName = 'KanbanBoard';


/**
 * KanbanColumn Component
 * @module @react-toolkit/kanban
 */

import React, { useCallback, useRef } from 'react';
import { KanbanCard, KanbanColumn, DragState } from './types';
import { KanbanCardComponent } from './KanbanCardComponent';
import styles from './KanbanBoard.module.css';

export interface KanbanColumnComponentProps {
  column: KanbanColumn;
  cards: KanbanCard[];
  swimlaneValue: unknown;
  collapsed: boolean;
  selectedCards: Set<string | number>;
  dragState: DragState;
  allowDragAndDrop: boolean;
  allowToggle?: boolean;
  enableTooltip: boolean;
  cardTemplate?: (card: KanbanCard) => React.ReactNode;
  columnTemplate?: (column: KanbanColumn, cards: KanbanCard[]) => React.ReactNode;
  onCardClick: (card: KanbanCard, multiSelect: boolean) => void;
  onCardRendered?: (card: KanbanCard, element: HTMLElement) => void;
  onDragStart: (card: KanbanCard, columnKey: string, swimlaneValue: unknown) => void;
  onDragEnd: () => void;
  onDrop: (columnKey: string, swimlaneValue: unknown) => void;
  onColumnToggle: (columnKey: string) => void;
}

export const KanbanColumnComponent: React.FC<KanbanColumnComponentProps> = ({
  column,
  cards,
  swimlaneValue,
  collapsed,
  selectedCards,
  dragState,
  allowDragAndDrop,
  allowToggle,
  enableTooltip,
  cardTemplate,
  columnTemplate,
  onCardClick,
  onCardRendered,
  onDragStart,
  onDragEnd,
  onDrop,
  onColumnToggle,
}) => {
  const columnRef = useRef<HTMLDivElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Check if WIP limit exceeded
  const isWipExceeded = column.maxItems !== undefined && cards.length > column.maxItems;

  // Check if this column is a valid drop target
  const isDropTarget =
    dragState.isDragging &&
    dragState.card !== null &&
    allowDragAndDrop;

  // Handle drag over
  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      if (!isDropTarget) return;
      
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = 'move';
    },
    [isDropTarget]
  );

  // Handle drop
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!isDropTarget) return;

      onDrop(column.key, swimlaneValue);
    },
    [isDropTarget, onDrop, column.key, swimlaneValue]
  );

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
    return (
      <div
        ref={columnRef}
        className={columnClasses}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        role="region"
        aria-label={`${column.headerText} column`}
      >
        {columnTemplate(column, cards)}
      </div>
    );
  }

  return (
    <div
      ref={columnRef}
      className={columnClasses}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      role="region"
      aria-label={`${column.headerText} column`}
    >
      {/* Column Header */}
      <div className={styles.columnHeader}>
        {column.headerTemplate ? (
          column.headerTemplate(column)
        ) : (
          <>
            <div className={styles.columnHeaderContent}>
              <h3 className={styles.columnTitle}>{column.headerText}</h3>
              <span className={styles.columnCount}>
                {cards.length}
                {column.maxItems !== undefined && ` / ${column.maxItems}`}
              </span>
            </div>
            {allowToggle && (
              <button
                className={styles.columnToggleButton}
                onClick={handleToggle}
                aria-label={collapsed ? `Expand ${column.headerText}` : `Collapse ${column.headerText}`}
                title={collapsed ? 'Expand' : 'Collapse'}
              >
                {collapsed ? '›' : '‹'}
              </button>
            )}
          </>
        )}
      </div>

      {/* Column Content */}
      {!collapsed && (
        <div
          ref={dropZoneRef}
          className={styles.columnContent}
          data-column-key={column.key}
        >
          {cards.length === 0 ? (
            <div className={styles.columnEmpty}>
              {isDropTarget ? 'Drop here' : 'No cards'}
            </div>
          ) : (
            cards.map((card) => (
              <KanbanCardComponent
                key={card.id}
                card={card}
                columnKey={column.key}
                swimlaneValue={swimlaneValue}
                isSelected={selectedCards.has(card.id)}
                isDragging={dragState.card?.id === card.id}
                allowDragAndDrop={allowDragAndDrop}
                enableTooltip={enableTooltip}
                cardTemplate={cardTemplate}
                onClick={onCardClick}
                onRendered={onCardRendered}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

KanbanColumnComponent.displayName = 'KanbanColumn';


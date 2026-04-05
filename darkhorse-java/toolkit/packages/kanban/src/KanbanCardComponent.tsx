/**
 * KanbanCardComponent
 * @module @react-toolkit/kanban
 */

import React, { useCallback, useRef, useEffect } from 'react';
import { KanbanCard } from './types';
import styles from './KanbanBoard.module.css';

export interface KanbanCardComponentProps {
  card: KanbanCard;
  columnKey: string;
  swimlaneValue: unknown;
  isSelected: boolean;
  isDragging: boolean;
  allowDragAndDrop: boolean;
  enableTooltip: boolean;
  cardTemplate?: (card: KanbanCard) => React.ReactNode;
  onClick: (card: KanbanCard, multiSelect: boolean) => void;
  onRendered?: (card: KanbanCard, element: HTMLElement) => void;
  onDragStart: (card: KanbanCard, columnKey: string, swimlaneValue: unknown) => void;
  onDragEnd: () => void;
}

export const KanbanCardComponent: React.FC<KanbanCardComponentProps> = ({
  card,
  columnKey,
  swimlaneValue,
  isSelected,
  isDragging,
  allowDragAndDrop,
  enableTooltip,
  cardTemplate,
  onClick,
  onRendered,
  onDragStart,
  onDragEnd,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  // Notify when card is rendered
  useEffect(() => {
    if (cardRef.current && onRendered) {
      onRendered(card, cardRef.current);
    }
  }, [card, onRendered]);

  // Handle card click
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      const multiSelect = e.ctrlKey || e.metaKey;
      onClick(card, multiSelect);
    },
    [card, onClick]
  );

  // Handle keyboard interaction
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const multiSelect = e.ctrlKey || e.metaKey;
        onClick(card, multiSelect);
      }
    },
    [card, onClick]
  );

  // Handle drag start
  const handleDragStart = useCallback(
    (e: React.DragEvent) => {
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
    },
    [allowDragAndDrop, card, columnKey, swimlaneValue, onDragStart]
  );

  // Handle drag end
  const handleDragEnd = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      onDragEnd();
    },
    [onDragEnd]
  );

  // Build card classes
  const getPriorityClass = (priority: string | undefined) => {
    if (!priority) return '';
    const key = `cardPriority${priority}` as keyof typeof styles;
    return styles[key] || '';
  };

  const getPriorityBadgeClass = (priority: string | undefined) => {
    if (!priority) return '';
    const key = `priority${priority}` as keyof typeof styles;
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

  return (
    <div
      ref={cardRef}
      className={cardClasses}
      draggable={allowDragAndDrop}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      role="button"
      tabIndex={0}
      aria-label={`Card: ${card.title}`}
      aria-pressed={isSelected}
      title={tooltip}
      data-card-id={card.id}
    >
      {cardTemplate ? (
        cardTemplate(card)
      ) : (
        <>
          {/* Default Card Template */}
          <div className={styles.cardHeader}>
            <h4 className={styles.cardTitle}>{card.title}</h4>
            {card.priority && (
              <span className={`${styles.cardPriority} ${getPriorityBadgeClass(card.priority)}`}>
                {card.priority}
              </span>
            )}
          </div>

          {card.summary && (
            <p className={styles.cardSummary}>{card.summary}</p>
          )}

          {card.tags && card.tags.length > 0 && (
            <div className={styles.cardTags}>
              {card.tags.map((tag, index) => (
                <span key={`${tag}-${index}`} className={styles.cardTag}>
                  {tag}
                </span>
              ))}
            </div>
          )}

          {card.assignee && (
            <div className={styles.cardFooter}>
              <span className={styles.cardAssignee}>{card.assignee}</span>
            </div>
          )}
        </>
      )}
    </div>
  );
};

KanbanCardComponent.displayName = 'KanbanCard';


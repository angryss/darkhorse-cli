/**
 * Timeline Component
 * Visualizes ordered events or milestones in vertical or horizontal layout
 */

import React, { useCallback, useEffect } from 'react';
import { TimelineProps } from './types';
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
export const Timeline: React.FC<TimelineProps> = ({
  items,
  orientation = 'vertical',
  alignment = 'start',
  variant = 'simple',
  title,
  showConnector = true,
  showDots = true,
  showTimestamps = true,
  renderItem,
  onItemClick,
  onItemFocus,
  className,
  style,
  onError,
}) => {
  // Error boundary effect
  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      onError?.(error.error);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, [onError]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLUListElement>) => {
    const target = e.target as HTMLElement;
    const currentItem = target.closest('li');
    if (!currentItem) return;

    let nextItem: HTMLElement | null = null;

    switch (e.key) {
      case 'ArrowDown':
        if (orientation === 'vertical') {
          e.preventDefault();
          nextItem = currentItem.nextElementSibling as HTMLElement;
        }
        break;
      case 'ArrowUp':
        if (orientation === 'vertical') {
          e.preventDefault();
          nextItem = currentItem.previousElementSibling as HTMLElement;
        }
        break;
      case 'ArrowRight':
        if (orientation === 'horizontal') {
          e.preventDefault();
          nextItem = currentItem.nextElementSibling as HTMLElement;
        }
        break;
      case 'ArrowLeft':
        if (orientation === 'horizontal') {
          e.preventDefault();
          nextItem = currentItem.previousElementSibling as HTMLElement;
        }
        break;
      case 'Home':
        e.preventDefault();
        nextItem = currentItem.parentElement?.firstElementChild as HTMLElement;
        break;
      case 'End':
        e.preventDefault();
        nextItem = currentItem.parentElement?.lastElementChild as HTMLElement;
        break;
    }

    if (nextItem) {
      nextItem.focus();
    }
  }, [orientation]);

  // Empty state
  if (!items || items.length === 0) {
    return (
      <div className={styles.timeline__empty} role="status">
        <div className={styles.timeline__empty__icon} aria-hidden="true">
          ⏱️
        </div>
        <div className={styles.timeline__empty__text}>
          No events yet
        </div>
      </div>
    );
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

  return (
    <div 
      className={timelineClasses}
      style={style}
      role="region"
      aria-label={title || 'Timeline'}
    >
      {title && (
        <h2 className={styles.timeline__title}>
          {title}
        </h2>
      )}

      <ul 
        className={listClasses}
        role="list"
        onKeyDown={handleKeyDown}
      >
        {items.map((item, index) => (
          <TimelineItem
            key={item.id}
            item={item}
            index={index}
            orientation={orientation}
            alignment={alignment}
            variant={variant}
            showConnector={showConnector}
            showDots={showDots}
            showTimestamps={showTimestamps}
            isLast={index === items.length - 1}
            renderItem={renderItem}
            onItemClick={onItemClick}
            onItemFocus={onItemFocus}
          />
        ))}
      </ul>
    </div>
  );
};

Timeline.displayName = 'Timeline';

export default Timeline;


/**
 * TimelineItem Component
 * Individual item in the timeline
 */

import React, { KeyboardEvent } from 'react';
import { TimelineItemComponentProps } from './types';
import styles from './Timeline.module.css';

export const TimelineItem: React.FC<TimelineItemComponentProps> = ({
  item,
  index,
  orientation,
  alignment,
  variant,
  showConnector,
  showDots,
  showTimestamps,
  isLast,
  renderItem,
  onItemClick,
  onItemFocus,
}) => {
  const handleClick = () => {
    onItemClick?.(item, index);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLLIElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onItemClick?.(item, index);
    }
  };

  const handleFocus = () => {
    onItemFocus?.(item, index);
  };

  // Determine alignment class for alternate mode
  const getAlignmentClass = (): string => {
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

  return (
    <li
      className={itemClasses}
      role="listitem"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
      aria-current={item.isActive ? 'step' : undefined}
      aria-label={`${item.label}${item.timestamp ? `, ${item.timestamp}` : ''}`}
    >
      {/* Marker (Dot + Connector) */}
      <div className={markerClasses}>
        {showDots && (
          <div className={dotClasses}>
            {item.icon && (
              <span className={styles.timeline__dot__icon}>
                {item.icon}
              </span>
            )}
          </div>
        )}
        
        {showConnector && !isLast && (
          <div className={connectorClasses} aria-hidden="true" />
        )}
      </div>

      {/* Content */}
      <div className={contentClasses}>
        {renderItem ? (
          renderItem(item, index)
        ) : (
          <>
            <div className={styles.timeline__label}>
              {item.label}
            </div>

            {showTimestamps && item.timestamp && (
              <div className={styles.timeline__timestamp}>
                {item.timestamp}
              </div>
            )}

            {variant === 'detailed' && item.description && (
              <div className={styles.timeline__description}>
                {item.description}
              </div>
            )}

            {item.content && (
              <div className={styles.timeline__custom_content}>
                {item.content}
              </div>
            )}
          </>
        )}
      </div>
    </li>
  );
};

TimelineItem.displayName = 'TimelineItem';


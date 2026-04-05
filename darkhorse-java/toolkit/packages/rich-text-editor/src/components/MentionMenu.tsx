/**
 * Mention Menu Component
 * Provides @mention functionality with async data source
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RteMentionItem } from '../types';
import styles from './MentionMenu.module.css';

export interface MentionMenuProps {
  /** Filtered mention items */
  items: RteMentionItem[];
  
  /** Menu position */
  position: { top: number; left: number };
  
  /** Current search query */
  query: string;
  
  /** Loading state */
  isLoading?: boolean;
  
  /** Item template renderer */
  itemTemplate?: (item: RteMentionItem) => React.ReactNode;
  
  /** Callback when item selected */
  onSelect: (item: RteMentionItem) => void;
  
  /** Callback when menu should close */
  onClose: () => void;
}

export const MentionMenu: React.FC<MentionMenuProps> = ({
  items,
  position,
  isLoading = false,
  itemTemplate,
  onSelect,
  onClose,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  // Reset selection when items change
  useEffect(() => {
    setSelectedIndex(0);
  }, [items]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!items.length) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => (prev + 1) % items.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => (prev - 1 + items.length) % items.length);
          break;
        case 'Enter':
          e.preventDefault();
          if (items[selectedIndex]) {
            onSelect(items[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    },
    [items, selectedIndex, onSelect, onClose]
  );

  // Attach keyboard listener
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Scroll selected item into view
  useEffect(() => {
    const selectedElement = menuRef.current?.children[selectedIndex] as HTMLElement;
    selectedElement?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  // Default item renderer
  const renderItem = (item: RteMentionItem) => {
    if (itemTemplate) {
      return itemTemplate(item);
    }

    return (
      <>
        {item.avatarUrl ? (
          <img src={item.avatarUrl} alt={item.name} className={styles.mentionMenu__avatar} />
        ) : (
          <div
            className={styles.mentionMenu__avatar}
            style={{
              backgroundColor: item.backgroundColor || '#e5e7eb',
              color: item.color || '#6b7280',
            }}
          >
            {item.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className={styles.mentionMenu__content}>
          <div className={styles.mentionMenu__name}>{item.name}</div>
          {item.email && <div className={styles.mentionMenu__email}>{item.email}</div>}
        </div>
      </>
    );
  };

  if (isLoading) {
    return (
      <div
        className={styles.mentionMenu}
        style={{ top: `${position.top}px`, left: `${position.left}px` }}
      >
        <div className={styles.mentionMenu__loading}>Loading...</div>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div
        className={styles.mentionMenu}
        style={{ top: `${position.top}px`, left: `${position.left}px` }}
      >
        <div className={styles.mentionMenu__empty}>No users found</div>
      </div>
    );
  }

  return (
    <div
      ref={menuRef}
      className={styles.mentionMenu}
      style={{ top: `${position.top}px`, left: `${position.left}px` }}
      role="listbox"
      aria-label="Mention suggestions"
    >
      {items.map((item, index) => (
        <div
          key={item.id}
          className={`${styles.mentionMenu__item} ${
            index === selectedIndex ? styles['mentionMenu__item--selected'] : ''
          }`}
          onClick={() => onSelect(item)}
          role="option"
          aria-selected={index === selectedIndex}
        >
          {renderItem(item)}
        </div>
      ))}
    </div>
  );
};

export default MentionMenu;


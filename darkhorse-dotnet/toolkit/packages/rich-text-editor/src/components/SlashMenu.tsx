/**
 * Slash Menu Component
 * Provides quick command insertion via '/' trigger
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RteSlashMenuItem } from '../types';
import styles from './SlashMenu.module.css';

export interface SlashMenuProps {
  /** Menu items to display */
  items: RteSlashMenuItem[];
  
  /** Trigger position */
  position: { top: number; left: number };
  
  /** Search query for filtering */
  query: string;
  
  /** Callback when item selected */
  onSelect: (item: RteSlashMenuItem) => void;
  
  /** Callback when menu should close */
  onClose: () => void;
}

export const SlashMenu: React.FC<SlashMenuProps> = ({
  items,
  position,
  query,
  onSelect,
  onClose,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  // Filter items by query
  const filteredItems = query
    ? items.filter(
        item =>
          item.label.toLowerCase().includes(query.toLowerCase()) ||
          item.description?.toLowerCase().includes(query.toLowerCase())
      )
    : items;

  // Reset selection when filtered items change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!filteredItems.length) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => (prev + 1) % filteredItems.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => (prev - 1 + filteredItems.length) % filteredItems.length);
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredItems[selectedIndex]) {
            onSelect(filteredItems[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    },
    [filteredItems, selectedIndex, onSelect, onClose]
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

  if (!filteredItems.length) {
    return (
      <div
        className={styles.slashMenu}
        style={{ top: `${position.top}px`, left: `${position.left}px` }}
      >
        <div className={styles.slashMenu__empty}>No results found</div>
      </div>
    );
  }

  return (
    <div
      ref={menuRef}
      className={styles.slashMenu}
      style={{ top: `${position.top}px`, left: `${position.left}px` }}
      role="listbox"
      aria-label="Slash menu"
    >
      {filteredItems.map((item, index) => (
        <div
          key={item.id}
          className={`${styles.slashMenu__item} ${
            index === selectedIndex ? styles['slashMenu__item--selected'] : ''
          }`}
          onClick={() => onSelect(item)}
          role="option"
          aria-selected={index === selectedIndex}
        >
          {item.icon && <span className={styles.slashMenu__icon}>{item.icon}</span>}
          <div className={styles.slashMenu__content}>
            <div className={styles.slashMenu__label}>{item.label}</div>
            {item.description && (
              <div className={styles.slashMenu__description}>{item.description}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SlashMenu;


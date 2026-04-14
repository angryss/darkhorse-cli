import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Mention Menu Component
 * Provides @mention functionality with async data source
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './MentionMenu.module.css';
export const MentionMenu = ({ items, position, isLoading = false, itemTemplate, onSelect, onClose, }) => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const menuRef = useRef(null);
    // Reset selection when items change
    useEffect(() => {
        setSelectedIndex(0);
    }, [items]);
    // Handle keyboard navigation
    const handleKeyDown = useCallback((e) => {
        if (!items.length)
            return;
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
    }, [items, selectedIndex, onSelect, onClose]);
    // Attach keyboard listener
    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);
    // Scroll selected item into view
    useEffect(() => {
        const selectedElement = menuRef.current?.children[selectedIndex];
        selectedElement?.scrollIntoView({ block: 'nearest' });
    }, [selectedIndex]);
    // Default item renderer
    const renderItem = (item) => {
        if (itemTemplate) {
            return itemTemplate(item);
        }
        return (_jsxs(_Fragment, { children: [item.avatarUrl ? (_jsx("img", { src: item.avatarUrl, alt: item.name, className: styles.mentionMenu__avatar })) : (_jsx("div", { className: styles.mentionMenu__avatar, style: {
                        backgroundColor: item.backgroundColor || '#e5e7eb',
                        color: item.color || '#6b7280',
                    }, children: item.name.charAt(0).toUpperCase() })), _jsxs("div", { className: styles.mentionMenu__content, children: [_jsx("div", { className: styles.mentionMenu__name, children: item.name }), item.email && _jsx("div", { className: styles.mentionMenu__email, children: item.email })] })] }));
    };
    if (isLoading) {
        return (_jsx("div", { className: styles.mentionMenu, style: { top: `${position.top}px`, left: `${position.left}px` }, children: _jsx("div", { className: styles.mentionMenu__loading, children: "Loading..." }) }));
    }
    if (!items.length) {
        return (_jsx("div", { className: styles.mentionMenu, style: { top: `${position.top}px`, left: `${position.left}px` }, children: _jsx("div", { className: styles.mentionMenu__empty, children: "No users found" }) }));
    }
    return (_jsx("div", { ref: menuRef, className: styles.mentionMenu, style: { top: `${position.top}px`, left: `${position.left}px` }, role: "listbox", "aria-label": "Mention suggestions", children: items.map((item, index) => (_jsx("div", { className: `${styles.mentionMenu__item} ${index === selectedIndex ? styles['mentionMenu__item--selected'] : ''}`, onClick: () => onSelect(item), role: "option", "aria-selected": index === selectedIndex, children: renderItem(item) }, item.id))) }));
};
export default MentionMenu;
//# sourceMappingURL=MentionMenu.js.map
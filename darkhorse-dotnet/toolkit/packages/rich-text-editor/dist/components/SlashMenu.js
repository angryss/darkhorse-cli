import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Slash Menu Component
 * Provides quick command insertion via '/' trigger
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './SlashMenu.module.css';
export const SlashMenu = ({ items, position, query, onSelect, onClose, }) => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const menuRef = useRef(null);
    // Filter items by query
    const filteredItems = query
        ? items.filter(item => item.label.toLowerCase().includes(query.toLowerCase()) ||
            item.description?.toLowerCase().includes(query.toLowerCase()))
        : items;
    // Reset selection when filtered items change
    useEffect(() => {
        setSelectedIndex(0);
    }, [query]);
    // Handle keyboard navigation
    const handleKeyDown = useCallback((e) => {
        if (!filteredItems.length)
            return;
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
    }, [filteredItems, selectedIndex, onSelect, onClose]);
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
    if (!filteredItems.length) {
        return (_jsx("div", { className: styles.slashMenu, style: { top: `${position.top}px`, left: `${position.left}px` }, children: _jsx("div", { className: styles.slashMenu__empty, children: "No results found" }) }));
    }
    return (_jsx("div", { ref: menuRef, className: styles.slashMenu, style: { top: `${position.top}px`, left: `${position.left}px` }, role: "listbox", "aria-label": "Slash menu", children: filteredItems.map((item, index) => (_jsxs("div", { className: `${styles.slashMenu__item} ${index === selectedIndex ? styles['slashMenu__item--selected'] : ''}`, onClick: () => onSelect(item), role: "option", "aria-selected": index === selectedIndex, children: [item.icon && _jsx("span", { className: styles.slashMenu__icon, children: item.icon }), _jsxs("div", { className: styles.slashMenu__content, children: [_jsx("div", { className: styles.slashMenu__label, children: item.label }), item.description && (_jsx("div", { className: styles.slashMenu__description, children: item.description }))] })] }, item.id))) }));
};
export default SlashMenu;
//# sourceMappingURL=SlashMenu.js.map
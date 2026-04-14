import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Emoji Picker Component
 * Provides emoji selection with categories
 */
import { useState } from 'react';
import styles from './EmojiPicker.module.css';
// Emoji categories
const EMOJI_CATEGORIES = {
    'Smileys & People': [
        '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃',
        '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙',
        '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔',
        '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥',
        '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮',
        '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓',
    ],
    'Animals & Nature': [
        '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯',
        '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🐣',
        '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛',
        '🦋', '🐌', '🐞', '🐜', '🦗', '🕷️', '🦂', '🐢', '🐍', '🦎',
        '🌸', '🌺', '🌻', '🌷', '🌹', '🥀', '🌼', '🌱', '🌲', '🌳',
        '🌴', '🌵', '🌾', '🌿', '☘️', '🍀', '🍁', '🍂', '🍃',
    ],
    'Food & Drink': [
        '🍎', '🍏', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈', '🍒',
        '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🥑', '🍆', '🥔', '🥕',
        '🌽', '🌶️', '🥒', '🥬', '🥦', '🍄', '🥜', '🌰', '🍞', '🥐',
        '🥖', '🥨', '🥯', '🥞', '🧇', '🧀', '🍖', '🍗', '🥩', '🥓',
        '🍔', '🍟', '🍕', '🌭', '🥪', '🌮', '🌯', '🥙', '🥚', '🍳',
        '☕', '🍵', '🥤', '🧃', '🧉', '🍺', '🍻', '🥂', '🍷', '🍾',
    ],
    'Activities': [
        '⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱',
        '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '⛳', '🏹', '🎣', '🥊',
        '🥋', '🎽', '⛸️', '🥌', '🛷', '🛹', '🎿', '⛷️', '🏂', '🏋️',
        '🤸', '🤼', '🤽', '🤾', '🤺', '🧗', '🧘', '🏃', '🚴', '🏊',
        '🎯', '🎨', '🎭', '🎪', '🎬', '🎤', '🎧', '🎼', '🎹', '🥁',
        '🎷', '🎺', '🎸', '🎻', '🎲', '🎰', '🎳', '🎮', '🎱',
    ],
    'Travel & Places': [
        '🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐',
        '🚚', '🚛', '🚜', '🛴', '🚲', '🛵', '🏍️', '🛺', '🚨', '🚔',
        '🚍', '🚘', '🚖', '🚡', '🚠', '🚟', '🚃', '🚋', '🚞', '🚝',
        '🚄', '🚅', '🚈', '🚂', '🚆', '🚇', '🚊', '🚉', '✈️', '🛫',
        '🛬', '🛩️', '💺', '🚁', '🛰️', '🚀', '🛸', '🚢', '⛵', '🛥️',
        '🏠', '🏡', '🏢', '🏣', '🏤', '🏥', '🏦', '🏨', '🏩', '🏪',
    ],
    'Objects': [
        '⌚', '📱', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '🕹️', '🗜️',
        '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥', '📽️', '🎞️',
        '📞', '☎️', '📟', '📠', '📺', '📻', '🎙️', '🎚️', '🎛️', '⏱️',
        '⏲️', '⏰', '🕰️', '⌛', '⏳', '📡', '🔋', '🔌', '💡', '🔦',
        '🕯️', '🪔', '🧯', '🛢️', '💸', '💵', '💴', '💶', '💷', '💰',
        '🔨', '⚒️', '🛠️', '⛏️', '🔧', '🔩', '⚙️', '🗜️', '⚖️', '🔗',
    ],
    'Symbols': [
        '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
        '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️',
        '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐',
        '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐',
        '♑', '♒', '♓', '🆔', '⚛️', '🉑', '☢️', '☣️', '📴', '📳',
        '✅', '☑️', '✔️', '✖️', '❌', '❎', '➕', '➖', '➗', '➰',
    ],
};
export const EmojiPicker = ({ onSelect, onClose }) => {
    const [activeCategory, setActiveCategory] = useState(Object.keys(EMOJI_CATEGORIES)[0]);
    const [searchQuery, setSearchQuery] = useState('');
    const handleEmojiClick = (emoji) => {
        onSelect(emoji);
        onClose();
    };
    // Filter emojis by search
    const getFilteredEmojis = () => {
        if (!searchQuery) {
            return EMOJI_CATEGORIES[activeCategory] || [];
        }
        // Search across all categories
        const allEmojis = Object.values(EMOJI_CATEGORIES).flat();
        return allEmojis.filter(emoji => emoji.includes(searchQuery));
    };
    const filteredEmojis = getFilteredEmojis();
    return (_jsx("div", { className: styles.emojiPicker, onClick: onClose, children: _jsxs("div", { className: styles.emojiPicker__content, onClick: (e) => e.stopPropagation(), children: [_jsx("div", { className: styles.emojiPicker__header, children: _jsx("input", { type: "text", className: styles.emojiPicker__search, placeholder: "Search emoji...", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), autoFocus: true }) }), !searchQuery && (_jsx("div", { className: styles.emojiPicker__categories, children: Object.keys(EMOJI_CATEGORIES).map(category => (_jsx("button", { className: `${styles.emojiPicker__categoryButton} ${activeCategory === category ? styles['emojiPicker__categoryButton--active'] : ''}`, onClick: () => setActiveCategory(category), type: "button", children: category }, category))) })), _jsx("div", { className: styles.emojiPicker__grid, children: filteredEmojis.length > 0 ? (filteredEmojis.map((emoji, index) => (_jsx("button", { className: styles.emojiPicker__emoji, onClick: () => handleEmojiClick(emoji), type: "button", title: emoji, children: emoji }, `${emoji}-${index}`)))) : (_jsx("div", { className: styles.emojiPicker__empty, children: "No emoji found" })) })] }) }));
};
export default EmojiPicker;
//# sourceMappingURL=EmojiPicker.js.map
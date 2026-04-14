/**
 * Emoji Picker Component
 * Provides emoji selection with categories
 */

import React, { useState } from 'react';
import styles from './EmojiPicker.module.css';

export interface EmojiPickerProps {
  /** Callback when emoji selected */
  onSelect: (emoji: string) => void;
  
  /** Callback when picker should close */
  onClose: () => void;
}

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

export const EmojiPicker: React.FC<EmojiPickerProps> = ({ onSelect, onClose }) => {
  const [activeCategory, setActiveCategory] = useState(Object.keys(EMOJI_CATEGORIES)[0]);
  const [searchQuery, setSearchQuery] = useState('');

  const handleEmojiClick = (emoji: string) => {
    onSelect(emoji);
    onClose();
  };

  // Filter emojis by search
  const getFilteredEmojis = () => {
    if (!searchQuery) {
      return EMOJI_CATEGORIES[activeCategory as keyof typeof EMOJI_CATEGORIES] || [];
    }

    // Search across all categories
    const allEmojis = Object.values(EMOJI_CATEGORIES).flat();
    return allEmojis.filter(emoji => emoji.includes(searchQuery));
  };

  const filteredEmojis = getFilteredEmojis();

  return (
    <div className={styles.emojiPicker} onClick={onClose}>
      <div className={styles.emojiPicker__content} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.emojiPicker__header}>
          <input
            type="text"
            className={styles.emojiPicker__search}
            placeholder="Search emoji..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
        </div>

        {/* Categories */}
        {!searchQuery && (
          <div className={styles.emojiPicker__categories}>
            {Object.keys(EMOJI_CATEGORIES).map(category => (
              <button
                key={category}
                className={`${styles.emojiPicker__categoryButton} ${
                  activeCategory === category ? styles['emojiPicker__categoryButton--active'] : ''
                }`}
                onClick={() => setActiveCategory(category)}
                type="button"
              >
                {category}
              </button>
            ))}
          </div>
        )}

        {/* Emoji Grid */}
        <div className={styles.emojiPicker__grid}>
          {filteredEmojis.length > 0 ? (
            filteredEmojis.map((emoji, index) => (
              <button
                key={`${emoji}-${index}`}
                className={styles.emojiPicker__emoji}
                onClick={() => handleEmojiClick(emoji)}
                type="button"
                title={emoji}
              >
                {emoji}
              </button>
            ))
          ) : (
            <div className={styles.emojiPicker__empty}>No emoji found</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmojiPicker;


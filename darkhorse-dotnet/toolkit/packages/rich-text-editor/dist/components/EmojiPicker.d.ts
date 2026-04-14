/**
 * Emoji Picker Component
 * Provides emoji selection with categories
 */
import React from 'react';
export interface EmojiPickerProps {
    /** Callback when emoji selected */
    onSelect: (emoji: string) => void;
    /** Callback when picker should close */
    onClose: () => void;
}
export declare const EmojiPicker: React.FC<EmojiPickerProps>;
export default EmojiPicker;
//# sourceMappingURL=EmojiPicker.d.ts.map
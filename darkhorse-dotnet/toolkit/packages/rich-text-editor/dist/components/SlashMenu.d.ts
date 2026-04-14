/**
 * Slash Menu Component
 * Provides quick command insertion via '/' trigger
 */
import React from 'react';
import { RteSlashMenuItem } from '../types';
export interface SlashMenuProps {
    /** Menu items to display */
    items: RteSlashMenuItem[];
    /** Trigger position */
    position: {
        top: number;
        left: number;
    };
    /** Search query for filtering */
    query: string;
    /** Callback when item selected */
    onSelect: (item: RteSlashMenuItem) => void;
    /** Callback when menu should close */
    onClose: () => void;
}
export declare const SlashMenu: React.FC<SlashMenuProps>;
export default SlashMenu;
//# sourceMappingURL=SlashMenu.d.ts.map
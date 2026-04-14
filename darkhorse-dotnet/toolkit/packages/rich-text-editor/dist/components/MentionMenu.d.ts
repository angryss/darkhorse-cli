/**
 * Mention Menu Component
 * Provides @mention functionality with async data source
 */
import React from 'react';
import { RteMentionItem } from '../types';
export interface MentionMenuProps {
    /** Filtered mention items */
    items: RteMentionItem[];
    /** Menu position */
    position: {
        top: number;
        left: number;
    };
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
export declare const MentionMenu: React.FC<MentionMenuProps>;
export default MentionMenu;
//# sourceMappingURL=MentionMenu.d.ts.map
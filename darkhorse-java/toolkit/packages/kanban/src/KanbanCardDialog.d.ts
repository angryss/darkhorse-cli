/**
 * KanbanCardDialog Component
 * @module @react-toolkit/kanban
 */
import React from 'react';
import { KanbanCard, KanbanCardDialogField } from './types';
export interface KanbanCardDialogProps {
    card: KanbanCard;
    fields: KanbanCardDialogField[];
    open: boolean;
    onSave: (card: KanbanCard) => void;
    onDelete: (cardId: string | number) => void;
    onClose: () => void;
}
export declare const KanbanCardDialog: React.FC<KanbanCardDialogProps>;
//# sourceMappingURL=KanbanCardDialog.d.ts.map
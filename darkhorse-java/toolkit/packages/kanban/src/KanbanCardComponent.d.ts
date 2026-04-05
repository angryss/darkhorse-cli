/**
 * KanbanCardComponent
 * @module @react-toolkit/kanban
 */
import React from 'react';
import { KanbanCard } from './types';
export interface KanbanCardComponentProps {
    card: KanbanCard;
    columnKey: string;
    swimlaneValue: unknown;
    isSelected: boolean;
    isDragging: boolean;
    allowDragAndDrop: boolean;
    enableTooltip: boolean;
    cardTemplate?: (card: KanbanCard) => React.ReactNode;
    onClick: (card: KanbanCard, multiSelect: boolean) => void;
    onRendered?: (card: KanbanCard, element: HTMLElement) => void;
    onDragStart: (card: KanbanCard, columnKey: string, swimlaneValue: unknown) => void;
    onDragEnd: () => void;
}
export declare const KanbanCardComponent: React.FC<KanbanCardComponentProps>;
//# sourceMappingURL=KanbanCardComponent.d.ts.map
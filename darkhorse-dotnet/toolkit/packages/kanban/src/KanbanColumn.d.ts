/**
 * KanbanColumn Component
 * @module @react-toolkit/kanban
 */
import React from 'react';
import { KanbanCard, KanbanColumn, DragState } from './types';
export interface KanbanColumnComponentProps {
    column: KanbanColumn;
    cards: KanbanCard[];
    swimlaneValue: unknown;
    collapsed: boolean;
    selectedCards: Set<string | number>;
    dragState: DragState;
    allowDragAndDrop: boolean;
    allowToggle?: boolean;
    enableTooltip: boolean;
    cardTemplate?: (card: KanbanCard) => React.ReactNode;
    columnTemplate?: (column: KanbanColumn, cards: KanbanCard[]) => React.ReactNode;
    onCardClick: (card: KanbanCard, multiSelect: boolean) => void;
    onCardRendered?: (card: KanbanCard, element: HTMLElement) => void;
    onDragStart: (card: KanbanCard, columnKey: string, swimlaneValue: unknown) => void;
    onDragEnd: () => void;
    onDrop: (columnKey: string, swimlaneValue: unknown) => void;
    onColumnToggle: (columnKey: string) => void;
}
export declare const KanbanColumnComponent: React.FC<KanbanColumnComponentProps>;
//# sourceMappingURL=KanbanColumn.d.ts.map
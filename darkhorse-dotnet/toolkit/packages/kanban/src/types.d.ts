/**
 * Kanban Board Component Types
 * @module @react-toolkit/kanban
 */
import type { BaseComponentProps } from '../../core/src/types/common';
/**
 * Represents a card in the Kanban board
 */
export interface KanbanCard {
    /** Unique identifier for the card */
    id: string | number;
    /** Status/column key where the card belongs */
    status: string;
    /** Card title */
    title: string;
    /** Optional card description */
    summary?: string;
    /** Optional tags/labels */
    tags?: string[];
    /** Optional assignee */
    assignee?: string;
    /** Optional rank for ordering within column */
    rank?: string | number;
    /** Optional priority level */
    priority?: 'Low' | 'Medium' | 'High' | 'Critical' | string;
    /** Additional metadata */
    meta?: Record<string, unknown>;
    /** Allow additional properties for flexibility */
    [key: string]: unknown;
}
/**
 * Represents a column in the Kanban board
 */
export interface KanbanColumn {
    /** Unique key for the column */
    key: string;
    /** Display text for column header */
    headerText: string;
    /** Maximum number of cards allowed (WIP limit) */
    maxItems?: number;
    /** Allow column to be collapsed/expanded */
    allowToggle?: boolean;
    /** Custom template for column header */
    headerTemplate?: (column: KanbanColumn) => React.ReactNode;
}
/**
 * Configuration for swimlane grouping
 */
export interface KanbanSwimlaneSettings {
    /** Field name to group cards by */
    keyField: keyof KanbanCard | string;
    /** Custom template for swimlane label */
    labelTemplate?: (value: unknown) => React.ReactNode;
    /** Show unassigned items in separate lane */
    showUnassignedRow?: boolean;
}
/**
 * Selection mode for cards
 */
export type KanbanSelectionMode = 'Single' | 'Multiple' | 'None';
/**
 * Field configuration for dialog editor
 */
export interface KanbanCardDialogField {
    /** Field key from KanbanCard */
    key: keyof KanbanCard | string;
    /** Display label */
    label?: string;
    /** Input type */
    type: 'TextBox' | 'TextArea' | 'DropDown' | 'Tags' | 'Number' | 'Date';
    /** Required field */
    required?: boolean;
    /** Options for dropdown */
    options?: Array<{
        value: string;
        label: string;
    }>;
    /** Placeholder text */
    placeholder?: string;
}
/**
 * Props for KanbanBoard component
 */
export interface KanbanBoardProps extends BaseComponentProps {
    /** Array of cards to display */
    cards: KanbanCard[];
    /** Array of column definitions */
    columns: KanbanColumn[];
    /** Field name that maps cards to columns (default: 'status') */
    keyField?: keyof KanbanCard | string;
    /** Swimlane configuration */
    swimlaneSettings?: KanbanSwimlaneSettings;
    /** Enable tooltips on card hover */
    enableTooltip?: boolean;
    /** Selection mode */
    selectionMode?: KanbanSelectionMode;
    /** Enable drag and drop */
    allowDragAndDrop?: boolean;
    /** Allow card sorting within columns */
    allowCardSorting?: boolean;
    /** Allow columns to be collapsed */
    allowColumnToggle?: boolean;
    /** Custom card template */
    cardTemplate?: (card: KanbanCard) => React.ReactNode;
    /** Custom column template */
    columnTemplate?: (column: KanbanColumn, cards: KanbanCard[]) => React.ReactNode;
    /** Dialog editor field configuration */
    dialogFields?: KanbanCardDialogField[];
    /** Height of the board */
    height?: number | string;
    /** Width of the board */
    width?: number | string;
    /** Called when a card is dropped on a new column/swimlane */
    onCardDrop?: (card: KanbanCard, targetColumnKey: string, targetSwimlane?: unknown) => void;
    /** Called when a card is clicked */
    onCardClick?: (card: KanbanCard) => void;
    /** Called when card selection changes */
    onSelectionChange?: (selectedCards: KanbanCard[]) => void;
    /** Called after a card is rendered */
    onCardRendered?: (card: KanbanCard, element: HTMLElement) => void;
    /** Called when card is saved in dialog */
    onCardSave?: (card: KanbanCard) => void;
    /** Called when card is deleted in dialog */
    onCardDelete?: (cardId: string | number) => void;
    /** Called when column is toggled */
    onColumnToggle?: (columnKey: string, collapsed: boolean) => void;
    /** Called on error */
    onError?: (error: Error) => void;
}
/**
 * Internal state for drag and drop
 */
export interface DragState {
    card: KanbanCard | null;
    sourceColumnKey: string | null;
    sourceSwimlane: unknown;
    isDragging: boolean;
}
/**
 * Internal state for column collapse
 */
export interface ColumnState {
    [columnKey: string]: {
        collapsed: boolean;
    };
}
/**
 * Context for Kanban board operations
 */
export interface KanbanContext {
    selectedCards: Set<string | number>;
    dragState: DragState;
    columnStates: ColumnState;
    handleCardSelect: (card: KanbanCard, multiSelect: boolean) => void;
    handleDragStart: (card: KanbanCard, sourceColumnKey: string, sourceSwimlane: unknown) => void;
    handleDragEnd: () => void;
    handleDrop: (targetColumnKey: string, targetSwimlane: unknown) => void;
    handleColumnToggle: (columnKey: string) => void;
}
//# sourceMappingURL=types.d.ts.map
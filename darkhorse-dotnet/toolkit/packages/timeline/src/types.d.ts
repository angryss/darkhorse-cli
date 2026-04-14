/**
 * Timeline Component Types
 * @packageDocumentation
 */
import { CSSProperties, ReactNode } from 'react';
/**
 * Status types for timeline items
 */
export type TimelineItemStatus = 'completed' | 'inProgress' | 'pending' | 'error' | 'warning' | 'custom';
/**
 * Orientation of the timeline
 */
export type TimelineOrientation = 'vertical' | 'horizontal';
/**
 * Alignment of timeline items
 */
export type TimelineAlignment = 'start' | 'alternate';
/**
 * Visual variant of the timeline
 */
export type TimelineVariant = 'simple' | 'detailed';
/**
 * Individual timeline item data
 */
export interface TimelineItem {
    /** Unique identifier for the item */
    id: string;
    /** Main label/title text */
    label: string;
    /** Optional description text */
    description?: string;
    /** Optional timestamp (display string) */
    timestamp?: string;
    /** Item status (visual indicator) */
    status?: TimelineItemStatus;
    /** Optional icon/element for the marker */
    icon?: ReactNode;
    /** Optional custom content region */
    content?: ReactNode;
    /** Whether this item is currently active */
    isActive?: boolean;
    /** Additional metadata */
    meta?: Record<string, unknown>;
}
/**
 * Timeline component props
 */
export interface TimelineProps {
    /** Array of timeline items to display */
    items: TimelineItem[];
    /** Timeline orientation (default: 'vertical') */
    orientation?: TimelineOrientation;
    /** Timeline alignment (default: 'start') */
    alignment?: TimelineAlignment;
    /** Visual variant (default: 'simple') */
    variant?: TimelineVariant;
    /** Optional title for the timeline */
    title?: string;
    /** Show connector line between items (default: true) */
    showConnector?: boolean;
    /** Show marker dots for items (default: true) */
    showDots?: boolean;
    /** Show timestamps on items (default: true) */
    showTimestamps?: boolean;
    /** Custom render function for items */
    renderItem?: (item: TimelineItem, index: number) => ReactNode;
    /** Callback when an item is clicked */
    onItemClick?: (item: TimelineItem, index: number) => void;
    /** Callback when an item receives focus */
    onItemFocus?: (item: TimelineItem, index: number) => void;
    /** Additional CSS class name */
    className?: string;
    /** Inline styles */
    style?: CSSProperties;
    /** Error handler */
    onError?: (error: unknown) => void;
}
/**
 * Internal component props for timeline items
 */
export interface TimelineItemComponentProps {
    item: TimelineItem;
    index: number;
    orientation: TimelineOrientation;
    alignment: TimelineAlignment;
    variant: TimelineVariant;
    showConnector: boolean;
    showDots: boolean;
    showTimestamps: boolean;
    isLast: boolean;
    renderItem?: (item: TimelineItem, index: number) => ReactNode;
    onItemClick?: (item: TimelineItem, index: number) => void;
    onItemFocus?: (item: TimelineItem, index: number) => void;
}
//# sourceMappingURL=types.d.ts.map
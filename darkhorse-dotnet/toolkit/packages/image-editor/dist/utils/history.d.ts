/**
 * @file history.ts
 * @description History management for undo/redo functionality
 */
/**
 * History manager class
 */
export declare class HistoryManager {
    private history;
    private currentIndex;
    private limit;
    constructor(limit?: number);
    /**
     * Add state to history
     */
    push(imageData: ImageData): void;
    /**
     * Undo to previous state
     */
    undo(): ImageData | null;
    /**
     * Redo to next state
     */
    redo(): ImageData | null;
    /**
     * Check if can undo
     */
    canUndo(): boolean;
    /**
     * Check if can redo
     */
    canRedo(): boolean;
    /**
     * Get current state
     */
    current(): ImageData | null;
    /**
     * Clear history
     */
    clear(): void;
    /**
     * Reset to specific state
     */
    reset(imageData: ImageData): void;
    /**
     * Get history length
     */
    length(): number;
    /**
     * Clone image data
     */
    private cloneImageData;
}
//# sourceMappingURL=history.d.ts.map
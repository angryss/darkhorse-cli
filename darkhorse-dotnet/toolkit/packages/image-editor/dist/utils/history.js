/**
 * @file history.ts
 * @description History management for undo/redo functionality
 */
/**
 * History manager class
 */
export class HistoryManager {
    constructor(limit = 50) {
        this.history = [];
        this.currentIndex = -1;
        this.limit = limit;
    }
    /**
     * Add state to history
     */
    push(imageData) {
        // Remove any states after current index
        this.history = this.history.slice(0, this.currentIndex + 1);
        // Add new state
        this.history.push({
            imageData: this.cloneImageData(imageData),
            timestamp: Date.now(),
        });
        // Enforce limit
        if (this.history.length > this.limit) {
            this.history.shift();
        }
        else {
            this.currentIndex++;
        }
    }
    /**
     * Undo to previous state
     */
    undo() {
        if (this.canUndo()) {
            this.currentIndex--;
            const state = this.history[this.currentIndex];
            return state ? this.cloneImageData(state.imageData) : null;
        }
        return null;
    }
    /**
     * Redo to next state
     */
    redo() {
        if (this.canRedo()) {
            this.currentIndex++;
            const state = this.history[this.currentIndex];
            return state ? this.cloneImageData(state.imageData) : null;
        }
        return null;
    }
    /**
     * Check if can undo
     */
    canUndo() {
        return this.currentIndex > 0;
    }
    /**
     * Check if can redo
     */
    canRedo() {
        return this.currentIndex < this.history.length - 1;
    }
    /**
     * Get current state
     */
    current() {
        if (this.currentIndex >= 0 && this.currentIndex < this.history.length) {
            const state = this.history[this.currentIndex];
            return state ? this.cloneImageData(state.imageData) : null;
        }
        return null;
    }
    /**
     * Clear history
     */
    clear() {
        this.history = [];
        this.currentIndex = -1;
    }
    /**
     * Reset to specific state
     */
    reset(imageData) {
        this.clear();
        this.push(imageData);
    }
    /**
     * Get history length
     */
    length() {
        return this.history.length;
    }
    /**
     * Clone image data
     */
    cloneImageData(imageData) {
        return new ImageData(new Uint8ClampedArray(imageData.data), imageData.width, imageData.height);
    }
}
//# sourceMappingURL=history.js.map
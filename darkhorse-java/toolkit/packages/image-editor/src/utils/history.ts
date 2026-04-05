/**
 * @file history.ts
 * @description History management for undo/redo functionality
 */

import { HistoryState } from '../types';

/**
 * History manager class
 */
export class HistoryManager {
  private history: HistoryState[] = [];
  private currentIndex: number = -1;
  private limit: number;

  constructor(limit: number = 50) {
    this.limit = limit;
  }

  /**
   * Add state to history
   */
  push(imageData: ImageData): void {
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
    } else {
      this.currentIndex++;
    }
  }

  /**
   * Undo to previous state
   */
  undo(): ImageData | null {
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
  redo(): ImageData | null {
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
  canUndo(): boolean {
    return this.currentIndex > 0;
  }

  /**
   * Check if can redo
   */
  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  /**
   * Get current state
   */
  current(): ImageData | null {
    if (this.currentIndex >= 0 && this.currentIndex < this.history.length) {
      const state = this.history[this.currentIndex];
      return state ? this.cloneImageData(state.imageData) : null;
    }
    return null;
  }

  /**
   * Clear history
   */
  clear(): void {
    this.history = [];
    this.currentIndex = -1;
  }

  /**
   * Reset to specific state
   */
  reset(imageData: ImageData): void {
    this.clear();
    this.push(imageData);
  }

  /**
   * Get history length
   */
  length(): number {
    return this.history.length;
  }

  /**
   * Clone image data
   */
  private cloneImageData(imageData: ImageData): ImageData {
    return new ImageData(
      new Uint8ClampedArray(imageData.data),
      imageData.width,
      imageData.height
    );
  }
}


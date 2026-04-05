/**
 * Keyboard utility functions and constants
 */
/**
 * Common keyboard key codes
 */
export declare const KeyCode: {
    readonly Enter: "Enter";
    readonly Escape: "Escape";
    readonly Space: " ";
    readonly ArrowUp: "ArrowUp";
    readonly ArrowDown: "ArrowDown";
    readonly ArrowLeft: "ArrowLeft";
    readonly ArrowRight: "ArrowRight";
    readonly Tab: "Tab";
    readonly Home: "Home";
    readonly End: "End";
    readonly PageUp: "PageUp";
    readonly PageDown: "PageDown";
    readonly Backspace: "Backspace";
    readonly Delete: "Delete";
};
/**
 * Check if a keyboard event has modifier keys
 */
export declare function hasModifier(event: KeyboardEvent): boolean;
/**
 * Check if event is a navigation key
 */
export declare function isNavigationKey(event: KeyboardEvent): boolean;
/**
 * Prevent default behavior for keyboard event
 */
export declare function preventDefaultKeys(event: KeyboardEvent, keys: string[]): void;
//# sourceMappingURL=keyboard.d.ts.map
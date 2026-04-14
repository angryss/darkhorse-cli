/**
 * Keyboard utility functions and constants
 */
/**
 * Common keyboard key codes
 */
export const KeyCode = {
    Enter: 'Enter',
    Escape: 'Escape',
    Space: ' ',
    ArrowUp: 'ArrowUp',
    ArrowDown: 'ArrowDown',
    ArrowLeft: 'ArrowLeft',
    ArrowRight: 'ArrowRight',
    Tab: 'Tab',
    Home: 'Home',
    End: 'End',
    PageUp: 'PageUp',
    PageDown: 'PageDown',
    Backspace: 'Backspace',
    Delete: 'Delete',
};
/**
 * Check if a keyboard event has modifier keys
 */
export function hasModifier(event) {
    return event.ctrlKey || event.metaKey || event.altKey || event.shiftKey;
}
/**
 * Check if event is a navigation key
 */
export function isNavigationKey(event) {
    return [
        KeyCode.ArrowUp,
        KeyCode.ArrowDown,
        KeyCode.ArrowLeft,
        KeyCode.ArrowRight,
        KeyCode.Home,
        KeyCode.End,
        KeyCode.PageUp,
        KeyCode.PageDown,
    ].includes(event.key);
}
/**
 * Prevent default behavior for keyboard event
 */
export function preventDefaultKeys(event, keys) {
    if (keys.includes(event.key)) {
        event.preventDefault();
    }
}
//# sourceMappingURL=keyboard.js.map
/**
 * DOM utility functions
 */
/**
 * Check if an element is visible in the viewport
 */
export function isElementInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth));
}
/**
 * Scroll an element into view smoothly
 */
export function scrollIntoView(element, options) {
    element.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest',
        ...options,
    });
}
/**
 * Get scroll parent of an element
 */
export function getScrollParent(element) {
    let parent = element.parentElement;
    while (parent) {
        const { overflow, overflowY } = window.getComputedStyle(parent);
        if (overflow === 'auto' || overflow === 'scroll' || overflowY === 'auto' || overflowY === 'scroll') {
            return parent;
        }
        parent = parent.parentElement;
    }
    return document.documentElement;
}
/**
 * Check if click is outside an element
 */
export function isClickOutside(event, element) {
    return !element.contains(event.target);
}
//# sourceMappingURL=dom.js.map
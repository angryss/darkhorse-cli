/**
 * HTML Sanitization Utilities
 * Prevents XSS attacks by sanitizing HTML content
 */
/**
 * Allowed HTML tags
 */
const ALLOWED_TAGS = [
    'p', 'br', 'div', 'span',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'strong', 'b', 'em', 'i', 'u', 's', 'strike',
    'code', 'pre',
    'a',
    'ul', 'ol', 'li',
    'blockquote',
    'img',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'sub', 'sup',
    'hr',
];
/**
 * Allowed attributes by tag
 */
const ALLOWED_ATTRIBUTES = {
    '*': ['class', 'style', 'id', 'data-mention-id'],
    'a': ['href', 'target', 'rel', 'title'],
    'img': ['src', 'alt', 'width', 'height', 'title'],
    'table': ['border', 'cellpadding', 'cellspacing'],
    'td': ['colspan', 'rowspan'],
    'th': ['colspan', 'rowspan'],
};
/**
 * Allowed CSS properties
 */
const ALLOWED_STYLES = [
    'color',
    'background-color',
    'font-size',
    'font-family',
    'font-weight',
    'font-style',
    'text-align',
    'text-decoration',
    'padding',
    'margin',
    'border',
    'width',
    'height',
];
/**
 * Sanitize HTML content to prevent XSS
 */
export function sanitizeHtml(html) {
    // Create a temporary DOM element
    const div = document.createElement('div');
    div.innerHTML = html;
    // Recursive function to clean nodes
    const cleanNode = (node) => {
        // Text nodes are safe
        if (node.nodeType === Node.TEXT_NODE) {
            return node.cloneNode(true);
        }
        // Only process element nodes
        if (node.nodeType !== Node.ELEMENT_NODE) {
            return null;
        }
        const element = node;
        const tagName = element.tagName.toLowerCase();
        // Remove disallowed tags
        if (!ALLOWED_TAGS.includes(tagName)) {
            return null;
        }
        // Create clean element
        const cleanElement = document.createElement(tagName);
        // Copy allowed attributes
        const allowedAttrs = [
            ...(ALLOWED_ATTRIBUTES['*'] || []),
            ...(ALLOWED_ATTRIBUTES[tagName] || []),
        ];
        Array.from(element.attributes).forEach(attr => {
            const attrName = attr.name.toLowerCase();
            if (allowedAttrs.includes(attrName)) {
                let attrValue = attr.value;
                // Special handling for href and src
                if (attrName === 'href' || attrName === 'src') {
                    // Block javascript: and data: URLs (except data:image)
                    if (attrValue.toLowerCase().startsWith('javascript:')) {
                        return;
                    }
                    if (attrValue.toLowerCase().startsWith('data:') && !attrValue.toLowerCase().startsWith('data:image/')) {
                        return;
                    }
                }
                // Sanitize style attribute
                if (attrName === 'style') {
                    attrValue = sanitizeStyle(attrValue);
                }
                cleanElement.setAttribute(attrName, attrValue);
            }
        });
        // Recursively clean children
        Array.from(element.childNodes).forEach(child => {
            const cleanChild = cleanNode(child);
            if (cleanChild) {
                cleanElement.appendChild(cleanChild);
            }
        });
        return cleanElement;
    };
    // Clean all child nodes
    const fragment = document.createDocumentFragment();
    Array.from(div.childNodes).forEach(child => {
        const cleanChild = cleanNode(child);
        if (cleanChild) {
            fragment.appendChild(cleanChild);
        }
    });
    // Convert back to HTML
    const cleanDiv = document.createElement('div');
    cleanDiv.appendChild(fragment);
    return cleanDiv.innerHTML;
}
/**
 * Sanitize inline CSS
 */
function sanitizeStyle(style) {
    const styles = style.split(';').map(s => s.trim()).filter(Boolean);
    const cleanStyles = [];
    styles.forEach(stylePair => {
        const [property, value] = stylePair.split(':').map(s => s.trim());
        if (!property || !value)
            return;
        const propLower = property.toLowerCase();
        // Only allow whitelisted properties
        if (ALLOWED_STYLES.includes(propLower)) {
            // Block javascript or expressions in values
            if (value.toLowerCase().includes('javascript:') ||
                value.toLowerCase().includes('expression(') ||
                value.toLowerCase().includes('url(javascript:')) {
                return;
            }
            cleanStyles.push(`${property}: ${value}`);
        }
    });
    return cleanStyles.join('; ');
}
/**
 * Strip all HTML tags
 */
export function stripHtml(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
}
/**
 * Get character count from HTML (excluding tags)
 */
export function getCharacterCount(html) {
    return stripHtml(html).length;
}
//# sourceMappingURL=sanitize.js.map
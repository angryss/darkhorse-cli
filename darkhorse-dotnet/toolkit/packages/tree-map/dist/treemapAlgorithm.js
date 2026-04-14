/**
 * Squarified Treemap Algorithm
 * Based on: Bruls, M., Huizing, K., & van Wijk, J. J. (2000)
 */
/**
 * Build hierarchical tree from flat data
 */
export function buildHierarchy(data, parentIdPath = 'parentId') {
    const itemMap = new Map();
    const roots = [];
    // Create nodes
    for (const item of data) {
        itemMap.set(item.id, {
            item,
            children: [],
            totalValue: item.value || 0,
        });
    }
    // Build hierarchy
    for (const item of data) {
        const node = itemMap.get(item.id);
        if (!node)
            continue;
        const parentId = item[parentIdPath];
        if (parentId === null || parentId === undefined) {
            roots.push(node);
        }
        else {
            const parent = itemMap.get(parentId);
            if (parent) {
                parent.children.push(node);
            }
            else {
                // Parent not found, treat as root
                roots.push(node);
            }
        }
    }
    // Calculate total values (sum of children)
    function calculateTotalValue(node) {
        if (node.children.length === 0) {
            return node.item.value || 0;
        }
        node.totalValue = node.children.reduce((sum, child) => sum + calculateTotalValue(child), 0);
        return node.totalValue;
    }
    for (const root of roots) {
        calculateTotalValue(root);
    }
    return roots;
}
/**
 * Layout rectangles using squarified treemap algorithm
 */
export function layoutTreeMap(nodes, x, y, width, height, depth = 0, gap = 2, getColor) {
    if (nodes.length === 0 || width <= 0 || height <= 0) {
        return [];
    }
    // Apply gap
    const innerX = x + gap;
    const innerY = y + gap;
    const innerWidth = Math.max(0, width - gap * 2);
    const innerHeight = Math.max(0, height - gap * 2);
    if (innerWidth <= 0 || innerHeight <= 0) {
        return [];
    }
    const totalValue = nodes.reduce((sum, node) => sum + node.totalValue, 0);
    if (totalValue === 0) {
        return [];
    }
    const rects = [];
    const sortedNodes = [...nodes].sort((a, b) => b.totalValue - a.totalValue);
    squarify(sortedNodes, [], innerX, innerY, innerWidth, innerHeight, totalValue, innerWidth >= innerHeight ? innerWidth : innerHeight, depth, gap, getColor, rects);
    return rects;
}
/**
 * Squarified treemap recursive function
 */
function squarify(nodes, row, x, y, width, height, totalValue, length, depth, gap, getColor, rects) {
    if (nodes.length === 0) {
        if (row.length > 0) {
            layoutRow(row, x, y, width, height, totalValue, length, depth, gap, getColor, rects);
        }
        return;
    }
    const node = nodes[0];
    if (!node)
        return;
    const newRow = [...row, node];
    if (row.length === 0) {
        // First element in row
        squarify(nodes.slice(1), newRow, x, y, width, height, totalValue, length, depth, gap, getColor, rects);
    }
    else {
        const currentWorst = worst(row, totalValue, length);
        const newWorst = worst(newRow, totalValue, length);
        if (currentWorst >= newWorst) {
            // Adding node improves aspect ratio
            squarify(nodes.slice(1), newRow, x, y, width, height, totalValue, length, depth, gap, getColor, rects);
        }
        else {
            // Layout current row and start new row
            const rowValue = row.reduce((sum, n) => sum + n.totalValue, 0);
            const rowLength = (rowValue / totalValue) * length;
            if (width >= height) {
                // Horizontal layout
                layoutRow(row, x, y, rowLength, height, rowValue, height, depth, gap, getColor, rects);
                squarify(nodes, [], x + rowLength, y, width - rowLength, height, totalValue - rowValue, height, depth, gap, getColor, rects);
            }
            else {
                // Vertical layout
                layoutRow(row, x, y, width, rowLength, rowValue, width, depth, gap, getColor, rects);
                squarify(nodes, [], x, y + rowLength, width, height - rowLength, totalValue - rowValue, width, depth, gap, getColor, rects);
            }
        }
    }
}
/**
 * Layout a single row of rectangles
 */
function layoutRow(row, x, y, width, height, totalValue, length, depth, gap, getColor, rects) {
    if (totalValue === 0)
        return;
    let offset = 0;
    for (const node of row) {
        const value = node.totalValue;
        const ratio = value / totalValue;
        let rectX, rectY, rectWidth, rectHeight;
        if (width >= height) {
            // Horizontal row
            rectX = x;
            rectY = y + offset;
            rectWidth = width;
            rectHeight = ratio * length;
            offset += rectHeight;
        }
        else {
            // Vertical row
            rectX = x + offset;
            rectY = y;
            rectWidth = ratio * length;
            rectHeight = height;
            offset += rectWidth;
        }
        const rect = {
            item: node.item,
            x: rectX,
            y: rectY,
            width: rectWidth,
            height: rectHeight,
            color: getColor(node, depth),
            depth,
        };
        // Recursively layout children
        if (node.children.length > 0) {
            rect.children = layoutTreeMap(node.children, rectX, rectY, rectWidth, rectHeight, depth + 1, gap, getColor);
        }
        rects.push(rect);
    }
}
/**
 * Calculate worst aspect ratio in a row
 */
function worst(row, totalValue, length) {
    if (row.length === 0 || totalValue === 0 || length === 0) {
        return Infinity;
    }
    const values = row.map(node => node.totalValue);
    const sum = values.reduce((a, b) => a + b, 0);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const lengthSquared = length * length;
    const sumSquared = sum * sum;
    return Math.max((lengthSquared * max) / sumSquared, sumSquared / (lengthSquared * min));
}
/**
 * Flatten rectangle tree for rendering
 */
export function flattenRects(rects) {
    const flat = [];
    function traverse(rect) {
        flat.push(rect);
        if (rect.children) {
            rect.children.forEach(traverse);
        }
    }
    rects.forEach(traverse);
    return flat;
}
//# sourceMappingURL=treemapAlgorithm.js.map
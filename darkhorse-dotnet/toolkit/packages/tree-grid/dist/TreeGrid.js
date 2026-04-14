import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * TreeGrid Component
 * Displays hierarchical tabular data with expand/collapse, sorting, filtering, and selection
 */
import { useState, useCallback, useMemo, useEffect, forwardRef } from 'react';
import { cn } from './utils';
import styles from './TreeGrid.module.css';
/**
 * TreeGrid component for hierarchical data display
 */
export const TreeGrid = forwardRef(({ data, childField = 'children', columns, height, allowReordering = false, allowFiltering = false, allowSorting = false, filterSettings, allowSelection = false, selectionSettings, initiallyExpandedIds = [], onToggleExpand, onSortChange, onFilterChange, onColumnReorder, onRowClick, onSelectionChange, onError, className, style, ...rest }, ref) => {
    // Expanded state
    const [expandedIds, setExpandedIds] = useState(new Set(initiallyExpandedIds));
    // Sort state
    const [sortColumn, setSortColumn] = useState(null);
    const [sortDirection, setSortDirection] = useState(undefined);
    // Selection state
    const [selectedRows, setSelectedRows] = useState(new Set());
    // Column order state
    const [columnOrder, setColumnOrder] = useState(columns);
    // Update column order when columns prop changes
    useEffect(() => {
        setColumnOrder(columns);
    }, [columns]);
    /**
     * Flatten hierarchical data into a linear array with level information
     */
    const flattenData = useCallback((records, level = 0, parentId) => {
        const result = [];
        for (const record of records) {
            const children = record[childField];
            const hasChildren = Array.isArray(children) && children.length > 0;
            const isExpanded = expandedIds.has(record.id);
            result.push({
                record,
                level,
                hasChildren,
                parentId,
            });
            // If expanded and has children, recursively add children
            if (isExpanded && hasChildren) {
                result.push(...flattenData(children, level + 1, record.id));
            }
        }
        return result;
    }, [childField, expandedIds]);
    /**
     * Sort flattened data hierarchically
     */
    const sortData = useCallback((rows) => {
        if (!sortColumn || !sortDirection)
            return rows;
        const sortRecursive = (items) => {
            // Group by level and parent
            const grouped = new Map();
            for (const item of items) {
                const key = `${item.level}-${item.parentId ?? 'root'}`;
                if (!grouped.has(key)) {
                    grouped.set(key, []);
                }
                grouped.get(key).push(item);
            }
            // Sort each group
            const result = [];
            for (const group of grouped.values()) {
                const sorted = [...group].sort((a, b) => {
                    const aVal = a.record[sortColumn.field];
                    const bVal = b.record[sortColumn.field];
                    let comparison = 0;
                    if (typeof aVal === 'string' && typeof bVal === 'string') {
                        comparison = aVal.localeCompare(bVal);
                    }
                    else if (typeof aVal === 'number' && typeof bVal === 'number') {
                        comparison = aVal - bVal;
                    }
                    else {
                        comparison = String(aVal).localeCompare(String(bVal));
                    }
                    return sortDirection === 'asc' ? comparison : -comparison;
                });
                result.push(...sorted);
            }
            return result;
        };
        return sortRecursive(rows);
    }, [sortColumn, sortDirection]);
    /**
     * Get flattened and sorted rows
     */
    const visibleRows = useMemo(() => {
        const flattened = flattenData(data);
        return sortData(flattened);
    }, [data, flattenData, sortData]);
    /**
     * Toggle row expansion
     */
    const handleToggleExpand = useCallback((record) => {
        try {
            const isExpanded = expandedIds.has(record.id);
            const newExpandedIds = new Set(expandedIds);
            if (isExpanded) {
                newExpandedIds.delete(record.id);
            }
            else {
                newExpandedIds.add(record.id);
            }
            setExpandedIds(newExpandedIds);
            if (onToggleExpand) {
                const args = {
                    record,
                    expanded: !isExpanded,
                };
                onToggleExpand(args);
            }
        }
        catch (error) {
            onError?.(error);
        }
    }, [expandedIds, onToggleExpand, onError]);
    /**
     * Handle column header click for sorting
     */
    const handleHeaderClick = useCallback((column) => {
        if (!allowSorting || column.allowSorting === false)
            return;
        try {
            let newDirection;
            if (sortColumn?.field === column.field) {
                // Cycle through: asc -> desc -> none
                if (sortDirection === 'asc') {
                    newDirection = 'desc';
                }
                else if (sortDirection === 'desc') {
                    newDirection = undefined;
                }
                else {
                    newDirection = 'asc';
                }
            }
            else {
                newDirection = 'asc';
            }
            setSortColumn(newDirection ? column : null);
            setSortDirection(newDirection);
            if (onSortChange) {
                const args = {
                    column,
                    direction: newDirection,
                };
                onSortChange(args);
            }
        }
        catch (error) {
            onError?.(error);
        }
    }, [allowSorting, sortColumn, sortDirection, onSortChange, onError]);
    /**
     * Handle row click
     */
    const handleRowClick = useCallback((record, rowIndex, event) => {
        try {
            if (allowSelection) {
                const newSelectedRows = new Set(selectedRows);
                if (selectionSettings?.type === 'Multiple' && (event.ctrlKey || event.metaKey)) {
                    // Toggle selection
                    if (newSelectedRows.has(record.id)) {
                        newSelectedRows.delete(record.id);
                    }
                    else {
                        newSelectedRows.add(record.id);
                    }
                }
                else {
                    // Single selection
                    newSelectedRows.clear();
                    newSelectedRows.add(record.id);
                }
                setSelectedRows(newSelectedRows);
                if (onSelectionChange) {
                    onSelectionChange({
                        selection: Array.from(newSelectedRows),
                    });
                }
            }
            if (onRowClick) {
                const args = {
                    record,
                    rowIndex,
                    originalEvent: event,
                };
                onRowClick(args);
            }
        }
        catch (error) {
            onError?.(error);
        }
    }, [allowSelection, selectedRows, selectionSettings, onRowClick, onSelectionChange, onError]);
    /**
     * Get cell value using column's valueAccessor or field
     */
    const getCellValue = useCallback((column, record) => {
        if (column.valueAccessor) {
            return column.valueAccessor(column.field, record);
        }
        return record[column.field];
    }, []);
    /**
     * Render cell content
     */
    const renderCell = useCallback((column, record, rowIndex, columnIndex, isTreeColumn, level, hasChildren) => {
        const value = getCellValue(column, record);
        // Tree column with expand/collapse
        if (isTreeColumn) {
            return (_jsxs("div", { className: styles.treeCellContent, style: { paddingLeft: `${level * 20}px` }, children: [hasChildren ? (_jsx("button", { type: "button", className: cn(styles.expandButton, expandedIds.has(record.id) && styles.expanded), onClick: (e) => {
                            e.stopPropagation();
                            handleToggleExpand(record);
                        }, "aria-label": expandedIds.has(record.id) ? 'Collapse' : 'Expand', "aria-expanded": expandedIds.has(record.id), children: _jsx("span", { className: styles.expandIcon, children: "\u25B6" }) })) : (_jsx("span", { className: styles.expandPlaceholder })), _jsx("span", { className: styles.cellValue, children: column.template
                            ? column.template({ record, column, value, rowIndex, columnIndex })
                            : String(value ?? '') })] }));
        }
        // Regular cell
        if (column.template) {
            return column.template({ record, column, value, rowIndex, columnIndex });
        }
        return String(value ?? '');
    }, [getCellValue, expandedIds, handleToggleExpand]);
    /**
     * Render sort indicator
     */
    const renderSortIndicator = (column) => {
        if (!allowSorting || column.allowSorting === false)
            return null;
        if (sortColumn?.field !== column.field)
            return null;
        return (_jsx("span", { className: styles.sortIndicator, "aria-label": `Sorted ${sortDirection}`, children: sortDirection === 'asc' ? '▲' : '▼' }));
    };
    // Empty state
    if (!data || data.length === 0) {
        return (_jsx("div", { ref: ref, className: cn(styles.treeGrid, styles.empty, className), style: style, ...rest, children: _jsx("div", { className: styles.emptyState, children: "No data available" }) }));
    }
    return (_jsx("div", { ref: ref, className: cn(styles.treeGrid, className), style: { ...style, height }, role: "treegrid", "aria-label": "Tree Grid", ...rest, children: _jsxs("div", { className: styles.gridContainer, children: [_jsx("div", { className: styles.header, role: "row", children: columnOrder.map((column) => (_jsxs("div", { className: cn(styles.headerCell, allowSorting && column.allowSorting !== false && styles.sortable), style: {
                            width: column.width,
                            textAlign: column.textAlign?.toLowerCase(),
                        }, role: "columnheader", onClick: () => handleHeaderClick(column), tabIndex: allowSorting && column.allowSorting !== false ? 0 : undefined, onKeyDown: (e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handleHeaderClick(column);
                            }
                        }, children: [_jsx("span", { className: styles.headerText, children: column.headerText || column.field }), renderSortIndicator(column)] }, column.field))) }), _jsx("div", { className: styles.body, children: visibleRows.map((row, rowIndex) => {
                        const record = row.record;
                        return (_jsx("div", { className: cn(styles.row, selectedRows.has(record.id) && styles.selected), role: "row", "aria-level": row.level + 1, "aria-expanded": row.hasChildren ? expandedIds.has(record.id) : undefined, onClick: (e) => handleRowClick(record, rowIndex, e), tabIndex: 0, children: columnOrder.map((column, colIdx) => (_jsx("div", { className: styles.cell, style: {
                                    width: column.width,
                                    textAlign: column.textAlign?.toLowerCase(),
                                }, role: "gridcell", children: renderCell(column, record, rowIndex, colIdx, colIdx === 0, // First column is tree column
                                row.level, row.hasChildren) }, column.field))) }, record.id));
                    }) })] }) }));
});
TreeGrid.displayName = 'TreeGrid';
//# sourceMappingURL=TreeGrid.js.map
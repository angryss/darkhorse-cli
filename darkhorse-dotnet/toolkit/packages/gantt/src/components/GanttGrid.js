import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * GanttGrid - Tree grid displaying task information
 */
import { useCallback } from 'react';
import styles from '../GanttChart.module.css';
export const GanttGrid = ({ nodes, columns, selectedTaskIds, rowHeight, onTaskClick, onExpandToggle, }) => {
    const renderCellValue = useCallback((task, column) => {
        if (column.template) {
            return column.template(task);
        }
        const value = task[column.field];
        return value !== undefined && value !== null ? String(value) : '';
    }, []);
    const renderRow = useCallback((node) => {
        const isSelected = selectedTaskIds.has(node.task.id);
        const hasChildren = node.children.length > 0;
        return (_jsx("div", { className: `${styles.gridRow} ${isSelected ? styles.gridRowSelected : ''} ${node.task.isSummary ? styles.gridRowSummary : ''}`, style: { height: rowHeight }, onClick: () => onTaskClick(node.task), role: "row", "aria-selected": isSelected, children: columns.map((column, colIndex) => (_jsxs("div", { className: styles.gridCell, style: {
                    width: column.width || 'auto',
                    textAlign: column.textAlign || 'left',
                    paddingLeft: colIndex === 0 ? node.level * 20 + 8 : undefined,
                }, role: "gridcell", children: [colIndex === 0 && hasChildren && (_jsx("button", { className: styles.expandButton, onClick: (e) => {
                            e.stopPropagation();
                            onExpandToggle(node.task.id);
                        }, "aria-label": node.expanded ? 'Collapse' : 'Expand', "aria-expanded": node.expanded, children: node.expanded ? '▼' : '▶' })), _jsx("span", { className: styles.gridCellContent, title: column.clipMode === 'EllipsisWithTooltip'
                            ? String(renderCellValue(node.task, column))
                            : undefined, children: renderCellValue(node.task, column) })] }, column.field))) }, node.task.id));
    }, [columns, selectedTaskIds, rowHeight, onTaskClick, onExpandToggle, renderCellValue]);
    return (_jsxs("div", { className: styles.grid, role: "treegrid", "aria-label": "Task list", children: [_jsx("div", { className: styles.gridHeader, role: "row", children: columns.map((column) => (_jsx("div", { className: styles.gridHeaderCell, style: {
                        width: column.width || 'auto',
                        textAlign: column.textAlign || 'left',
                    }, role: "columnheader", children: column.headerText || column.field }, column.field))) }), _jsx("div", { className: styles.gridBody, children: nodes.map((node) => renderRow(node)) })] }));
};
//# sourceMappingURL=GanttGrid.js.map
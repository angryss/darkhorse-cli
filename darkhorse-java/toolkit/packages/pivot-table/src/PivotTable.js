import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Pivot Table Component
 * Interactive multi-dimensional data analysis component
 */
import { useMemo, forwardRef, useState } from 'react';
import { buildPivotMatrix, exportToCSV } from './pivotEngine';
import { cn } from './utils';
import styles from './PivotTable.module.css';
/**
 * PivotTable component for multi-dimensional data analysis
 */
export const PivotTable = forwardRef(({ id, data, config, height, width = '100%', showToolbar = true, allowExcelExport = false, allowCsvExport = true, onExport, onCellClick, onDrillThrough, onError, className, style, }, ref) => {
    const [drillThroughData, setDrillThroughData] = useState(null);
    // Build pivot matrix
    const matrix = useMemo(() => {
        try {
            if (!data || data.length === 0) {
                return null;
            }
            return buildPivotMatrix(data, config);
        }
        catch (error) {
            onError?.(error);
            return null;
        }
    }, [data, config, onError]);
    // Handle export
    const handleExport = (format) => {
        try {
            if (!matrix)
                return;
            if (format === 'csv') {
                const csvContent = exportToCSV(matrix);
                const blob = new Blob([csvContent], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'pivot-table.csv';
                a.click();
                URL.revokeObjectURL(url);
            }
            onExport?.({ format });
        }
        catch (error) {
            onError?.(error);
        }
    };
    // Handle cell click
    const handleCellClick = (rowIndex, columnIndex) => {
        try {
            if (!matrix)
                return;
            const cellRow = matrix.cells[rowIndex];
            if (!cellRow)
                return;
            const cell = cellRow[columnIndex];
            if (!cell)
                return;
            onCellClick?.({ rowIndex, columnIndex, cell });
            // Drill-through
            if (onDrillThrough && cell.records && cell.records.length > 0) {
                const event = {
                    cell,
                    records: cell.records,
                };
                setDrillThroughData(event);
            }
        }
        catch (error) {
            onError?.(error);
        }
    };
    // Empty state
    if (!data || data.length === 0) {
        return (_jsx("div", { ref: ref, id: id, className: cn(styles.pivotTable, styles.empty, className), style: { ...style, height, width }, children: _jsx("div", { className: styles.emptyState, children: "No data available" }) }));
    }
    if (!matrix) {
        return (_jsx("div", { ref: ref, id: id, className: cn(styles.pivotTable, styles.empty, className), style: { ...style, height, width }, children: _jsx("div", { className: styles.emptyState, children: "Error loading pivot table" }) }));
    }
    return (_jsxs("div", { ref: ref, id: id, className: cn(styles.pivotTable, className), style: { ...style, height, width }, children: [showToolbar && (_jsxs("div", { className: styles.toolbar, children: [_jsx("div", { className: styles.toolbarTitle, children: "Pivot Table" }), _jsxs("div", { className: styles.toolbarActions, children: [allowCsvExport && (_jsx("button", { className: styles.toolbarButton, onClick: () => handleExport('csv'), title: "Export to CSV", children: "Export CSV" })), allowExcelExport && (_jsx("button", { className: styles.toolbarButton, onClick: () => handleExport('excel'), title: "Export to Excel", children: "Export Excel" }))] })] })), _jsx("div", { className: styles.gridContainer, children: _jsxs("table", { className: styles.pivotGrid, role: "grid", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { className: styles.cornerCell }), matrix.columnHeaders.map((colPath, colIdx) => (_jsx("th", { className: styles.columnHeader, children: colPath.join(' / ') }, colIdx))), matrix.grandTotalColumn && (_jsx("th", { className: cn(styles.columnHeader, styles.grandTotalHeader), children: "Grand Total" }))] }) }), _jsxs("tbody", { children: [matrix.rowHeaders.map((rowPath, rowIdx) => {
                                    const cellRow = matrix.cells[rowIdx];
                                    if (!cellRow || !rowPath)
                                        return null;
                                    return (_jsxs("tr", { children: [_jsx("th", { className: styles.rowHeader, children: rowPath.join(' / ') }), cellRow.map((cell, colIdx) => (_jsx("td", { className: cn(styles.valueCell, cell.records && cell.records.length > 0 && styles.clickable), onClick: () => handleCellClick(rowIdx, colIdx), title: `${cell.count} records`, children: cell.formattedValue }, colIdx))), matrix.grandTotalColumn && (_jsx("td", { className: cn(styles.valueCell, styles.grandTotalCell), children: matrix.grandTotalColumn[rowIdx]?.formattedValue || '-' }))] }, rowIdx));
                                }), matrix.grandTotalRow && (_jsxs("tr", { className: styles.grandTotalRow, children: [_jsx("th", { className: cn(styles.rowHeader, styles.grandTotalHeader), children: "Grand Total" }), matrix.grandTotalRow.map((cell, colIdx) => (_jsx("td", { className: cn(styles.valueCell, styles.grandTotalCell), children: cell.formattedValue }, colIdx))), matrix.grandTotal && (_jsx("td", { className: cn(styles.valueCell, styles.grandTotalCell), children: matrix.grandTotal.formattedValue }))] }))] })] }) }), drillThroughData && onDrillThrough && (_jsx("div", { className: styles.drillThroughOverlay, onClick: () => setDrillThroughData(null), children: _jsxs("div", { className: styles.drillThroughDialog, onClick: e => e.stopPropagation(), children: [_jsxs("div", { className: styles.drillThroughHeader, children: [_jsx("h3", { children: "Drill-Through Details" }), _jsx("button", { className: styles.closeButton, onClick: () => setDrillThroughData(null), title: "Close", children: "\u00D7" })] }), _jsxs("div", { className: styles.drillThroughContent, children: [_jsxs("p", { children: [_jsx("strong", { children: "Records:" }), " ", drillThroughData.records.length] }), _jsxs("div", { className: styles.recordsTable, children: [_jsxs("table", { children: [_jsx("thead", { children: _jsx("tr", { children: Object.keys(drillThroughData.records[0] || {}).map(key => (_jsx("th", { children: key }, key))) }) }), _jsx("tbody", { children: drillThroughData.records.slice(0, 100).map((record, idx) => (_jsx("tr", { children: Object.values(record).map((value, vIdx) => (_jsx("td", { children: String(value) }, vIdx))) }, idx))) })] }), drillThroughData.records.length > 100 && (_jsxs("p", { className: styles.recordsNote, children: ["Showing first 100 of ", drillThroughData.records.length, " records"] }))] })] })] }) }))] }));
});
PivotTable.displayName = 'PivotTable';
//# sourceMappingURL=PivotTable.js.map
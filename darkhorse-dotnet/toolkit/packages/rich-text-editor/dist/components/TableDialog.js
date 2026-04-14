import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Table Dialog Component
 * Provides table insertion and configuration
 */
import { useState } from 'react';
import styles from './TableDialog.module.css';
export const TableDialog = ({ onInsert, onClose }) => {
    const [rows, setRows] = useState(3);
    const [cols, setCols] = useState(3);
    const handleInsert = () => {
        if (rows > 0 && cols > 0 && rows <= 20 && cols <= 20) {
            onInsert(rows, cols);
        }
    };
    return (_jsx("div", { className: styles.tableDialog, onClick: onClose, children: _jsxs("div", { className: styles.tableDialog__content, onClick: (e) => e.stopPropagation(), children: [_jsx("div", { className: styles.tableDialog__header, children: _jsx("h3", { className: styles.tableDialog__title, children: "Insert Table" }) }), _jsxs("div", { className: styles.tableDialog__body, children: [_jsx("div", { className: styles.tableDialog__field, children: _jsxs("label", { className: styles.tableDialog__label, children: ["Rows (1-20):", _jsx("input", { type: "number", className: styles.tableDialog__input, value: rows, onChange: (e) => setRows(Math.max(1, Math.min(20, Number(e.target.value)))), min: "1", max: "20" })] }) }), _jsx("div", { className: styles.tableDialog__field, children: _jsxs("label", { className: styles.tableDialog__label, children: ["Columns (1-20):", _jsx("input", { type: "number", className: styles.tableDialog__input, value: cols, onChange: (e) => setCols(Math.max(1, Math.min(20, Number(e.target.value)))), min: "1", max: "20" })] }) }), _jsxs("div", { className: styles.tableDialog__preview, children: [_jsx("div", { className: styles.tableDialog__previewLabel, children: "Preview:" }), _jsx("table", { className: styles.tableDialog__previewTable, children: _jsx("tbody", { children: Array.from({ length: Math.min(rows, 5) }).map((_, r) => (_jsx("tr", { children: Array.from({ length: Math.min(cols, 5) }).map((_, c) => (_jsx("td", {}, c))) }, r))) }) }), (rows > 5 || cols > 5) && (_jsxs("div", { className: styles.tableDialog__previewNote, children: [rows > 5 ? `(showing first 5 of ${rows} rows)` : '', rows > 5 && cols > 5 ? ' ' : '', cols > 5 ? `(showing first 5 of ${cols} columns)` : ''] }))] })] }), _jsxs("div", { className: styles.tableDialog__footer, children: [_jsx("button", { className: `${styles.tableDialog__button} ${styles['tableDialog__button--secondary']}`, onClick: onClose, type: "button", children: "Cancel" }), _jsx("button", { className: `${styles.tableDialog__button} ${styles['tableDialog__button--primary']}`, onClick: handleInsert, type: "button", children: "Insert Table" })] })] }) }));
};
export default TableDialog;
//# sourceMappingURL=TableDialog.js.map
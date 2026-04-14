/**
 * Table Utilities
 * Provides table creation and manipulation functions
 */
/**
 * Create a table HTML string
 */
export function createTable(rows, cols) {
    const headerRow = `<tr>${'<th></th>'.repeat(cols)}</tr>`;
    const bodyRows = Array.from({ length: rows - 1 })
        .map(() => `<tr>${'<td></td>'.repeat(cols)}</tr>`)
        .join('');
    return `
    <table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%;">
      <thead>${headerRow}</thead>
      <tbody>${bodyRows}</tbody>
    </table>
  `;
}
/**
 * Insert a row above the current cell
 */
export function insertRowAbove(cell) {
    const row = cell.parentElement;
    const newRow = row.cloneNode(true);
    // Clear content of cloned cells
    Array.from(newRow.cells).forEach(c => {
        c.innerHTML = '';
    });
    row.parentElement?.insertBefore(newRow, row);
}
/**
 * Insert a row below the current cell
 */
export function insertRowBelow(cell) {
    const row = cell.parentElement;
    const newRow = row.cloneNode(true);
    // Clear content of cloned cells
    Array.from(newRow.cells).forEach(c => {
        c.innerHTML = '';
    });
    if (row.nextSibling) {
        row.parentElement?.insertBefore(newRow, row.nextSibling);
    }
    else {
        row.parentElement?.appendChild(newRow);
    }
}
/**
 * Insert a column to the left of current cell
 */
export function insertColumnLeft(cell) {
    const cellIndex = cell.cellIndex;
    const table = cell.closest('table');
    if (!table)
        return;
    const rows = Array.from(table.rows);
    rows.forEach(row => {
        const existingCell = row.cells[cellIndex];
        if (existingCell) {
            const newCell = existingCell.cloneNode(true);
            newCell.innerHTML = '';
            row.insertBefore(newCell, existingCell);
        }
    });
}
/**
 * Insert a column to the right of current cell
 */
export function insertColumnRight(cell) {
    const cellIndex = cell.cellIndex;
    const table = cell.closest('table');
    if (!table)
        return;
    const rows = Array.from(table.rows);
    rows.forEach(row => {
        const existingCell = row.cells[cellIndex];
        if (existingCell) {
            const newCell = existingCell.cloneNode(true);
            newCell.innerHTML = '';
            const nextCell = row.cells[cellIndex + 1];
            if (nextCell) {
                row.insertBefore(newCell, nextCell);
            }
            else {
                row.appendChild(newCell);
            }
        }
    });
}
/**
 * Delete the current row
 */
export function deleteRow(cell) {
    const row = cell.parentElement;
    const table = cell.closest('table');
    // Don't delete if it's the last row
    if (table && table.rows.length > 1) {
        row.remove();
    }
}
/**
 * Delete the current column
 */
export function deleteColumn(cell) {
    const cellIndex = cell.cellIndex;
    const table = cell.closest('table');
    if (!table)
        return;
    // Don't delete if it's the last column
    if (table.rows[0]?.cells.length === 1)
        return;
    const rows = Array.from(table.rows);
    rows.forEach(row => {
        if (row.cells[cellIndex]) {
            row.deleteCell(cellIndex);
        }
    });
}
/**
 * Delete the entire table
 */
export function deleteTable(cell) {
    const table = cell.closest('table');
    table?.remove();
}
//# sourceMappingURL=table.js.map
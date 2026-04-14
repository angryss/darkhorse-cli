/**
 * Table Utilities
 * Provides table creation and manipulation functions
 */
/**
 * Create a table HTML string
 */
export declare function createTable(rows: number, cols: number): string;
/**
 * Insert a row above the current cell
 */
export declare function insertRowAbove(cell: HTMLTableCellElement): void;
/**
 * Insert a row below the current cell
 */
export declare function insertRowBelow(cell: HTMLTableCellElement): void;
/**
 * Insert a column to the left of current cell
 */
export declare function insertColumnLeft(cell: HTMLTableCellElement): void;
/**
 * Insert a column to the right of current cell
 */
export declare function insertColumnRight(cell: HTMLTableCellElement): void;
/**
 * Delete the current row
 */
export declare function deleteRow(cell: HTMLTableCellElement): void;
/**
 * Delete the current column
 */
export declare function deleteColumn(cell: HTMLTableCellElement): void;
/**
 * Delete the entire table
 */
export declare function deleteTable(cell: HTMLTableCellElement): void;
//# sourceMappingURL=table.d.ts.map
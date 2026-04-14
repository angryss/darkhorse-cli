/**
 * Table Dialog Component
 * Provides table insertion and configuration
 */
import React from 'react';
export interface TableDialogProps {
    /** Callback when table inserted */
    onInsert: (rows: number, cols: number) => void;
    /** Callback when dialog closed */
    onClose: () => void;
}
export declare const TableDialog: React.FC<TableDialogProps>;
export default TableDialog;
//# sourceMappingURL=TableDialog.d.ts.map
/**
 * Quick Toolbar Component
 * Provides contextual toolbar for selected content
 */
import React from 'react';
import { RteBuiltinCommand, RteQuickToolbarTarget } from '../types';
export interface QuickToolbarProps {
    /** Target type */
    target: RteQuickToolbarTarget;
    /** Toolbar position */
    position: {
        top: number;
        left: number;
    };
    /** Available commands */
    commands: RteBuiltinCommand[];
    /** Active commands */
    activeCommands?: Set<RteBuiltinCommand>;
    /** Callback when command executed */
    onCommand: (command: RteBuiltinCommand) => void;
    /** Callback when toolbar should close */
    onClose: () => void;
}
export declare const QuickToolbar: React.FC<QuickToolbarProps>;
export default QuickToolbar;
//# sourceMappingURL=QuickToolbar.d.ts.map
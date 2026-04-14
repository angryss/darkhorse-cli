/**
 * Command Execution Utilities
 * Handles execCommand and custom formatting operations
 */
import { RteBuiltinCommand } from '../types';
/**
 * Execute a document command
 */
export declare function executeCommand(command: RteBuiltinCommand, value?: string): boolean;
/**
 * Check if a command is active
 */
export declare function queryCommandState(command: RteBuiltinCommand): boolean;
/**
 * Insert HTML at cursor
 */
export declare function insertHtml(html: string): boolean;
/**
 * Get current format block
 */
export declare function getCurrentFormat(): string;
//# sourceMappingURL=commands.d.ts.map
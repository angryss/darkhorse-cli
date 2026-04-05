/**
 * Create a directory (and parents) if it doesn't exist.
 */
export declare function ensureDir(dirPath: string): Promise<void>;
/**
 * Write a file, creating parent directories as needed.
 */
export declare function writeFile(filePath: string, content: string): Promise<void>;
/**
 * Copy a file, creating parent directories as needed.
 */
export declare function copyFile(src: string, dest: string): Promise<void>;
/**
 * Copy an entire directory recursively.
 */
export declare function copyDir(src: string, dest: string): Promise<string[]>;
/**
 * Check if a path exists.
 */
export declare function pathExists(targetPath: string): Promise<boolean>;
/**
 * Read a file as UTF-8 string.
 */
export declare function readText(filePath: string): Promise<string>;
//# sourceMappingURL=fs.d.ts.map
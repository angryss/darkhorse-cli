export declare function ensureDir(dirPath: string): Promise<void>;
export declare function writeFile(filePath: string, content: string): Promise<void>;
export declare function copyFile(src: string, dest: string): Promise<void>;
export declare function copyDir(src: string, dest: string): Promise<string[]>;
export declare function pathExists(targetPath: string): Promise<boolean>;
export declare function readText(filePath: string): Promise<string>;
//# sourceMappingURL=fs.d.ts.map
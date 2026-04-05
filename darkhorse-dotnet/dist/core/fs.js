import fs from 'node:fs/promises';
import path from 'node:path';
/**
 * Create a directory (and parents) if it doesn't exist.
 */
export async function ensureDir(dirPath) {
    await fs.mkdir(dirPath, { recursive: true });
}
/**
 * Write a file, creating parent directories as needed.
 */
export async function writeFile(filePath, content) {
    await ensureDir(path.dirname(filePath));
    await fs.writeFile(filePath, content, 'utf-8');
}
/**
 * Copy a file, creating parent directories as needed.
 */
export async function copyFile(src, dest) {
    await ensureDir(path.dirname(dest));
    await fs.copyFile(src, dest);
}
/**
 * Copy an entire directory recursively.
 */
export async function copyDir(src, dest) {
    const copied = [];
    await ensureDir(dest);
    const entries = await fs.readdir(src, { withFileTypes: true });
    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
            const nested = await copyDir(srcPath, destPath);
            copied.push(...nested);
        }
        else {
            await fs.copyFile(srcPath, destPath);
            copied.push(destPath);
        }
    }
    return copied;
}
/**
 * Check if a path exists.
 */
export async function pathExists(targetPath) {
    try {
        await fs.access(targetPath);
        return true;
    }
    catch {
        return false;
    }
}
/**
 * Read a file as UTF-8 string.
 */
export async function readText(filePath) {
    return fs.readFile(filePath, 'utf-8');
}
//# sourceMappingURL=fs.js.map
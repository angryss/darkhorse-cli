import fs from 'node:fs/promises';
import path from 'node:path';
export async function ensureDir(dirPath) {
    await fs.mkdir(dirPath, { recursive: true });
}
export async function writeFile(filePath, content) {
    await ensureDir(path.dirname(filePath));
    await fs.writeFile(filePath, content, 'utf-8');
}
export async function copyFile(src, dest) {
    await ensureDir(path.dirname(dest));
    await fs.copyFile(src, dest);
}
export async function copyDir(src, dest) {
    const copied = [];
    await ensureDir(dest);
    const entries = await fs.readdir(src, { withFileTypes: true });
    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
            copied.push(...(await copyDir(srcPath, destPath)));
        }
        else {
            await copyFile(srcPath, destPath);
            copied.push(destPath);
        }
    }
    return copied;
}
export async function pathExists(targetPath) {
    try {
        await fs.access(targetPath);
        return true;
    }
    catch {
        return false;
    }
}
export async function readText(filePath) {
    return fs.readFile(filePath, 'utf-8');
}
//# sourceMappingURL=fs.js.map
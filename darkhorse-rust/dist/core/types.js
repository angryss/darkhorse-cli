// ──────────────────────────────────────────────────────────────────
// darkhorse-rust — Core type definitions
// ──────────────────────────────────────────────────────────────────
export const ARCHETYPE_LABELS = {
    desktop: 'Tauri Desktop Application',
};
// ── Helpers ──────────────────────────────────────────────────────
export function toSnakeCase(name) {
    return name.replace(/-/g, '_');
}
export function toPascalCase(name) {
    return name
        .split(/[-_]/)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join('');
}
export function deriveCratePrefix(name) {
    // "visu-photo-studio" → "vps", "my-app" → "ma"
    const parts = name.split('-');
    if (parts.length === 1)
        return parts[0].slice(0, 3);
    return parts.map((p) => p.charAt(0)).join('');
}
import path from 'node:path';
export function buildProjectPaths(root) {
    return {
        root,
        crates: path.join(root, 'crates'),
        frontend: path.join(root, 'frontend'),
        deployment: path.join(root, 'deployment'),
        context: path.join(root, 'context'),
        openspec: path.join(root, 'openspec'),
        vscode: path.join(root, '.vscode'),
    };
}
export function buildConfig(input) {
    const projectRoot = path.resolve(input.outputDir, input.name);
    const cratePrefix = input.cratePrefix || deriveCratePrefix(input.name);
    return {
        name: input.name,
        description: input.description,
        version: '0.1.0',
        archetype: 'desktop',
        rust: {
            framework: 'tauri',
            edition: input.edition,
            cratePrefix,
        },
        frontend: {
            framework: 'vanilla-ts',
            bundler: 'vite',
        },
        features: {
            frontend: input.includeFrontend,
        },
        paths: buildProjectPaths(projectRoot),
    };
}
//# sourceMappingURL=types.js.map
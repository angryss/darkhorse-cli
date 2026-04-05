import fs from 'node:fs/promises';
import path from 'node:path';
import { parse, stringify } from 'yaml';
import { buildProjectPaths, toPascalCase } from './types.js';
const CONFIG_FILENAME = '.darkhorse.yaml';
/**
 * Write project config to .darkhorse.yaml in the project root.
 */
export async function writeConfig(config) {
    const filePath = path.join(config.paths.root, CONFIG_FILENAME);
    const content = stringify(configToSerializable(config));
    await fs.writeFile(filePath, content, 'utf-8');
}
/**
 * Read project config from .darkhorse.yaml.
 */
export async function readConfig(projectRoot) {
    const filePath = path.join(projectRoot, CONFIG_FILENAME);
    const raw = await fs.readFile(filePath, 'utf-8');
    const parsed = parse(raw);
    return fromSerializable(parsed, projectRoot);
}
/**
 * Check if a .darkhorse.yaml exists at the given path.
 */
export async function configExists(projectRoot) {
    try {
        await fs.access(path.join(projectRoot, CONFIG_FILENAME));
        return true;
    }
    catch {
        return false;
    }
}
function configToSerializable(config) {
    return {
        name: config.name,
        description: config.description,
        version: config.version,
        workspaceNamespace: config.workspaceNamespace,
        archetype: config.archetype,
        dotnet: config.dotnet,
        frontend: config.frontend,
        features: config.features,
    };
}
function fromSerializable(raw, projectRoot) {
    return {
        ...raw,
        workspaceNamespace: raw.workspaceNamespace ?? toPascalCase(raw.name),
        paths: buildProjectPaths(projectRoot),
    };
}
//# sourceMappingURL=config.js.map
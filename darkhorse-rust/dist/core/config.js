import path from 'node:path';
import YAML from 'yaml';
import { buildProjectPaths } from './types.js';
import { readText, writeFile, pathExists } from './fs.js';
const CONFIG_FILENAME = '.darkhorse.yaml';
export async function writeConfig(config) {
    const serialized = {
        name: config.name,
        description: config.description,
        version: config.version,
        archetype: config.archetype,
        rust: { ...config.rust },
        frontend: { ...config.frontend },
        features: { ...config.features },
    };
    const content = YAML.stringify(serialized);
    const configPath = path.join(config.paths.root, CONFIG_FILENAME);
    await writeFile(configPath, content);
}
export async function readConfig(projectRoot) {
    const configPath = path.join(projectRoot, CONFIG_FILENAME);
    const content = await readText(configPath);
    const parsed = YAML.parse(content);
    return {
        ...parsed,
        archetype: parsed.archetype,
        rust: {
            framework: parsed.rust.framework,
            edition: parsed.rust.edition,
            cratePrefix: parsed.rust.cratePrefix,
        },
        frontend: {
            framework: parsed.frontend.framework,
            bundler: parsed.frontend.bundler,
        },
        paths: buildProjectPaths(projectRoot),
    };
}
export async function configExists(projectRoot) {
    return pathExists(path.join(projectRoot, CONFIG_FILENAME));
}
//# sourceMappingURL=config.js.map
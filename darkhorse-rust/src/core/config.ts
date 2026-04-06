import path from 'node:path';
import YAML from 'yaml';
import type { DarkhorseConfig } from './types.js';
import { buildProjectPaths } from './types.js';
import { readText, writeFile, pathExists } from './fs.js';

const CONFIG_FILENAME = '.darkhorse.yaml';

interface SerializedConfig {
  name: string;
  description: string;
  version: string;
  archetype: string;
  rust: {
    framework: string;
    edition: string;
    cratePrefix: string;
  };
  frontend: {
    framework: string;
    bundler: string;
  };
  features: {
    frontend: boolean;
  };
}

export async function writeConfig(config: DarkhorseConfig): Promise<void> {
  const serialized: SerializedConfig = {
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

export async function readConfig(projectRoot: string): Promise<DarkhorseConfig> {
  const configPath = path.join(projectRoot, CONFIG_FILENAME);
  const content = await readText(configPath);
  const parsed = YAML.parse(content) as SerializedConfig;

  return {
    ...parsed,
    archetype: parsed.archetype as DarkhorseConfig['archetype'],
    rust: {
      framework: parsed.rust.framework as 'tauri',
      edition: parsed.rust.edition as '2021' | '2024',
      cratePrefix: parsed.rust.cratePrefix,
    },
    frontend: {
      framework: parsed.frontend.framework as 'vanilla-ts',
      bundler: parsed.frontend.bundler as 'vite',
    },
    paths: buildProjectPaths(projectRoot),
  };
}

export async function configExists(projectRoot: string): Promise<boolean> {
  return pathExists(path.join(projectRoot, CONFIG_FILENAME));
}

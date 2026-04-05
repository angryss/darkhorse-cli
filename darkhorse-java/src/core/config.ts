import fs from 'node:fs/promises';
import path from 'node:path';
import { parse, stringify } from 'yaml';
import type { DarkhorseConfig } from './types.js';
import { buildProjectPaths } from './types.js';

const CONFIG_FILENAME = '.darkhorse.yaml';

/**
 * Write project config to .darkhorse.yaml in the project root.
 */
export async function writeConfig(config: DarkhorseConfig): Promise<void> {
  const filePath = path.join(config.paths.root, CONFIG_FILENAME);
  const content = stringify(configToSerializable(config));
  await fs.writeFile(filePath, content, 'utf-8');
}

/**
 * Read project config from .darkhorse.yaml.
 */
export async function readConfig(projectRoot: string): Promise<DarkhorseConfig> {
  const filePath = path.join(projectRoot, CONFIG_FILENAME);
  const raw = await fs.readFile(filePath, 'utf-8');
  const parsed = parse(raw) as SerializableConfig;
  return fromSerializable(parsed, projectRoot);
}

/**
 * Check if a .darkhorse.yaml exists at the given path.
 */
export async function configExists(projectRoot: string): Promise<boolean> {
  try {
    await fs.access(path.join(projectRoot, CONFIG_FILENAME));
    return true;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Serialization — strip runtime paths, keep portable config
// ---------------------------------------------------------------------------

interface SerializableConfig {
  name: string;
  description: string;
  version: string;
  archetype: DarkhorseConfig['archetype'];
  java: DarkhorseConfig['java'];
  frontend?: DarkhorseConfig['frontend'];
  features: DarkhorseConfig['features'];
}

function configToSerializable(config: DarkhorseConfig): SerializableConfig {
  return {
    name: config.name,
    description: config.description,
    version: config.version,
    archetype: config.archetype,
    java: config.java,
    frontend: config.frontend,
    features: config.features,
  };
}

function fromSerializable(raw: SerializableConfig, projectRoot: string): DarkhorseConfig {
  return {
    ...raw,
    paths: buildProjectPaths(projectRoot, raw.archetype),
  };
}

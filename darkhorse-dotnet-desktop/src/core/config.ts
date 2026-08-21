import fs from 'node:fs/promises';
import path from 'node:path';
import { parse, stringify } from 'yaml';
import type { AiConfig, DarkhorseConfig, DeploymentConfig } from './types.js';
import { buildProjectPaths, toPascalCase } from './types.js';

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
  vep?: unknown;
  namespace: string;
  dotnet: DarkhorseConfig['dotnet'];
  features: DarkhorseConfig['features'];
  ai?: DarkhorseConfig['ai'];
  deployment?: DarkhorseConfig['deployment'];
}

function configToSerializable(config: DarkhorseConfig): SerializableConfig {
  return {
    name: config.name,
    description: config.description,
    version: config.version,
    vep: { enabled: config.vep.enabled },
    namespace: config.namespace,
    dotnet: config.dotnet,
    features: config.features,
    ai: config.ai,
    deployment: config.deployment,
  };
}

const DEFAULT_AI_CONFIG: AiConfig = {
  sourceOfTruth: 'openspec',
  entrypoint: 'AGENTS.md',
  tools: { copilot: true, kiro: false },
};

const DEFAULT_VEP_CONFIG: DarkhorseConfig['vep'] = { enabled: true };

function normalizeVepConfig(value: unknown): DarkhorseConfig['vep'] {
  if (value === undefined) return DEFAULT_VEP_CONFIG;
  if (typeof value !== 'object'
    || value === null
    || Array.isArray(value)
    || Object.keys(value).some((key) => key !== 'enabled')
    || typeof (value as { enabled?: unknown }).enabled !== 'boolean') {
    throw new Error(
      'Invalid .darkhorse.yaml VEP configuration. Keep only "vep.enabled" as a boolean; select the VEP version exclusively in the generated project root package.json.',
    );
  }
  return { enabled: (value as { enabled: boolean }).enabled };
}

const DEFAULT_DEPLOYMENT_CONFIG: DeploymentConfig = {
  wix: true,
  cicd: 'none',
};

function fromSerializable(raw: SerializableConfig, projectRoot: string): DarkhorseConfig {
  return {
    ...raw,
    namespace: raw.namespace ?? toPascalCase(raw.name),
    vep: normalizeVepConfig(raw.vep),
    ai: raw.ai ?? DEFAULT_AI_CONFIG,
    deployment: raw.deployment ?? DEFAULT_DEPLOYMENT_CONFIG,
    paths: buildProjectPaths(projectRoot),
  };
}

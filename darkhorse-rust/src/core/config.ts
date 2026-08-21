import path from 'node:path';
import YAML from 'yaml';
import type { AiConfig, DarkhorseConfig } from './types.js';
import { buildProjectPaths } from './types.js';
import { readText, writeFile, pathExists } from './fs.js';

const CONFIG_FILENAME = '.darkhorse.yaml';

interface SerializedConfig {
  name: string;
  description: string;
  version: string;
  vep?: unknown;
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
  ai?: {
    sourceOfTruth: string;
    entrypoint: string;
    tools: { copilot: boolean; kiro: boolean };
  };
}

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

export async function writeConfig(config: DarkhorseConfig): Promise<void> {
  const serialized: SerializedConfig = {
    name: config.name,
    description: config.description,
    version: config.version,
    vep: { enabled: config.vep.enabled },
    archetype: config.archetype,
    rust: { ...config.rust },
    frontend: { ...config.frontend },
    features: { ...config.features },
    ai: config.ai,
  };

  const content = YAML.stringify(serialized);
  const configPath = path.join(config.paths.root, CONFIG_FILENAME);
  await writeFile(configPath, content);
}

export async function readConfig(projectRoot: string): Promise<DarkhorseConfig> {
  const configPath = path.join(projectRoot, CONFIG_FILENAME);
  const content = await readText(configPath);
  const parsed = YAML.parse(content) as SerializedConfig;

  const DEFAULT_AI_CONFIG: AiConfig = {
    sourceOfTruth: 'openspec',
    entrypoint: 'AGENTS.md',
    tools: { copilot: true, kiro: false },
  };
  return {
    ...parsed,
    vep: normalizeVepConfig(parsed.vep),
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
    ai: parsed.ai
      ? {
          sourceOfTruth: 'openspec',
          entrypoint: 'AGENTS.md',
          tools: {
            copilot: parsed.ai.tools.copilot,
            kiro: parsed.ai.tools.kiro,
          },
        }
      : DEFAULT_AI_CONFIG,
    paths: buildProjectPaths(projectRoot),
  };
}

export async function configExists(projectRoot: string): Promise<boolean> {
  return pathExists(path.join(projectRoot, CONFIG_FILENAME));
}

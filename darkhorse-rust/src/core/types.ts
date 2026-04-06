// ──────────────────────────────────────────────────────────────────
// darkhorse-rust — Core type definitions
// ──────────────────────────────────────────────────────────────────

// ── Archetypes ───────────────────────────────────────────────────

export type ProjectArchetype = 'desktop';

export const ARCHETYPE_LABELS: Record<ProjectArchetype, string> = {
  desktop: 'Tauri Desktop Application',
};

// ── Rust-specific config ─────────────────────────────────────────

export interface RustConfig {
  framework: 'tauri';
  edition: '2021' | '2024';
  cratePrefix: string; // e.g. "vps" for visu-photo-studio
}

// ── Frontend config ──────────────────────────────────────────────

export interface FrontendConfig {
  framework: 'vanilla-ts';
  bundler: 'vite';
}

// ── Feature flags ────────────────────────────────────────────────

export interface FeatureFlags {
  frontend: boolean;
}

// ── Paths ────────────────────────────────────────────────────────

export interface ProjectPaths {
  root: string;
  crates: string;
  frontend: string;
  deployment: string;
  context: string;
  openspec: string;
  vscode: string;
}

// ── Main config ──────────────────────────────────────────────────

export interface DarkhorseConfig {
  name: string;
  description: string;
  version: string;
  archetype: ProjectArchetype;
  rust: RustConfig;
  frontend: FrontendConfig;
  features: FeatureFlags;
  paths: ProjectPaths;
}

// ── User input ───────────────────────────────────────────────────

export interface InitInput {
  name: string;
  description: string;
  cratePrefix?: string;
  edition: '2021' | '2024';
  includeFrontend: boolean;
  outputDir: string;
}

// ── Skill result ─────────────────────────────────────────────────

export interface SkillResult {
  success: boolean;
  filesCreated: string[];
  filesModified: string[];
  errors: string[];
}

// ── Template context ─────────────────────────────────────────────

export interface TemplateContext {
  project: DarkhorseConfig;
  timestamp: string;
  cliVersion: string;
  [key: string]: unknown;
}

// ── Helpers ──────────────────────────────────────────────────────

export function toSnakeCase(name: string): string {
  return name.replace(/-/g, '_');
}

export function toPascalCase(name: string): string {
  return name
    .split(/[-_]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join('');
}

export function deriveCratePrefix(name: string): string {
  // "visu-photo-studio" → "vps", "my-app" → "ma"
  const parts = name.split('-');
  if (parts.length === 1) return parts[0].slice(0, 3);
  return parts.map((p) => p.charAt(0)).join('');
}

import path from 'node:path';

export function buildProjectPaths(root: string): ProjectPaths {
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

export function buildConfig(input: InitInput): DarkhorseConfig {
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

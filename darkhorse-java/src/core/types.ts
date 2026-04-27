/**
 * Shared types for the darkhorse-java CLI.
 * Every command, agent, and skill works from these models.
 */

// ---------------------------------------------------------------------------
// Project Archetypes — determines template selection and generation behavior
// ---------------------------------------------------------------------------

export type ProjectArchetype = 'api' | 'bff-api' | 'microservice';

export const ARCHETYPE_LABELS: Record<ProjectArchetype, string> = {
  'api': 'API — Standard REST service with persistence',
  'bff-api': 'BFF API — Backend-for-Frontend, no persistence, routes to downstream APIs/brokers',
  'microservice': 'Microservice — Message-driven, event/command handlers, no HTTP-first design',
};

export const ARCHETYPE_CATEGORIES: Record<ProjectArchetype, string> = {
  'api': 'apis',
  'bff-api': 'bffs',
  'microservice': 'microservices',
};

// ---------------------------------------------------------------------------
// Project Configuration — the normalized model every layer reads
// ---------------------------------------------------------------------------

export interface DarkhorseConfig {
  name: string;
  description: string;
  version: string;
  archetype: ProjectArchetype;
  java: JavaConfig;
  frontend?: FrontendConfig;
  features: FeatureFlags;
  ai: AiConfig;
  paths: ProjectPaths;
}

export interface JavaConfig {
  framework: 'quarkus';
  groupId: string;
  artifactId: string;
  javaVersion: 17 | 21;
  buildTool: 'maven';
}

export type FrontendPlatform = 'web' | 'mobile' | 'both';

export interface FrontendConfig {
  enabled: boolean;
  platform: FrontendPlatform;
  framework: 'react' | 'react-native';
  toolkit: boolean;
}

export interface FeatureFlags {
  mcp: boolean;
  openspec: boolean;
  frontend: boolean;
}

// ---------------------------------------------------------------------------
// AI Tools Configuration — controls which AI tool adapters are generated
// ---------------------------------------------------------------------------

export interface AiToolsConfig {
  copilot: boolean;
  kiro: boolean;
}

export interface AiConfig {
  /** The single source of truth for all AI agents in this project. */
  sourceOfTruth: 'openspec';
  /** Relative path to the AI entry point (always AGENTS.md inside openspec). */
  entrypoint: 'AGENTS.md';
  tools: AiToolsConfig;
}

export interface ProjectPaths {
  root: string;
  backend: string;
  frontend: string;
  deployment: string;
  context: string;
  openspec: string;
  vscode: string;
}

// ---------------------------------------------------------------------------
// Init command input — what the user provides
// ---------------------------------------------------------------------------

export interface InitInput {
  name: string;
  description: string;
  groupId: string;
  javaVersion: 17 | 21;
  archetype: ProjectArchetype;
  includeFrontend: boolean;
  frontendPlatform: FrontendPlatform;
  includeToolkit: boolean;
  outputDir: string;
  /** AI tool adapters to generate. Defaults: copilot=true, kiro=false. */
  aiTools?: Partial<AiToolsConfig>;
}

// ---------------------------------------------------------------------------
// Skill result — standard return from every skill
// ---------------------------------------------------------------------------

export interface SkillResult {
  success: boolean;
  filesCreated: string[];
  filesModified: string[];
  errors: string[];
}

// ---------------------------------------------------------------------------
// Template context — data passed to Handlebars templates
// ---------------------------------------------------------------------------

export interface TemplateContext {
  project: DarkhorseConfig;
  timestamp: string;
  cliVersion: string;
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function buildProjectPaths(root: string, archetype: ProjectArchetype): ProjectPaths {
  return {
    root,
    backend: `${root}/backend/${ARCHETYPE_CATEGORIES[archetype]}`,
    frontend: `${root}/frontend`,
    deployment: `${root}/deployment`,
    context: `${root}/context`,
    openspec: `${root}/openspec`,
    vscode: `${root}/.vscode`,
  };
}

export function buildConfig(input: InitInput): DarkhorseConfig {
  const root = `${input.outputDir}/${input.name}`;
  return {
    name: input.name,
    description: input.description,
    version: '0.1.0',
    archetype: input.archetype,
    java: {
      framework: 'quarkus',
      groupId: input.groupId,
      artifactId: input.name,
      javaVersion: input.javaVersion,
      buildTool: 'maven',
    },
    frontend: input.includeFrontend
      ? {
          enabled: true,
          platform: input.frontendPlatform,
          framework: input.frontendPlatform === 'mobile' ? 'react-native' : 'react' as 'react' | 'react-native',
          toolkit: input.includeToolkit,
        }
      : undefined,
    features: {
      mcp: true,
      openspec: true,
      frontend: input.includeFrontend,
    },
    ai: {
      sourceOfTruth: 'openspec',
      entrypoint: 'AGENTS.md',
      tools: {
        copilot: input.aiTools?.copilot ?? true,
        kiro: input.aiTools?.kiro ?? false,
      },
    },
    paths: buildProjectPaths(root, input.archetype),
  };
}

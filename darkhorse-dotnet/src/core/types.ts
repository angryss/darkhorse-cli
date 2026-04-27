/**
 * Shared types for the darkhorse-dotnet CLI.
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

/**
 * Project-level config — set at `init` time, no service archetype yet.
 * Stored in .darkhorse.yaml at the workspace root.
 */
export interface DarkhorseConfig {
  name: string;
  description: string;
  version: string;
  workspaceNamespace: string;      // PascalCase namespace for shared Contracts (e.g. "OrderManagement")
  archetype?: ProjectArchetype;    // undefined until first `add` (kept for service context)
  dotnet?: DotnetConfig;           // undefined until a service is added
  frontend?: FrontendConfig;
  features: FeatureFlags;
  ai: AiConfig;
  paths: ProjectPaths;
}

export interface DotnetConfig {
  framework: 'aspnet';
  namespace: string;
  dotnetVersion: 8 | 9;
  buildTool: 'dotnet';
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
// Init command input — workspace-level (no service archetype)
// ---------------------------------------------------------------------------

export interface InitInput {
  name: string;
  description: string;
  namespace?: string;           // workspace namespace override (default: PascalCase of name)
  includeFrontend: boolean;
  frontendPlatform: FrontendPlatform;
  outputDir: string;
  /** AI tool adapters to generate. Defaults: copilot=true, kiro=false. */
  aiTools?: Partial<AiToolsConfig>;
}

// ---------------------------------------------------------------------------
// Add command input — service-level (archetype + namespace required)
// ---------------------------------------------------------------------------

export interface AddInput {
  archetype: ProjectArchetype;
  name: string;         // service name (e.g. "order-api")
  namespace: string;    // C# root namespace (e.g. "MyCompany.Orders")
  dotnetVersion: 8 | 9;
  projectRoot: string;  // path to existing darkhorse project root
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

/**
 * Convert a kebab-case name to PascalCase (e.g. "order-management" → "OrderManagement").
 */
export function toPascalCase(name: string): string {
  return name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

export function buildProjectPaths(root: string): ProjectPaths {
  return {
    root,
    backend: `${root}/backend`,
    frontend: `${root}/frontend`,
    deployment: `${root}/deployment`,
    context: `${root}/context`,
    openspec: `${root}/openspec`,
    vscode: `${root}/.vscode`,
  };
}

/**
 * Build service-level paths within an existing project.
 * Service lives at backend/<category>/<serviceName>/.
 */
export function buildServicePaths(projectRoot: string, archetype: ProjectArchetype, serviceName: string): ProjectPaths {
  const serviceRoot = `${projectRoot}/backend/${ARCHETYPE_CATEGORIES[archetype]}/${serviceName}`;
  return {
    root: projectRoot,
    backend: serviceRoot,
    frontend: `${projectRoot}/frontend`,
    deployment: `${projectRoot}/deployment`,
    context: `${projectRoot}/context`,
    openspec: `${projectRoot}/openspec`,
    vscode: `${projectRoot}/.vscode`,
  };
}

/**
 * Build workspace-level config from init input (no service archetype).
 */
export function buildConfig(input: InitInput): DarkhorseConfig {
  const root = `${input.outputDir}/${input.name}`;
  return {
    name: input.name,
    description: input.description,
    version: '0.1.0',
    workspaceNamespace: input.namespace ?? toPascalCase(input.name),
    // archetype and dotnet are undefined at workspace level
    frontend: input.includeFrontend
      ? {
          enabled: true,
          platform: input.frontendPlatform,
          framework: input.frontendPlatform === 'mobile' ? 'react-native' : 'react' as 'react' | 'react-native',
          toolkit: true,
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
    paths: buildProjectPaths(root),
  };
}

/**
 * Build service-level config from add input (archetype + namespace required).
 */
export function buildServiceConfig(input: AddInput, projectConfig: DarkhorseConfig): DarkhorseConfig {
  return {
    name: input.name,
    description: projectConfig.description,
    version: projectConfig.version,
    workspaceNamespace: projectConfig.workspaceNamespace,
    archetype: input.archetype,
    dotnet: {
      framework: 'aspnet',
      namespace: input.namespace,
      dotnetVersion: input.dotnetVersion,
      buildTool: 'dotnet',
    },
    frontend: projectConfig.frontend,
    features: projectConfig.features,
    ai: projectConfig.ai,
    paths: buildServicePaths(input.projectRoot, input.archetype, input.name),
  };
}

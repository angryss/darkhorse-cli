/**
 * Shared types for the darkhorse-dotnet-desktop CLI.
 * Every command, agent, and skill works from these models.
 *
 * Key difference from darkhorse-dotnet:
 *   - No multi-service workspace concept. One project = one app.
 *   - No HTTP/API archetypes. The single archetype is always "wpf-desktop".
 *   - Presentation layer IS the WPF app (no ASP.NET Core).
 *   - Common project replaces the workspace-level Contracts project.
 *   - The `add` command adds a bounded context (feature module), not a service.
 */

// ---------------------------------------------------------------------------
// .NET Version
// ---------------------------------------------------------------------------

export type DotnetVersion = 8 | 9;

// ---------------------------------------------------------------------------
// CI/CD provider — chosen at init time
// ---------------------------------------------------------------------------

export type CiCdProvider = 'github-actions' | 'ado' | 'none';

export const CICD_PROVIDER_LABELS: Record<CiCdProvider, string> = {
  'github-actions': 'GitHub Actions — workflow in .github/workflows/',
  'ado':            'Azure DevOps Pipelines — azure-pipelines.yml at root',
  'none':           'None — skip CI/CD pipeline generation',
};

/** Deployment-level settings — WiX installer + CI/CD. */
export interface DeploymentConfig {
  /** Always true for desktop; WiX 4 SDK installer project under deploy/installer/. */
  wix: boolean;
  cicd: CiCdProvider;
  /** Azure DevOps organization URL, e.g. https://dev.azure.com/myorg (required for ado). */
  adoOrgUrl?: string;
}

// ---------------------------------------------------------------------------
// UI Framework — chosen at init time
// ---------------------------------------------------------------------------

export type UiFramework = 'materialdesign' | 'fluent';

export const UI_FRAMEWORK_LABELS: Record<UiFramework, string> = {
  materialdesign: 'Material Design in XAML Toolkit — Google Material Design for WPF',
  fluent: 'WPF UI (Fluent Design) — Windows 11-style Fluent Design System',
};

// ---------------------------------------------------------------------------
// Feature archetype — used when adding a bounded context via `add`
// ---------------------------------------------------------------------------

export type FeatureArchetype = 'crud' | 'event-driven' | 'service-integration';

export const FEATURE_ARCHETYPE_LABELS: Record<FeatureArchetype, string> = {
  'crud':                'CRUD — Standard entity with Create/Read/Update/Delete operations',
  'event-driven':        'Event-Driven — Domain events with handlers, no direct CRUD',
  'service-integration': 'Service Integration — External service/API calls via ports and adapters',
};

// ---------------------------------------------------------------------------
// Project Configuration — the normalized model every layer reads
// ---------------------------------------------------------------------------

/**
 * Project-level config — set at `init` time.
 * Stored in .darkhorse.yaml at the project root.
 */
export interface DarkhorseConfig {
  name: string;
  description: string;
  version: string;
  /** VEP generation enablement only. The current VEP version lives only in root package.json. */
  vep: VepConfig;
  /** Root C# namespace (e.g. "OrderTracker" or "MyCompany.OrderTracker"). */
  namespace: string;
  dotnet: DotnetConfig;
  features: FeatureFlags;
  ai: AiConfig;
  deployment: DeploymentConfig;
  paths: ProjectPaths;
}

export interface VepConfig {
  enabled: boolean;
}

export interface DotnetConfig {
  framework: 'wpf';
  namespace: string;
  dotnetVersion: DotnetVersion;
  buildTool: 'dotnet';
  uiFramework: UiFramework;
}

export interface FeatureFlags {
  mcp: boolean;
  openspec: boolean;
  persistence: boolean;  // EF Core SQLite by default
}

// ---------------------------------------------------------------------------
// AI Tools Configuration
// ---------------------------------------------------------------------------

export interface AiToolsConfig {
  copilot: boolean;
  kiro: boolean;
}

export interface AiConfig {
  sourceOfTruth: 'openspec';
  entrypoint: 'AGENTS.md';
  tools: AiToolsConfig;
}

// ---------------------------------------------------------------------------
// Project Paths — all resolved at runtime from project root
// ---------------------------------------------------------------------------

export interface ProjectPaths {
  root: string;
  src: string;           // src/ — all five layer projects live here
  tests: string;         // tests/ — unit and integration test projects
  deploy: string;        // deploy/ — WiX installer + CI/CD pipeline files
  context: string;       // context/ — AI navigation layer
  openspec: string;      // openspec/ — spec-driven development system
  vscode: string;        // .vscode/
}

// ---------------------------------------------------------------------------
// Init command input — creates the full project in one shot
// ---------------------------------------------------------------------------

export interface InitInput {
  name: string;
  description: string;
  namespace?: string;        // override (default: PascalCase of name)
  dotnetVersion: DotnetVersion;
  uiFramework: UiFramework;
  persistence: boolean;
  cicd?: CiCdProvider;       // CI/CD pipeline to generate (default: none)
  adoOrgUrl?: string;        // required when cicd === 'ado'
  outputDir: string;
  aiTools?: Partial<AiToolsConfig>;
}

// ---------------------------------------------------------------------------
// Add command input — adds a bounded context (feature module) to an existing project
// ---------------------------------------------------------------------------

export interface AddInput {
  archetype: FeatureArchetype;
  contextName: string;    // e.g. "OrderManagement" — PascalCase domain context name
  projectRoot: string;    // path to existing darkhorse-dotnet-desktop project
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
 * Convert a kebab-case or space-separated name to PascalCase.
 * e.g. "order-tracker" → "OrderTracker"
 */
export function toPascalCase(name: string): string {
  return name
    .split(/[-_.\s]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

export function buildProjectPaths(root: string): ProjectPaths {
  return {
    root,
    src: `${root}/src`,
    tests: `${root}/tests`,
    deploy: `${root}/deploy`,
    context: `${root}/context`,
    openspec: `${root}/openspec`,
    vscode: `${root}/.vscode`,
  };
}

/**
 * Build full project config from init input.
 */
export function buildConfig(input: InitInput): DarkhorseConfig {
  const root = `${input.outputDir}/${input.name}`;
  const ns = input.namespace ?? toPascalCase(input.name);
  return {
    name: input.name,
    description: input.description,
    version: '0.1.0',
    vep: { enabled: true },
    namespace: ns,
    dotnet: {
      framework: 'wpf',
      namespace: ns,
      dotnetVersion: input.dotnetVersion,
      buildTool: 'dotnet',
      uiFramework: input.uiFramework,
    },
    features: {
      mcp: true,
      openspec: true,
      persistence: input.persistence,
    },
    ai: {
      sourceOfTruth: 'openspec',
      entrypoint: 'AGENTS.md',
      tools: {
        copilot: input.aiTools?.copilot ?? true,
        kiro: input.aiTools?.kiro ?? false,
      },
    },
    deployment: {
      wix: true,
      cicd: input.cicd ?? 'none',
      adoOrgUrl: input.adoOrgUrl,
    },
    paths: buildProjectPaths(root),
  };
}

/**
 * Build feature config for `add` command — extends an existing project config.
 */
export function buildFeatureConfig(
  input: AddInput,
  projectConfig: DarkhorseConfig,
): DarkhorseConfig & { featureArchetype: FeatureArchetype; contextName: string } {
  return {
    ...projectConfig,
    featureArchetype: input.archetype,
    contextName: input.contextName,
  };
}

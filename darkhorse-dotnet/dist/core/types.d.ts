/**
 * Shared types for the darkhorse-dotnet CLI.
 * Every command, agent, and skill works from these models.
 */
export type ProjectArchetype = 'api' | 'bff-api' | 'microservice';
export declare const ARCHETYPE_LABELS: Record<ProjectArchetype, string>;
export declare const ARCHETYPE_CATEGORIES: Record<ProjectArchetype, string>;
/**
 * Project-level config — set at `init` time, no service archetype yet.
 * Stored in .darkhorse.yaml at the workspace root.
 */
export interface DarkhorseConfig {
    name: string;
    description: string;
    version: string;
    workspaceNamespace: string;
    archetype?: ProjectArchetype;
    dotnet?: DotnetConfig;
    frontend?: FrontendConfig;
    features: FeatureFlags;
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
export interface ProjectPaths {
    root: string;
    backend: string;
    frontend: string;
    deployment: string;
    context: string;
    openspec: string;
    vscode: string;
}
export interface InitInput {
    name: string;
    description: string;
    namespace?: string;
    includeFrontend: boolean;
    frontendPlatform: FrontendPlatform;
    outputDir: string;
}
export interface AddInput {
    archetype: ProjectArchetype;
    name: string;
    namespace: string;
    dotnetVersion: 8 | 9;
    projectRoot: string;
}
export interface SkillResult {
    success: boolean;
    filesCreated: string[];
    filesModified: string[];
    errors: string[];
}
export interface TemplateContext {
    project: DarkhorseConfig;
    timestamp: string;
    cliVersion: string;
    [key: string]: unknown;
}
/**
 * Convert a kebab-case name to PascalCase (e.g. "order-management" → "OrderManagement").
 */
export declare function toPascalCase(name: string): string;
export declare function buildProjectPaths(root: string): ProjectPaths;
/**
 * Build service-level paths within an existing project.
 * Service lives at backend/<category>/<serviceName>/.
 */
export declare function buildServicePaths(projectRoot: string, archetype: ProjectArchetype, serviceName: string): ProjectPaths;
/**
 * Build workspace-level config from init input (no service archetype).
 */
export declare function buildConfig(input: InitInput): DarkhorseConfig;
/**
 * Build service-level config from add input (archetype + namespace required).
 */
export declare function buildServiceConfig(input: AddInput, projectConfig: DarkhorseConfig): DarkhorseConfig;
//# sourceMappingURL=types.d.ts.map
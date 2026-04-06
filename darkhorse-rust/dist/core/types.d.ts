export type ProjectArchetype = 'desktop';
export declare const ARCHETYPE_LABELS: Record<ProjectArchetype, string>;
export interface RustConfig {
    framework: 'tauri';
    edition: '2021' | '2024';
    cratePrefix: string;
}
export interface FrontendConfig {
    framework: 'vanilla-ts';
    bundler: 'vite';
}
export interface FeatureFlags {
    frontend: boolean;
}
export interface ProjectPaths {
    root: string;
    crates: string;
    frontend: string;
    deployment: string;
    context: string;
    openspec: string;
    vscode: string;
}
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
export interface InitInput {
    name: string;
    description: string;
    cratePrefix?: string;
    edition: '2021' | '2024';
    includeFrontend: boolean;
    outputDir: string;
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
export declare function toSnakeCase(name: string): string;
export declare function toPascalCase(name: string): string;
export declare function deriveCratePrefix(name: string): string;
export declare function buildProjectPaths(root: string): ProjectPaths;
export declare function buildConfig(input: InitInput): DarkhorseConfig;
//# sourceMappingURL=types.d.ts.map
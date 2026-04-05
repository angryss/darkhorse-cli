/**
 * Shared types for the darkhorse-dotnet CLI.
 * Every command, agent, and skill works from these models.
 */
export const ARCHETYPE_LABELS = {
    'api': 'API — Standard REST service with persistence',
    'bff-api': 'BFF API — Backend-for-Frontend, no persistence, routes to downstream APIs/brokers',
    'microservice': 'Microservice — Message-driven, event/command handlers, no HTTP-first design',
};
export const ARCHETYPE_CATEGORIES = {
    'api': 'apis',
    'bff-api': 'bffs',
    'microservice': 'microservices',
};
// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
/**
 * Convert a kebab-case name to PascalCase (e.g. "order-management" → "OrderManagement").
 */
export function toPascalCase(name) {
    return name
        .split('-')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join('');
}
export function buildProjectPaths(root) {
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
export function buildServicePaths(projectRoot, archetype, serviceName) {
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
export function buildConfig(input) {
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
                framework: input.frontendPlatform === 'mobile' ? 'react-native' : 'react',
                toolkit: true,
            }
            : undefined,
        features: {
            mcp: true,
            openspec: true,
            frontend: input.includeFrontend,
        },
        paths: buildProjectPaths(root),
    };
}
/**
 * Build service-level config from add input (archetype + namespace required).
 */
export function buildServiceConfig(input, projectConfig) {
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
        paths: buildServicePaths(input.projectRoot, input.archetype, input.name),
    };
}
//# sourceMappingURL=types.js.map
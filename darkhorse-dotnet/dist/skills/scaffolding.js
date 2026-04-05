import path from 'node:path';
import { fsUtil, TemplateEngine } from '../core/index.js';
import { ARCHETYPE_CATEGORIES } from '../core/types.js';
import { getTemplatesDir } from './registry.js';
// ---------------------------------------------------------------------------
// scaffoldWorkspace — called by `darkhorse-dotnet init`
// Creates workspace-level directory structure and root files.
// No .sln / .csproj here — those are created per-service by `darkhorse-dotnet add`.
// ---------------------------------------------------------------------------
export async function scaffoldWorkspace(config) {
    const filesCreated = [];
    const errors = [];
    const p = config.paths;
    try {
        // Core workspace directories
        const dirs = [
            p.context,
            p.openspec,
            path.join(p.openspec, 'specs'),
            path.join(p.openspec, 'changes'),
            path.join(p.openspec, 'archive'),
            // Backend placeholder directories (services will be added under these)
            p.backend,
            path.join(p.backend, 'apis'),
            path.join(p.backend, 'bffs'),
            path.join(p.backend, 'microservices'),
            // Workspace-shared Contracts project
            path.join(p.backend, 'shared'),
            path.join(p.backend, 'shared', `${config.workspaceNamespace}.Contracts`),
            path.join(p.backend, 'shared', `${config.workspaceNamespace}.Contracts`, 'Events'),
            path.join(p.backend, 'shared', `${config.workspaceNamespace}.Contracts`, 'Abstractions'),
            path.join(p.backend, 'shared', `${config.workspaceNamespace}.Contracts`, 'Primitives'),
            p.deployment,
            p.vscode,
        ];
        if (config.features.frontend) {
            const platforms = config.frontend?.platform === 'both'
                ? ['web', 'mobile']
                : [config.frontend?.platform ?? 'web'];
            dirs.push(p.frontend);
            for (const plat of platforms) {
                const appDir = plat === 'mobile' ? 'mobile-app' : 'web-app';
                dirs.push(path.join(p.frontend, appDir), path.join(p.frontend, appDir, 'src'));
                if (plat === 'mobile') {
                    dirs.push(path.join(p.frontend, appDir, 'app'));
                }
            }
        }
        for (const dir of dirs) {
            await fsUtil.ensureDir(dir);
        }
        const engine = new TemplateEngine(getTemplatesDir());
        const ctx = buildTemplateContext(config);
        // Workspace-shared Contracts class library
        const wsNs = config.workspaceNamespace;
        const contractsCsprojPath = path.join(p.backend, 'shared', `${wsNs}.Contracts`, `${wsNs}.Contracts.csproj`);
        await engine.render('backend/shared/Contracts.csproj.hbs', ctx, contractsCsprojPath);
        filesCreated.push(contractsCsprojPath);
        // .gitkeep files so empty Contracts subdirectories are tracked
        for (const subdir of ['Events', 'Abstractions', 'Primitives']) {
            const gitkeepPath = path.join(p.backend, 'shared', `${wsNs}.Contracts`, subdir, '.gitkeep');
            await fsUtil.writeFile(gitkeepPath, '');
            filesCreated.push(gitkeepPath);
        }
        // Deployment: docker-compose.yml
        const dockerPath = path.join(p.deployment, 'docker-compose.yml');
        await engine.render('deployment/docker-compose.yml.hbs', ctx, dockerPath);
        filesCreated.push(dockerPath);
        // .vscode/mcp.json
        const mcpPath = path.join(p.vscode, 'mcp.json');
        await engine.render('vscode/mcp.json.hbs', ctx, mcpPath);
        filesCreated.push(mcpPath);
        // Root .gitignore
        const gitignorePath = path.join(p.root, '.gitignore');
        await engine.render('gitignore.hbs', ctx, gitignorePath);
        filesCreated.push(gitignorePath);
        // Root README.md
        const readmePath = path.join(p.root, 'README.md');
        await engine.render('readme.md.hbs', ctx, readmePath);
        filesCreated.push(readmePath);
        // Frontend package.json files (optional)
        if (config.features.frontend) {
            const platforms = config.frontend?.platform === 'both'
                ? ['web', 'mobile']
                : [config.frontend?.platform ?? 'web'];
            for (const plat of platforms) {
                const isMobile = plat === 'mobile';
                const appDir = isMobile ? 'mobile-app' : 'web-app';
                const template = isMobile ? 'frontend/mobile-package.json.hbs' : 'frontend/package.json.hbs';
                const pkgPath = path.join(p.frontend, appDir, 'package.json');
                await engine.render(template, ctx, pkgPath);
                filesCreated.push(pkgPath);
            }
        }
    }
    catch (err) {
        errors.push(`Workspace scaffolding error: ${err instanceof Error ? err.message : String(err)}`);
    }
    return { success: errors.length === 0, filesCreated, filesModified: [], errors };
}
// ---------------------------------------------------------------------------
// scaffoldService — called by `darkhorse-dotnet add`
// Creates service-level directory structure, .sln, .csproj, and CQRS examples.
// config.paths.backend points to root/backend/<category>/<serviceName>/.
// config.archetype and config.dotnet are required.
// ---------------------------------------------------------------------------
export async function scaffoldService(config) {
    const filesCreated = [];
    const errors = [];
    const p = config.paths;
    const archetype = config.archetype;
    const ns = config.dotnet.namespace;
    try {
        const dirs = [
            p.backend,
            path.join(p.backend, 'src'),
            path.join(p.backend, 'src', `${ns}.Presentation`),
            path.join(p.backend, 'src', `${ns}.Application`),
            path.join(p.backend, 'src', `${ns}.Domain`),
            path.join(p.backend, 'src', `${ns}.Infrastructure`),
            // Bounded context placeholders
            path.join(p.backend, 'src', `${ns}.Domain`, 'Contexts'),
            path.join(p.backend, 'src', `${ns}.Application`, 'Contexts'),
            path.join(p.backend, 'src', `${ns}.Infrastructure`, 'Contexts'),
            path.join(p.backend, 'src', `${ns}.Presentation`, 'Contexts'),
            // Tests
            path.join(p.backend, 'tests'),
            path.join(p.backend, 'tests', `${ns}.UnitTests`),
            path.join(p.backend, 'tests', `${ns}.IntegrationTests`),
        ];
        // Archetype-specific infrastructure subdirectories
        if (archetype === 'api') {
            dirs.push(path.join(p.backend, 'src', `${ns}.Infrastructure`, 'Persistence'));
        }
        else if (archetype === 'bff-api') {
            dirs.push(path.join(p.backend, 'src', `${ns}.Infrastructure`, 'Clients'));
            dirs.push(path.join(p.backend, 'src', `${ns}.Infrastructure`, 'Messaging'));
        }
        else if (archetype === 'microservice') {
            dirs.push(path.join(p.backend, 'src', `${ns}.Infrastructure`, 'Messaging'));
            dirs.push(path.join(p.backend, 'src', `${ns}.Infrastructure`, 'Events'));
        }
        for (const dir of dirs) {
            await fsUtil.ensureDir(dir);
        }
        const engine = new TemplateEngine(getTemplatesDir());
        const ctx = buildTemplateContext(config);
        // Solution file
        const slnPath = path.join(p.backend, `${ns}.sln`);
        await engine.render(`backend/${archetype}/solution.sln.hbs`, ctx, slnPath);
        filesCreated.push(slnPath);
        // Layer .csproj files
        for (const layer of ['Presentation', 'Application', 'Domain', 'Infrastructure']) {
            const csprojPath = path.join(p.backend, 'src', `${ns}.${layer}`, `${ns}.${layer}.csproj`);
            await engine.render(`backend/${archetype}/${layer}.csproj.hbs`, ctx, csprojPath);
            filesCreated.push(csprojPath);
        }
        // Program.cs entry point for the Presentation layer
        const programPath = path.join(p.backend, 'src', `${ns}.Presentation`, 'Program.cs');
        await engine.render(`backend/${archetype}/Program.cs.hbs`, ctx, programPath);
        filesCreated.push(programPath);
        // Test .csproj files
        for (const testProj of ['UnitTests', 'IntegrationTests']) {
            const testCsprojPath = path.join(p.backend, 'tests', `${ns}.${testProj}`, `${ns}.${testProj}.csproj`);
            await engine.render(`backend/tests/${testProj}.csproj.hbs`, ctx, testCsprojPath);
            filesCreated.push(testCsprojPath);
        }
        // CQRS example files
        const exampleFiles = await scaffoldCqrsExamples(config, engine, ctx);
        filesCreated.push(...exampleFiles);
    }
    catch (err) {
        errors.push(`Service scaffolding error: ${err instanceof Error ? err.message : String(err)}`);
    }
    return { success: errors.length === 0, filesCreated, filesModified: [], errors };
}
// ---------------------------------------------------------------------------
// Private helpers
// ---------------------------------------------------------------------------
async function scaffoldCqrsExamples(config, engine, ctx) {
    const filesCreated = [];
    const ns = config.dotnet.namespace;
    const archetype = config.archetype;
    const examplesDir = path.join(config.paths.backend, 'src', `${ns}.Application`, 'Examples');
    await fsUtil.ensureDir(examplesDir);
    const templateBase = `backend/${archetype}/examples`;
    const cmdPath = path.join(examplesDir, 'ExampleCommandHandler.cs');
    await engine.render(`${templateBase}/ExampleCommandHandler.cs.hbs`, ctx, cmdPath);
    filesCreated.push(cmdPath);
    const queryPath = path.join(examplesDir, 'ExampleQueryHandler.cs');
    await engine.render(`${templateBase}/ExampleQueryHandler.cs.hbs`, ctx, queryPath);
    filesCreated.push(queryPath);
    // Domain model examples — api and microservice archetypes have a full domain model
    if (archetype === 'api' || archetype === 'microservice') {
        const domainExamplesDir = path.join(config.paths.backend, 'src', `${ns}.Domain`, 'Examples');
        await fsUtil.ensureDir(domainExamplesDir);
        const domainFiles = [
            ['ExampleAggregate.cs.hbs', 'ExampleAggregate.cs'],
            ['IExampleRepository.cs.hbs', 'IExampleRepository.cs'],
            ...(archetype === 'api' ? [['ExampleValueObject.cs.hbs', 'ExampleValueObject.cs']] : []),
        ];
        for (const [template, output] of domainFiles) {
            const outPath = path.join(domainExamplesDir, output);
            await engine.render(`${templateBase}/${template}`, ctx, outPath);
            filesCreated.push(outPath);
        }
    }
    return filesCreated;
}
function buildTemplateContext(config) {
    return {
        project: config,
        archetypeCategory: config.archetype ? ARCHETYPE_CATEGORIES[config.archetype] : undefined,
        timestamp: new Date().toISOString().split('T')[0],
        cliVersion: '0.1.0',
    };
}
//# sourceMappingURL=scaffolding.js.map
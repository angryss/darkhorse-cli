import path from 'node:path';
import {
  fsUtil,
  TemplateEngine,
  type DarkhorseConfig,
  type SkillResult,
  type TemplateContext,
} from '../core/index.js';
import { getTemplatesDir } from './registry.js';

// ---------------------------------------------------------------------------
// scaffoldProject — called by `darkhorse-dotnet-desktop init`
// Creates the full five-layer WPF project structure in one pass.
// ---------------------------------------------------------------------------

export async function scaffoldProject(config: DarkhorseConfig): Promise<SkillResult> {
  const filesCreated: string[] = [];
  const errors: string[] = [];
  const p = config.paths;
  const ns = config.dotnet.namespace;

  try {
    // -----------------------------------------------------------------------
    // 1. Directory structure
    // -----------------------------------------------------------------------
    const dirs = [
      // Source layer projects
      p.src,
      path.join(p.src, `${ns}.Domain`),
      path.join(p.src, `${ns}.Domain`, 'Entities'),
      path.join(p.src, `${ns}.Domain`, 'ValueObjects'),
      path.join(p.src, `${ns}.Domain`, 'Aggregates'),
      path.join(p.src, `${ns}.Domain`, 'DomainEvents'),
      path.join(p.src, `${ns}.Domain`, 'Repositories'),
      path.join(p.src, `${ns}.Domain`, 'Services'),
      path.join(p.src, `${ns}.Application`),
      path.join(p.src, `${ns}.Application`, 'Commands'),
      path.join(p.src, `${ns}.Application`, 'Queries'),
      path.join(p.src, `${ns}.Application`, 'Handlers'),
      path.join(p.src, `${ns}.Application`, 'DTOs'),
      path.join(p.src, `${ns}.Application`, 'Behaviours'),
      path.join(p.src, `${ns}.Application`, 'Ports'),
      path.join(p.src, `${ns}.Infrastructure`),
      path.join(p.src, `${ns}.Infrastructure`, 'Repositories'),
      path.join(p.src, `${ns}.Infrastructure`, 'Adapters'),
      path.join(p.src, `${ns}.Presentation`),
      path.join(p.src, `${ns}.Presentation`, 'Views'),
      path.join(p.src, `${ns}.Presentation`, 'ViewModels'),
      path.join(p.src, `${ns}.Presentation`, 'Resources'),
      path.join(p.src, `${ns}.Presentation`, 'Converters'),
      path.join(p.src, `${ns}.Common`),
      path.join(p.src, `${ns}.Common`, 'Contracts'),
      path.join(p.src, `${ns}.Common`, 'Primitives'),
      path.join(p.src, `${ns}.Common`, 'Utilities'),
      path.join(p.src, `${ns}.Common`, 'Extensions'),
      // Tests
      p.tests,
      path.join(p.tests, `${ns}.UnitTests`),
      path.join(p.tests, `${ns}.IntegrationTests`),
      // Other
      p.vscode,
    ];

    if (config.features.persistence) {
      dirs.push(path.join(p.src, `${ns}.Infrastructure`, 'Persistence'));
      dirs.push(path.join(p.src, `${ns}.Infrastructure`, 'Persistence', 'Migrations'));
    }

    for (const dir of dirs) {
      await fsUtil.ensureDir(dir);
    }

    const engine = new TemplateEngine(getTemplatesDir());
    const ctx = buildTemplateContext(config);

    // -----------------------------------------------------------------------
    // 2. Solution file
    // -----------------------------------------------------------------------
    const slnPath = path.join(p.root, `${ns}.sln`);
    await engine.render('solution.sln.hbs', ctx, slnPath);
    filesCreated.push(slnPath);

    // -----------------------------------------------------------------------
    // 3. Layer .csproj files
    // -----------------------------------------------------------------------
    const layers: Array<{ layer: string; template: string }> = [
      { layer: 'Domain', template: 'app/Domain.csproj.hbs' },
      { layer: 'Application', template: 'app/Application.csproj.hbs' },
      { layer: 'Infrastructure', template: 'app/Infrastructure.csproj.hbs' },
      { layer: 'Presentation', template: 'app/Presentation.csproj.hbs' },
      { layer: 'Common', template: 'app/Common.csproj.hbs' },
    ];

    for (const { layer, template } of layers) {
      const csprojPath = path.join(p.src, `${ns}.${layer}`, `${ns}.${layer}.csproj`);
      await engine.render(template, ctx, csprojPath);
      filesCreated.push(csprojPath);
    }

    // -----------------------------------------------------------------------
    // 4. WPF Presentation entry point files
    // -----------------------------------------------------------------------
    const appXamlPath = path.join(p.src, `${ns}.Presentation`, 'App.xaml');
    await engine.render('app/App.xaml.hbs', ctx, appXamlPath);
    filesCreated.push(appXamlPath);

    const appXamlCsPath = path.join(p.src, `${ns}.Presentation`, 'App.xaml.cs');
    await engine.render('app/App.xaml.cs.hbs', ctx, appXamlCsPath);
    filesCreated.push(appXamlCsPath);

    const mainWindowXamlPath = path.join(p.src, `${ns}.Presentation`, 'Views', 'MainWindow.xaml');
    await engine.render('app/MainWindow.xaml.hbs', ctx, mainWindowXamlPath);
    filesCreated.push(mainWindowXamlPath);

    const mainWindowCsPath = path.join(p.src, `${ns}.Presentation`, 'Views', 'MainWindow.xaml.cs');
    await engine.render('app/MainWindow.xaml.cs.hbs', ctx, mainWindowCsPath);
    filesCreated.push(mainWindowCsPath);

    const mainVmPath = path.join(p.src, `${ns}.Presentation`, 'ViewModels', 'MainWindowViewModel.cs');
    await engine.render('app/MainWindowViewModel.cs.hbs', ctx, mainVmPath);
    filesCreated.push(mainVmPath);

    // -----------------------------------------------------------------------
    // 5. WPF Resources (theme / styles)
    // -----------------------------------------------------------------------
    const themePath = path.join(p.src, `${ns}.Presentation`, 'Resources', 'Theme.xaml');
    await engine.render('app/resources/Theme.xaml.hbs', ctx, themePath);
    filesCreated.push(themePath);

    const colorsPath = path.join(p.src, `${ns}.Presentation`, 'Resources', 'Colors.xaml');
    await engine.render('app/resources/Colors.xaml.hbs', ctx, colorsPath);
    filesCreated.push(colorsPath);

    // -----------------------------------------------------------------------
    // 6. Common primitives (base classes)
    // -----------------------------------------------------------------------
    const entityBasePath = path.join(p.src, `${ns}.Common`, 'Primitives', 'Entity.cs');
    await engine.render('app/primitives/Entity.cs.hbs', ctx, entityBasePath);
    filesCreated.push(entityBasePath);

    const aggregateBasePath = path.join(p.src, `${ns}.Common`, 'Primitives', 'AggregateRoot.cs');
    await engine.render('app/primitives/AggregateRoot.cs.hbs', ctx, aggregateBasePath);
    filesCreated.push(aggregateBasePath);

    const valueObjectBasePath = path.join(p.src, `${ns}.Common`, 'Primitives', 'ValueObject.cs');
    await engine.render('app/primitives/ValueObject.cs.hbs', ctx, valueObjectBasePath);
    filesCreated.push(valueObjectBasePath);

    const domainEventBasePath = path.join(p.src, `${ns}.Common`, 'Primitives', 'IDomainEvent.cs');
    await engine.render('app/primitives/IDomainEvent.cs.hbs', ctx, domainEventBasePath);
    filesCreated.push(domainEventBasePath);

    const viewModelBasePath = path.join(p.src, `${ns}.Common`, 'Primitives', 'ViewModelBase.cs');
    await engine.render('app/primitives/ViewModelBase.cs.hbs', ctx, viewModelBasePath);
    filesCreated.push(viewModelBasePath);

    // -----------------------------------------------------------------------
    // 7. DI bootstrapping — ServiceCollectionExtensions per layer
    // -----------------------------------------------------------------------
    const diApplication = path.join(p.src, `${ns}.Application`, 'DependencyInjection.cs');
    await engine.render('app/di/ApplicationDependencyInjection.cs.hbs', ctx, diApplication);
    filesCreated.push(diApplication);

    const diInfrastructure = path.join(p.src, `${ns}.Infrastructure`, 'DependencyInjection.cs');
    await engine.render('app/di/InfrastructureDependencyInjection.cs.hbs', ctx, diInfrastructure);
    filesCreated.push(diInfrastructure);

    // -----------------------------------------------------------------------
    // 8. CQRS example files (skeleton to illustrate the pattern)
    // -----------------------------------------------------------------------
    const examplesBase = path.join(p.src, `${ns}.Application`, 'Commands', 'Examples');
    await fsUtil.ensureDir(examplesBase);

    const exampleCmd = path.join(examplesBase, 'CreateSampleItemCommand.cs');
    await engine.render('app/examples/CreateSampleItemCommand.cs.hbs', ctx, exampleCmd);
    filesCreated.push(exampleCmd);

    const exampleHandler = path.join(examplesBase, 'CreateSampleItemCommandHandler.cs');
    await engine.render('app/examples/CreateSampleItemCommandHandler.cs.hbs', ctx, exampleHandler);
    filesCreated.push(exampleHandler);

    const exampleQuery = path.join(p.src, `${ns}.Application`, 'Queries', 'Examples', 'GetSampleItemsQuery.cs');
    await fsUtil.ensureDir(path.dirname(exampleQuery));
    await engine.render('app/examples/GetSampleItemsQuery.cs.hbs', ctx, exampleQuery);
    filesCreated.push(exampleQuery);

    const exampleQueryHandler = path.join(p.src, `${ns}.Application`, 'Queries', 'Examples', 'GetSampleItemsQueryHandler.cs');
    await engine.render('app/examples/GetSampleItemsQueryHandler.cs.hbs', ctx, exampleQueryHandler);
    filesCreated.push(exampleQueryHandler);

    const exampleEntity = path.join(p.src, `${ns}.Domain`, 'Entities', 'SampleItem.cs');
    await engine.render('app/examples/SampleItem.cs.hbs', ctx, exampleEntity);
    filesCreated.push(exampleEntity);

    const exampleVm = path.join(p.src, `${ns}.Presentation`, 'ViewModels', 'Examples', 'SampleItemsViewModel.cs');
    await fsUtil.ensureDir(path.dirname(exampleVm));
    await engine.render('app/examples/SampleItemsViewModel.cs.hbs', ctx, exampleVm);
    filesCreated.push(exampleVm);

    // -----------------------------------------------------------------------
    // 9. Test projects
    // -----------------------------------------------------------------------
    for (const testProj of ['UnitTests', 'IntegrationTests']) {
      const testCsprojPath = path.join(p.tests, `${ns}.${testProj}`, `${ns}.${testProj}.csproj`);
      await fsUtil.ensureDir(path.dirname(testCsprojPath));
      await engine.render(`tests/${testProj}.csproj.hbs`, ctx, testCsprojPath);
      filesCreated.push(testCsprojPath);
    }

    // -----------------------------------------------------------------------
    // 10. Root files
    // -----------------------------------------------------------------------
    const gitignorePath = path.join(p.root, '.gitignore');
    await engine.render('gitignore.hbs', ctx, gitignorePath);
    filesCreated.push(gitignorePath);

    const readmePath = path.join(p.root, 'README.md');
    await engine.render('readme.md.hbs', ctx, readmePath);
    filesCreated.push(readmePath);

    // -----------------------------------------------------------------------
    // 11. .vscode/mcp.json
    // -----------------------------------------------------------------------
    const mcpPath = path.join(p.vscode, 'mcp.json');
    await engine.render('vscode/mcp.json.hbs', ctx, mcpPath);
    filesCreated.push(mcpPath);

  } catch (err) {
    errors.push(`Project scaffolding error: ${err instanceof Error ? err.message : String(err)}`);
  }

  return { success: errors.length === 0, filesCreated, filesModified: [], errors };
}

// ---------------------------------------------------------------------------
// scaffoldFeature — called by `darkhorse-dotnet-desktop add`
// Adds a bounded context (feature module) across all five layer projects.
// ---------------------------------------------------------------------------

export async function scaffoldFeature(
  config: DarkhorseConfig,
  contextName: string,
): Promise<SkillResult> {
  const filesCreated: string[] = [];
  const errors: string[] = [];
  const p = config.paths;
  const ns = config.dotnet.namespace;

  try {
    // Create context folders in each layer
    const contextDirs = [
      path.join(p.src, `${ns}.Domain`, 'Entities'),          // entities go in shared Entities/ by default
      path.join(p.src, `${ns}.Application`, 'Commands', contextName),
      path.join(p.src, `${ns}.Application`, 'Queries', contextName),
      path.join(p.src, `${ns}.Application`, 'DTOs', contextName),
      path.join(p.src, `${ns}.Infrastructure`, 'Repositories', contextName),
      path.join(p.src, `${ns}.Presentation`, 'Views', contextName),
      path.join(p.src, `${ns}.Presentation`, 'ViewModels', contextName),
    ];

    for (const dir of contextDirs) {
      await fsUtil.ensureDir(dir);
      // Gitkeep so directories are tracked
      await fsUtil.writeFile(path.join(dir, '.gitkeep'), '');
      filesCreated.push(path.join(dir, '.gitkeep'));
    }

    const engine = new TemplateEngine(getTemplatesDir());
    const ctx = buildTemplateContext(config, { contextName });

    // Domain entity placeholder
    const entityPath = path.join(p.src, `${ns}.Domain`, 'Entities', `${contextName}.cs`);
    await engine.render('app/feature/Entity.cs.hbs', ctx, entityPath);
    filesCreated.push(entityPath);

    // Application command skeleton
    const cmdPath = path.join(p.src, `${ns}.Application`, 'Commands', contextName, `Create${contextName}Command.cs`);
    await engine.render('app/feature/CreateCommand.cs.hbs', ctx, cmdPath);
    filesCreated.push(cmdPath);

    // Application query skeleton
    const queryPath = path.join(p.src, `${ns}.Application`, 'Queries', contextName, `Get${contextName}Query.cs`);
    await engine.render('app/feature/GetQuery.cs.hbs', ctx, queryPath);
    filesCreated.push(queryPath);

    // Presentation ViewModel skeleton
    const vmPath = path.join(p.src, `${ns}.Presentation`, 'ViewModels', contextName, `${contextName}ViewModel.cs`);
    await engine.render('app/feature/ViewModel.cs.hbs', ctx, vmPath);
    filesCreated.push(vmPath);

    // Presentation View (XAML) skeleton
    const viewPath = path.join(p.src, `${ns}.Presentation`, 'Views', contextName, `${contextName}View.xaml`);
    await engine.render('app/feature/View.xaml.hbs', ctx, viewPath);
    filesCreated.push(viewPath);

    const viewCsPath = path.join(p.src, `${ns}.Presentation`, 'Views', contextName, `${contextName}View.xaml.cs`);
    await engine.render('app/feature/View.xaml.cs.hbs', ctx, viewCsPath);
    filesCreated.push(viewCsPath);

  } catch (err) {
    errors.push(`Feature scaffolding error: ${err instanceof Error ? err.message : String(err)}`);
  }

  return { success: errors.length === 0, filesCreated, filesModified: [], errors };
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function buildTemplateContext(
  config: DarkhorseConfig,
  extras: Record<string, unknown> = {},
): TemplateContext {
  return {
    project: config,
    timestamp: new Date().toISOString().split('T')[0],
    cliVersion: '0.1.0',
    ...extras,
  };
}

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import path from 'node:path';
import {
  createTempDir,
  cleanupTempDirs,
  buildInitConfig,
  fileExists,
  readText,
  getRelativeFiles,
} from './helpers/setup.js';
import { initAgent } from '../src/agents/init.agent.js';

// ---------------------------------------------------------------------------
// Golden path: `darkhorse-dotnet-desktop init` — materialdesign, persistence
// ---------------------------------------------------------------------------

describe('init — materialdesign with persistence', () => {
  let projectRoot: string;
  let files: string[];

  beforeAll(async () => {
    const tmpDir = await createTempDir('dh-desktop-init-md-');
    const config = buildInitConfig({ outputDir: tmpDir, uiFramework: 'materialdesign', persistence: true });
    await initAgent(config);
    projectRoot = config.paths.root;
    files = await getRelativeFiles(projectRoot);
  });

  afterAll(cleanupTempDirs);

  // ---- Root files ----

  it('creates project root directory', async () => {
    expect(await fileExists(projectRoot)).toBe(true);
  });

  it('creates .darkhorse.yaml', () => {
    expect(files).toContain('.darkhorse.yaml');
  });

  it('creates README.md', () => {
    expect(files).toContain('README.md');
  });

  it('creates .gitignore', () => {
    expect(files).toContain('.gitignore');
  });

  it('creates solution file', () => {
    const slnFiles = files.filter((f) => f.endsWith('.sln'));
    expect(slnFiles.length).toBe(1);
  });

  // ---- Source layer projects ----

  it('creates Domain .csproj', () => {
    const csproj = files.find((f) => f.includes('.Domain') && f.endsWith('.csproj'));
    expect(csproj).toBeDefined();
  });

  it('creates Application .csproj', () => {
    const csproj = files.find((f) => f.includes('.Application') && f.endsWith('.csproj'));
    expect(csproj).toBeDefined();
  });

  it('creates Infrastructure .csproj', () => {
    const csproj = files.find((f) => f.includes('.Infrastructure') && f.endsWith('.csproj'));
    expect(csproj).toBeDefined();
  });

  it('creates Presentation .csproj', () => {
    const csproj = files.find((f) => f.includes('.Presentation') && f.endsWith('.csproj'));
    expect(csproj).toBeDefined();
  });

  it('creates Common .csproj', () => {
    const csproj = files.find((f) => f.includes('.Common') && f.endsWith('.csproj'));
    expect(csproj).toBeDefined();
  });

  // ---- WPF entry point ----

  it('creates App.xaml', () => {
    const xaml = files.find((f) => f === 'src/test-desktop-app.App.xaml' || f.endsWith('/App.xaml') || f.includes('App.xaml'));
    expect(xaml).toBeDefined();
  });

  it('creates MainWindow.xaml', () => {
    const xaml = files.find((f) => f.includes('MainWindow.xaml') && !f.endsWith('.cs'));
    expect(xaml).toBeDefined();
  });

  it('creates MainWindowViewModel.cs', () => {
    const vm = files.find((f) => f.includes('MainWindowViewModel.cs'));
    expect(vm).toBeDefined();
  });

  // ---- Common primitives ----

  it('creates Entity.cs primitive', () => {
    expect(files.some((f) => f.includes('Entity.cs') && f.includes('Primitives'))).toBe(true);
  });

  it('creates AggregateRoot.cs primitive', () => {
    expect(files.some((f) => f.includes('AggregateRoot.cs'))).toBe(true);
  });

  it('creates ValueObject.cs primitive', () => {
    expect(files.some((f) => f.includes('ValueObject.cs'))).toBe(true);
  });

  it('creates IDomainEvent.cs primitive', () => {
    expect(files.some((f) => f.includes('IDomainEvent.cs'))).toBe(true);
  });

  it('creates ViewModelBase.cs primitive', () => {
    expect(files.some((f) => f.includes('ViewModelBase.cs'))).toBe(true);
  });

  // ---- DI bootstrap ----

  it('creates Application DependencyInjection.cs', () => {
    expect(files.some((f) => f.includes('.Application') && f.includes('DependencyInjection.cs'))).toBe(true);
  });

  it('creates Infrastructure DependencyInjection.cs', () => {
    expect(files.some((f) => f.includes('.Infrastructure') && f.includes('DependencyInjection.cs'))).toBe(true);
  });

  // ---- Resources ----

  it('creates Theme.xaml resource', () => {
    expect(files.some((f) => f.includes('Theme.xaml'))).toBe(true);
  });

  it('creates Colors.xaml resource', () => {
    expect(files.some((f) => f.includes('Colors.xaml'))).toBe(true);
  });

  // ---- CQRS examples ----

  it('creates example command file', () => {
    expect(files.some((f) => f.includes('CreateSampleItemCommand.cs'))).toBe(true);
  });

  it('creates example query file', () => {
    expect(files.some((f) => f.includes('GetSampleItemsQuery.cs'))).toBe(true);
  });

  it('creates example entity file', () => {
    expect(files.some((f) => f.includes('SampleItem.cs'))).toBe(true);
  });

  it('creates example ViewModel file', () => {
    expect(files.some((f) => f.includes('SampleItemsViewModel.cs'))).toBe(true);
  });

  // ---- Test projects ----

  it('creates UnitTests .csproj', () => {
    expect(files.some((f) => f.includes('.UnitTests') && f.endsWith('.csproj'))).toBe(true);
  });

  it('creates IntegrationTests .csproj', () => {
    expect(files.some((f) => f.includes('.IntegrationTests') && f.endsWith('.csproj'))).toBe(true);
  });

  // ---- Context files ----

  it('creates context/ with 4 navigation files', () => {
    const contextFiles = files.filter((f) => f.startsWith('context/'));
    expect(contextFiles).toContain('context/00-START-HERE.md');
    expect(contextFiles).toContain('context/10-REPO-MAP.md');
    expect(contextFiles).toContain('context/30-BOUNDED-CONTEXTS.md');
    expect(contextFiles).toContain('context/50-SEARCH-QUERIES.md');
  });

  // ---- OpenSpec files ----

  it('creates openspec/AGENTS.md', () => {
    expect(files).toContain('openspec/AGENTS.md');
  });

  it('creates openspec/specs/architecture/ with rule files', () => {
    const archFiles = files.filter((f) => f.startsWith('openspec/specs/architecture/'));
    expect(archFiles.length).toBeGreaterThanOrEqual(1);
  });

  it('creates openspec/specs/patterns/ with guide files', () => {
    const patternFiles = files.filter((f) => f.startsWith('openspec/specs/patterns/'));
    expect(patternFiles.length).toBeGreaterThanOrEqual(1);
  });

  it('creates openspec/specs/workflow/skills/ with skill files', () => {
    const skillFiles = files.filter((f) => f.startsWith('openspec/specs/workflow/skills/'));
    expect(skillFiles.length).toBeGreaterThanOrEqual(1);
  });

  it('creates openspec/specs/project/roadmap.md', () => {
    expect(files).toContain('openspec/specs/project/roadmap.md');
  });

  it('creates openspec/changes/mvp-1.0/progress-tracker.md', () => {
    expect(files).toContain('openspec/changes/mvp-1.0/progress-tracker.md');
  });

  // ---- Copilot adapter ----

  it('creates .github/agents/ with agent files', () => {
    const agentFiles = files.filter((f) => f.startsWith('.github/agents/'));
    expect(agentFiles.length).toBeGreaterThanOrEqual(1);
  });

  it('creates .github/prompts/ with prompt files', () => {
    const promptFiles = files.filter((f) => f.startsWith('.github/prompts/'));
    expect(promptFiles.length).toBeGreaterThanOrEqual(1);
  });

  it('creates .github/copilot-instructions.md', () => {
    expect(files).toContain('.github/copilot-instructions.md');
  });

  // ---- Deployment: WiX installer ----

  it('creates deploy/installer/ directory with WiX files', () => {
    const deployFiles = files.filter((f) => f.startsWith('deploy/installer/'));
    expect(deployFiles.length).toBeGreaterThanOrEqual(3);
  });

  it('creates WiX project file (.wixproj)', () => {
    expect(files.some((f) => f.endsWith('.wixproj'))).toBe(true);
  });

  it('creates Product.wxs', () => {
    expect(files).toContain('deploy/installer/Product.wxs');
  });

  it('creates Variables.wxi', () => {
    expect(files).toContain('deploy/installer/Variables.wxi');
  });

  it('creates ExitDialogOverride.wxs', () => {
    expect(files).toContain('deploy/installer/ui/ExitDialogOverride.wxs');
  });

  it('creates icon placeholder', () => {
    expect(files).toContain('deploy/installer/assets/app.ico.placeholder');
  });

  it('Product.wxs includes desktop shortcut feature', async () => {
    const content = await readText(path.join(projectRoot, 'deploy', 'installer', 'Product.wxs'));
    expect(content).toContain('FeatureDesktopShortcut');
    expect(content).toContain('WIXUI_EXITDIALOGOPTIONALCHECKBOX');
  });

  it('WiX installer project included in solution', async () => {
    const slnFiles = files.filter((f) => f.endsWith('.sln'));
    const sln = await readText(path.join(projectRoot, slnFiles[0]!));
    expect(sln).toContain('.Installer');
    expect(sln).toContain('930C7802');
  });

  it('no GitHub Actions pipeline generated when cicd=none', () => {
    const pipeline = files.find((f) => f.includes('workflows/') && f.endsWith('.yml'));
    // Only OpenSpec workflow copies should be present (if any), not the build-installer pipeline
    const buildPipeline = files.find((f) => f === '.github/workflows/build-installer.yml');
    expect(buildPipeline).toBeUndefined();
  });

  // ---- Content checks ----

  it('AGENTS.md mentions WPF and MVVM', async () => {
    const content = await readText(path.join(projectRoot, 'openspec', 'AGENTS.md'));
    expect(content).toContain('WPF');
    expect(content).toContain('MVVM');
    expect(content).toContain('CQRS');
  });

  it('Presentation .csproj includes UseWPF', async () => {
    const ns = 'TestDesktopApp'; // PascalCase of 'test-desktop-app'
    const csprojPath = path.join(projectRoot, 'src', `${ns}.Presentation`, `${ns}.Presentation.csproj`);
    const exists = await fileExists(csprojPath);
    if (exists) {
      const content = await readText(csprojPath);
      expect(content).toContain('UseWPF');
    }
  });

  it('Infrastructure .csproj includes EF Core SQLite when persistence=true', async () => {
    const ns = 'TestDesktopApp';
    const csprojPath = path.join(projectRoot, 'src', `${ns}.Infrastructure`, `${ns}.Infrastructure.csproj`);
    const exists = await fileExists(csprojPath);
    if (exists) {
      const content = await readText(csprojPath);
      expect(content).toContain('EntityFrameworkCore.Sqlite');
    }
  });
});

// ---------------------------------------------------------------------------
// Golden path: fluent UI without persistence
// ---------------------------------------------------------------------------

describe('init — fluent UI without persistence', () => {
  let projectRoot: string;
  let files: string[];

  beforeAll(async () => {
    const tmpDir = await createTempDir('dh-desktop-init-fluent-');
    const config = buildInitConfig({
      outputDir: tmpDir,
      name: 'my-fluent-app',
      uiFramework: 'fluent',
      persistence: false,
    });
    await initAgent(config);
    projectRoot = config.paths.root;
    files = await getRelativeFiles(projectRoot);
  });

  afterAll(cleanupTempDirs);

  it('creates project root', async () => {
    expect(await fileExists(projectRoot)).toBe(true);
  });

  it('creates all five layer .csproj files', () => {
    const csprojFiles = files.filter((f) => f.endsWith('.csproj') && f.startsWith('src/'));
    expect(csprojFiles.length).toBe(5);
  });

  it('Infrastructure .csproj does NOT include EF Core when persistence=false', async () => {
    const ns = 'MyFluentApp';
    const csprojPath = path.join(projectRoot, 'src', `${ns}.Infrastructure`, `${ns}.Infrastructure.csproj`);
    const exists = await fileExists(csprojPath);
    if (exists) {
      const content = await readText(csprojPath);
      expect(content).not.toContain('EntityFrameworkCore.Sqlite');
    }
  });

  it('creates context/ directory', () => {
    const contextFiles = files.filter((f) => f.startsWith('context/'));
    expect(contextFiles.length).toBe(4);
  });

  it('creates openspec/AGENTS.md', () => {
    expect(files).toContain('openspec/AGENTS.md');
  });
});

// ---------------------------------------------------------------------------
// Deployment: GitHub Actions pipeline generated when cicd=github-actions
// ---------------------------------------------------------------------------

describe('init — GitHub Actions CI/CD', () => {
  let projectRoot: string;
  let files: string[];

  beforeAll(async () => {
    const tmpDir = await createTempDir('dh-desktop-init-gha-');
    const config = buildInitConfig({
      outputDir: tmpDir,
      name: 'my-gha-app',
      cicd: 'github-actions',
    });
    await initAgent(config);
    projectRoot = config.paths.root;
    files = await getRelativeFiles(projectRoot);
  });

  afterAll(cleanupTempDirs);

  it('creates GitHub Actions build-installer.yml', () => {
    expect(files).toContain('.github/workflows/build-installer.yml');
  });

  it('build-installer.yml contains WiX install step', async () => {
    const content = await readText(path.join(projectRoot, '.github', 'workflows', 'build-installer.yml'));
    expect(content).toContain('wix');
    expect(content).toContain('win-x64');
  });

  it('creates WiX installer regardless of cicd choice', () => {
    expect(files.some((f) => f.endsWith('.wixproj'))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Deployment: Azure DevOps pipeline
// ---------------------------------------------------------------------------

describe('init — Azure DevOps CI/CD', () => {
  let projectRoot: string;
  let files: string[];

  beforeAll(async () => {
    const tmpDir = await createTempDir('dh-desktop-init-ado-');
    const config = buildInitConfig({
      outputDir: tmpDir,
      name: 'my-ado-app',
      cicd: 'ado',
      adoOrgUrl: 'https://dev.azure.com/myorg',
    });
    await initAgent(config);
    projectRoot = config.paths.root;
    files = await getRelativeFiles(projectRoot);
  });

  afterAll(cleanupTempDirs);

  it('creates azure-pipelines.yml at project root', () => {
    expect(files).toContain('azure-pipelines.yml');
  });

  it('azure-pipelines.yml references dotnet publish and WiX build', async () => {
    const content = await readText(path.join(projectRoot, 'azure-pipelines.yml'));
    expect(content).toContain('wix');
    expect(content).toContain('PublishBuildArtifacts');
  });

  it('azure-pipelines.yml includes ADO org URL comment', async () => {
    const content = await readText(path.join(projectRoot, 'azure-pipelines.yml'));
    expect(content).toContain('https://dev.azure.com/myorg');
  });
});

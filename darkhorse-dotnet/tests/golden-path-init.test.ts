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
// Golden path: `darkhorse-dotnet init` (no frontend)
// ---------------------------------------------------------------------------

describe('init — no frontend', () => {
  let projectRoot: string;
  let files: string[];

  beforeAll(async () => {
    const tmpDir = await createTempDir('dh-init-nofrontend-');
    const config = buildInitConfig({ outputDir: tmpDir });
    await initAgent(config);
    projectRoot = config.paths.root;
    files = await getRelativeFiles(projectRoot);
  });

  afterAll(cleanupTempDirs);

  // ---- Workspace structure ----

  it('creates workspace root directory', async () => {
    expect(await fileExists(projectRoot)).toBe(true);
  });

  it('creates context/ directory with 4 files', () => {
    const contextFiles = files.filter((f) => f.startsWith('context/'));
    expect(contextFiles).toContain('context/00-START-HERE.md');
    expect(contextFiles).toContain('context/10-REPO-MAP.md');
    expect(contextFiles).toContain('context/30-BOUNDED-CONTEXTS.md');
    expect(contextFiles).toContain('context/50-SEARCH-QUERIES.md');
  });

  it('creates openspec/ directory with AGENTS.md', () => {
    expect(files).toContain('openspec/AGENTS.md');
  });

  it('creates openspec/specs/architecture/ with rule files', () => {
    const archFiles = files.filter((f) => f.startsWith('openspec/specs/architecture/'));
    expect(archFiles.length).toBeGreaterThanOrEqual(1);
    expect(archFiles.some((f) => f.endsWith('.md'))).toBe(true);
  });

  it('creates openspec/specs/patterns/ with guide files', () => {
    const patternFiles = files.filter((f) => f.startsWith('openspec/specs/patterns/'));
    expect(patternFiles.length).toBeGreaterThanOrEqual(1);
  });

  it('creates openspec/specs/workflow/ with workflow files', () => {
    const wfFiles = files.filter((f) => f.startsWith('openspec/specs/workflow/'));
    expect(wfFiles.length).toBeGreaterThanOrEqual(1);
  });

  it('creates openspec/specs/domain/README.md', () => {
    expect(files).toContain('openspec/specs/domain/README.md');
  });

  it('creates openspec/specs/project/ with roadmap and progress tracker', () => {
    expect(files).toContain('openspec/specs/project/roadmap.md');
    expect(files).toContain('openspec/specs/project/progress-tracker.md');
  });

  it('creates backend/ directory with archetype category folders', async () => {
    expect(await fileExists(path.join(projectRoot, 'backend', 'apis'))).toBe(true);
    expect(await fileExists(path.join(projectRoot, 'backend', 'bffs'))).toBe(true);
    expect(await fileExists(path.join(projectRoot, 'backend', 'microservices'))).toBe(true);
  });

  it('creates deployment/docker-compose.yml', () => {
    expect(files).toContain('deployment/docker-compose.yml');
  });

  it('creates .vscode/mcp.json', () => {
    expect(files).toContain('.vscode/mcp.json');
  });

  it('creates root .gitignore', () => {
    expect(files).toContain('.gitignore');
  });

  it('creates root README.md', () => {
    expect(files).toContain('README.md');
  });

  it('creates .darkhorse.yaml', () => {
    expect(files).toContain('.darkhorse.yaml');
  });

  // ---- No frontend ----

  it('does NOT create frontend/ directory', async () => {
    expect(await fileExists(path.join(projectRoot, 'frontend'))).toBe(false);
  });

  it('does NOT create openspec/specs/toolkit/', () => {
    const toolkitFiles = files.filter((f) => f.startsWith('openspec/specs/toolkit/'));
    expect(toolkitFiles).toHaveLength(0);
  });

  // ---- Template rendering ----

  it('README.md contains project name', async () => {
    const content = await readText(path.join(projectRoot, 'README.md'));
    expect(content).toContain('test-project');
  });

  it('.darkhorse.yaml contains project config', async () => {
    const content = await readText(path.join(projectRoot, '.darkhorse.yaml'));
    expect(content).toContain('name: test-project');
    expect(content).toContain('workspaceNamespace: TestProject');
    expect(content).toContain('frontend: false');
  });
});

// ---------------------------------------------------------------------------
// Golden path: `darkhorse-dotnet init` (web frontend)
// ---------------------------------------------------------------------------

describe('init — web frontend', () => {
  let projectRoot: string;
  let files: string[];

  beforeAll(async () => {
    const tmpDir = await createTempDir('dh-init-web-');
    const config = buildInitConfig({
      name: 'web-project',
      outputDir: tmpDir,
      includeFrontend: true,
      frontendPlatform: 'web',
    });
    await initAgent(config);
    projectRoot = config.paths.root;
    files = await getRelativeFiles(projectRoot);
  });

  afterAll(cleanupTempDirs);

  it('creates frontend/web-app/ directory', async () => {
    expect(await fileExists(path.join(projectRoot, 'frontend', 'web-app'))).toBe(true);
  });

  it('creates frontend/web-app/package.json', () => {
    expect(files).toContain('frontend/web-app/package.json');
  });

  it('does NOT create frontend/mobile-app/', async () => {
    expect(await fileExists(path.join(projectRoot, 'frontend', 'mobile-app'))).toBe(false);
  });

  it('package.json contains react dependency', async () => {
    const content = await readText(path.join(projectRoot, 'frontend', 'web-app', 'package.json'));
    expect(content).toContain('"react"');
  });

  it('creates openspec/specs/toolkit/README.md', () => {
    expect(files).toContain('openspec/specs/toolkit/README.md');
  });

  it('.darkhorse.yaml indicates frontend enabled', async () => {
    const content = await readText(path.join(projectRoot, '.darkhorse.yaml'));
    expect(content).toContain('frontend: true');
    expect(content).toContain('platform: web');
  });

  it('context/00-START-HERE.md references frontend', async () => {
    const content = await readText(path.join(projectRoot, 'context', '00-START-HERE.md'));
    expect(content).toContain('React');
    expect(content).toContain('web-app');
  });
});

// ---------------------------------------------------------------------------
// Golden path: `darkhorse-dotnet init` (mobile frontend)
// ---------------------------------------------------------------------------

describe('init — mobile frontend', () => {
  let projectRoot: string;
  let files: string[];

  beforeAll(async () => {
    const tmpDir = await createTempDir('dh-init-mobile-');
    const config = buildInitConfig({
      name: 'mobile-project',
      outputDir: tmpDir,
      includeFrontend: true,
      frontendPlatform: 'mobile',
    });
    await initAgent(config);
    projectRoot = config.paths.root;
    files = await getRelativeFiles(projectRoot);
  });

  afterAll(cleanupTempDirs);

  it('creates frontend/mobile-app/ directory', async () => {
    expect(await fileExists(path.join(projectRoot, 'frontend', 'mobile-app'))).toBe(true);
  });

  it('creates frontend/mobile-app/package.json', () => {
    expect(files).toContain('frontend/mobile-app/package.json');
  });

  it('does NOT create frontend/web-app/', async () => {
    expect(await fileExists(path.join(projectRoot, 'frontend', 'web-app'))).toBe(false);
  });

  it('mobile package.json contains expo dependency', async () => {
    const content = await readText(path.join(projectRoot, 'frontend', 'mobile-app', 'package.json'));
    expect(content).toContain('"expo"');
  });

  it('.darkhorse.yaml indicates mobile platform', async () => {
    const content = await readText(path.join(projectRoot, '.darkhorse.yaml'));
    expect(content).toContain('platform: mobile');
    expect(content).toContain('framework: react-native');
  });
});

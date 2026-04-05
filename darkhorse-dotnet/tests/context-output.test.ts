import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import path from 'node:path';
import {
  createTempDir,
  cleanupTempDirs,
  buildInitConfig,
  readText,
} from './helpers/setup.js';
import { initAgent } from '../src/agents/init.agent.js';

/**
 * Context output validation — ensures generated context/ files are coherent,
 * adapted to the workspace, and provide real navigational value.
 */

// ---------------------------------------------------------------------------
// Context files for workspace with no frontend
// ---------------------------------------------------------------------------

describe('context output — no frontend', () => {
  let projectRoot: string;

  beforeAll(async () => {
    const tmpDir = await createTempDir('dh-ctx-nofrontend-');
    const config = buildInitConfig({
      outputDir: tmpDir,
      name: 'ctx-test-project',
      description: 'Context validation test workspace',
      includeFrontend: false,
    });
    await initAgent(config);
    projectRoot = config.paths.root;
  });

  afterAll(cleanupTempDirs);

  // ---- 00-START-HERE.md ----

  describe('00-START-HERE.md', () => {
    let content: string;

    beforeAll(async () => {
      content = await readText(path.join(projectRoot, 'context', '00-START-HERE.md'));
    });

    it('contains project name', () => {
      expect(content).toContain('ctx-test-project');
    });

    it('contains project description', () => {
      expect(content).toContain('Context validation test workspace');
    });

    it('describes architecture stack', () => {
      expect(content).toContain('DDD');
      expect(content).toContain('Onion Architecture');
      expect(content).toContain('CQRS');
    });

    it('has navigation table with all context files', () => {
      expect(content).toContain('00-START-HERE.md');
      expect(content).toContain('10-REPO-MAP.md');
      expect(content).toContain('30-BOUNDED-CONTEXTS.md');
      expect(content).toContain('50-SEARCH-QUERIES.md');
    });

    it('links to AGENTS.md as next read', () => {
      expect(content).toContain('AGENTS.md');
      expect(content).toContain('Read next');
    });

    it('shows actual workspace directory structure', () => {
      expect(content).toContain('context/');
      expect(content).toContain('openspec/');
      expect(content).toContain('backend/');
      expect(content).toContain('deployment/');
      expect(content).toContain('.darkhorse.yaml');
    });

    it('shows backend archetype categories', () => {
      expect(content).toContain('apis/');
      expect(content).toContain('bffs/');
      expect(content).toContain('microservices/');
    });

    it('does NOT reference frontend when disabled', () => {
      // Should not have a frontend/ entry in the structure tree
      expect(content).not.toContain('web-app/');
      expect(content).not.toContain('mobile-app/');
    });

    it('provides actionable next steps', () => {
      expect(content).toContain('darkhorse-dotnet add');
      expect(content).toContain('roadmap.md');
    });

    it('indicates no services yet', () => {
      expect(content).toContain('No services yet');
    });
  });

  // ---- 10-REPO-MAP.md ----

  describe('10-REPO-MAP.md', () => {
    let content: string;

    beforeAll(async () => {
      content = await readText(path.join(projectRoot, 'context', '10-REPO-MAP.md'));
    });

    it('contains project name', () => {
      expect(content).toContain('ctx-test-project');
    });

    it('has top-level structure table', () => {
      expect(content).toContain('context/');
      expect(content).toContain('openspec/');
      expect(content).toContain('backend/');
      expect(content).toContain('deployment/');
    });

    it('describes backend service archetypes', () => {
      // Even without a specific service, the template should explain the categories
      expect(content).toContain('apis');
      expect(content).toContain('bffs');
      expect(content).toContain('microservices');
    });

    it('is not generic placeholder text', () => {
      // Should be adapted to this specific project
      expect(content).toContain('ctx-test-project');
      expect(content.length).toBeGreaterThan(200);
    });
  });

  // ---- 30-BOUNDED-CONTEXTS.md ----

  describe('30-BOUNDED-CONTEXTS.md', () => {
    let content: string;

    beforeAll(async () => {
      content = await readText(path.join(projectRoot, 'context', '30-BOUNDED-CONTEXTS.md'));
    });

    it('contains project name', () => {
      expect(content).toContain('ctx-test-project');
    });

    it('has context map section', () => {
      expect(content).toContain('Context Map');
    });

    it('has integration patterns reference', () => {
      expect(content).toContain('Anti-Corruption Layer');
      expect(content).toContain('Published Language');
    });

    it('provides example entry as a template', () => {
      expect(content).toContain('Example Entry');
    });

    it('instructs user to add contexts', () => {
      expect(content).toContain('No bounded contexts defined yet');
    });
  });

  // ---- 50-SEARCH-QUERIES.md ----

  describe('50-SEARCH-QUERIES.md', () => {
    let content: string;

    beforeAll(async () => {
      content = await readText(path.join(projectRoot, 'context', '50-SEARCH-QUERIES.md'));
    });

    it('contains project name', () => {
      expect(content).toContain('ctx-test-project');
    });

    it('has find by convention section', () => {
      expect(content).toContain('Convention');
      expect(content).toContain('AggregateRoot');
      expect(content).toContain('IRequest');
      expect(content).toContain('IRequestHandler');
    });

    it('does NOT have frontend search section when frontend disabled', () => {
      expect(content).not.toContain('Frontend Search');
    });
  });
});

// ---------------------------------------------------------------------------
// Context files for workspace with web frontend
// ---------------------------------------------------------------------------

describe('context output — with web frontend', () => {
  let projectRoot: string;

  beforeAll(async () => {
    const tmpDir = await createTempDir('dh-ctx-web-');
    const config = buildInitConfig({
      outputDir: tmpDir,
      name: 'ctx-web-project',
      description: 'Context test with frontend',
      includeFrontend: true,
      frontendPlatform: 'web',
    });
    await initAgent(config);
    projectRoot = config.paths.root;
  });

  afterAll(cleanupTempDirs);

  it('00-START-HERE.md references React frontend', async () => {
    const content = await readText(path.join(projectRoot, 'context', '00-START-HERE.md'));
    expect(content).toContain('React');
    expect(content).toContain('web-app');
  });

  it('10-REPO-MAP.md has frontend/ in structure', async () => {
    const content = await readText(path.join(projectRoot, 'context', '10-REPO-MAP.md'));
    expect(content).toContain('frontend/');
  });
});

// ---------------------------------------------------------------------------
// Context files with "both" frontend platform
// ---------------------------------------------------------------------------

describe('context output — with both frontend platforms', () => {
  let projectRoot: string;

  beforeAll(async () => {
    const tmpDir = await createTempDir('dh-ctx-both-');
    const config = buildInitConfig({
      outputDir: tmpDir,
      name: 'ctx-both-project',
      description: 'Context test with both platforms',
      includeFrontend: true,
      frontendPlatform: 'both',
    });
    await initAgent(config);
    projectRoot = config.paths.root;
  });

  afterAll(cleanupTempDirs);

  it('00-START-HERE.md references both web-app and mobile-app', async () => {
    const content = await readText(path.join(projectRoot, 'context', '00-START-HERE.md'));
    expect(content).toContain('web-app');
    expect(content).toContain('mobile-app');
  });

  it('00-START-HERE.md mentions React + React Native', async () => {
    const content = await readText(path.join(projectRoot, 'context', '00-START-HERE.md'));
    expect(content).toContain('React');
    expect(content).toContain('React Native');
  });
});

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import path from 'node:path';
import {
  createTempDir,
  cleanupTempDirs,
  buildInitConfig,
  readText,
  fileExists,
  getRelativeFiles,
} from './helpers/setup.js';
import { initAgent } from '../src/agents/init.agent.js';

/**
 * OpenSpec output validation — ensures generated OpenSpec content is
 * complete, coherent, and production-quality.
 */

describe('OpenSpec output — init workspace', () => {
  let projectRoot: string;
  let files: string[];

  beforeAll(async () => {
    const tmpDir = await createTempDir('dh-openspec-');
    const config = buildInitConfig({
      outputDir: tmpDir,
      name: 'openspec-test',
      description: 'Project to validate OpenSpec output quality',
      includeFrontend: true,
      frontendPlatform: 'web',
    });
    await initAgent(config);
    projectRoot = config.paths.root;
    files = await getRelativeFiles(projectRoot);
  });

  afterAll(cleanupTempDirs);

  // ---- AGENTS.md — AI agent entry point ----

  describe('AGENTS.md', () => {
    let content: string;

    beforeAll(async () => {
      content = await readText(path.join(projectRoot, 'openspec', 'AGENTS.md'));
    });

    it('exists', () => {
      expect(files).toContain('openspec/AGENTS.md');
    });

    it('contains project name', () => {
      expect(content).toContain('openspec-test');
    });

    it('contains project description', () => {
      expect(content).toContain('Project to validate OpenSpec output quality');
    });

    it('contains reading order', () => {
      expect(content).toContain('Reading Order');
      expect(content).toContain('context/00-START-HERE.md');
    });

    it('references architecture rules', () => {
      expect(content).toContain('architecture');
      expect(content).toContain('Onion Architecture');
    });

    it('references CQRS via MediatR', () => {
      expect(content).toContain('CQRS');
      expect(content).toContain('MediatR');
    });

    it('references archetype commands', () => {
      expect(content).toContain('darkhorse-dotnet add api');
      expect(content).toContain('darkhorse-dotnet add bff-api');
      expect(content).toContain('darkhorse-dotnet add microservice');
    });

    it('references DDD', () => {
      expect(content).toContain('DDD');
      expect(content).toContain('Bounded contexts');
    });

    it('references repository pattern', () => {
      expect(content).toContain('Repository');
    });
  });

  // ---- Roadmap ----

  describe('roadmap.md', () => {
    let content: string;

    beforeAll(async () => {
      content = await readText(path.join(projectRoot, 'openspec', 'specs', 'project', 'roadmap.md'));
    });

    it('exists', () => {
      expect(files).toContain('openspec/specs/project/roadmap.md');
    });

    it('contains MVP summary table', () => {
      expect(content).toContain('MVP Summary');
      expect(content).toContain('MVP');
      expect(content).toContain('Status');
    });

    it('contains REQ-{MVP}-{###} naming convention', () => {
      expect(content).toContain('REQ-{MVP}-{###}');
    });

    it('contains example requirement IDs', () => {
      expect(content).toContain('REQ-1.0-001');
    });

    it('contains full-slice default language', () => {
      expect(content).toContain('full-slice');
      expect(content).toContain('Default');
    });

    it('defines scope classification table', () => {
      expect(content).toContain('full-slice');
      expect(content).toContain('backend');
      expect(content).toContain('infrastructure');
      expect(content).toContain('docs');
    });

    it('includes frontend scope when frontend enabled', () => {
      expect(content).toContain('frontend');
      expect(content).toContain('Frontend');
    });

    it('contains MVP 1.0 Foundation section', () => {
      expect(content).toContain('MVP 1.0');
      expect(content).toContain('Foundation');
    });

    it('contains adding new MVP instructions', () => {
      expect(content).toContain('Adding a New MVP');
    });
  });

  // ---- Progress tracker ----

  describe('progress-tracker.md', () => {
    let content: string;

    beforeAll(async () => {
      content = await readText(path.join(projectRoot, 'openspec', 'specs', 'project', 'progress-tracker.md'));
    });

    it('exists', () => {
      expect(files).toContain('openspec/specs/project/progress-tracker.md');
    });

    it('contains current status table', () => {
      expect(content).toContain('Current Status');
      expect(content).toContain('Total REQs');
      expect(content).toContain('Done');
      expect(content).toContain('In Progress');
    });

    it('contains activity log with initialization entry', () => {
      expect(content).toContain('Activity Log');
      expect(content).toContain('Workspace initialized');
      expect(content).toContain('DarkHorse .NET CLI');
    });

    it('contains requirement tracking table in MVP 1.0', () => {
      expect(content).toContain('REQ-1.0-001');
      expect(content).toContain('Scope');
      expect(content).toContain('Priority');
      expect(content).toContain('Status');
    });

    it('contains bounded context progress table', () => {
      expect(content).toContain('Bounded Context Progress');
      expect(content).toContain('Entities');
      expect(content).toContain('Commands');
      expect(content).toContain('Queries');
    });

    it('contains service checklist', () => {
      expect(content).toContain('Service Checklist');
      expect(content).toContain('Scaffolded');
      expect(content).toContain('Building');
      expect(content).toContain('Tested');
    });

    it('contains status values reference', () => {
      expect(content).toContain('Not Started');
      expect(content).toContain('In Progress');
      expect(content).toContain('Done');
      expect(content).toContain('Blocked');
    });
  });

  // ---- MVP structure ----

  describe('MVP structure', () => {
    it('has mvps/ directory for future MVPs', async () => {
      expect(await fileExists(path.join(projectRoot, 'openspec', 'specs', 'project', 'mvps'))).toBe(true);
    });
  });

  // ---- Architecture specs (from rules/) ----

  describe('architecture specs', () => {
    it('architecture rules are seeded', () => {
      const archFiles = files.filter((f) => f.startsWith('openspec/specs/architecture/'));
      expect(archFiles.length).toBeGreaterThanOrEqual(3);
    });

    it('has architecture-rules.md', () => {
      expect(files).toContain('openspec/specs/architecture/architecture-rules.md');
    });

    it('has archetype-rules.md', () => {
      expect(files).toContain('openspec/specs/architecture/archetype-rules.md');
    });

    it('has scaffolding-rules.md', () => {
      expect(files).toContain('openspec/specs/architecture/scaffolding-rules.md');
    });
  });

  // ---- Pattern specs (from guides/) ----

  describe('pattern specs', () => {
    it('patterns directory has guide files', () => {
      const patternFiles = files.filter((f) => f.startsWith('openspec/specs/patterns/'));
      expect(patternFiles.length).toBeGreaterThanOrEqual(1);
    });

    it('has backend-patterns.md', () => {
      expect(files).toContain('openspec/specs/patterns/backend-patterns.md');
    });
  });

  // ---- Workflow specs ----

  describe('workflow specs', () => {
    it('workflow directory has skill files', () => {
      const wfFiles = files.filter((f) =>
        f.startsWith('openspec/specs/workflow/') && !f.includes('commands/')
      );
      expect(wfFiles.length).toBeGreaterThanOrEqual(1);
    });

    it('workflow commands are seeded as reference', () => {
      const cmdFiles = files.filter((f) => f.startsWith('openspec/specs/workflow/commands/'));
      expect(cmdFiles.length).toBeGreaterThanOrEqual(1);
    });
  });

  // ---- Domain template ----

  describe('domain template', () => {
    it('has domain/README.md with bounded context guidelines', async () => {
      const content = await readText(path.join(projectRoot, 'openspec', 'specs', 'domain', 'README.md'));
      expect(content.length).toBeGreaterThan(50);
    });
  });

  // ---- Toolkit spec (frontend enabled) ----

  describe('toolkit spec', () => {
    it('has toolkit/README.md when frontend is enabled', () => {
      expect(files).toContain('openspec/specs/toolkit/README.md');
    });
  });

  // ---- Changes and archive directories ----

  describe('changes and archive', () => {
    it('creates openspec/changes/ directory', async () => {
      expect(await fileExists(path.join(projectRoot, 'openspec', 'changes'))).toBe(true);
    });

    it('creates openspec/archive/ directory', async () => {
      expect(await fileExists(path.join(projectRoot, 'openspec', 'archive'))).toBe(true);
    });
  });
});

// ---------------------------------------------------------------------------
// OpenSpec without frontend — toolkit spec should NOT exist
// ---------------------------------------------------------------------------

describe('OpenSpec output — no frontend', () => {
  let projectRoot: string;
  let files: string[];

  beforeAll(async () => {
    const tmpDir = await createTempDir('dh-openspec-nofrontend-');
    const config = buildInitConfig({
      outputDir: tmpDir,
      name: 'nofrontend-openspec-test',
      includeFrontend: false,
    });
    await initAgent(config);
    projectRoot = config.paths.root;
    files = await getRelativeFiles(projectRoot);
  });

  afterAll(cleanupTempDirs);

  it('does NOT create openspec/specs/toolkit/', () => {
    const toolkitFiles = files.filter((f) => f.startsWith('openspec/specs/toolkit/'));
    expect(toolkitFiles).toHaveLength(0);
  });

  it('roadmap does not reference frontend scope', async () => {
    const content = await readText(path.join(projectRoot, 'openspec', 'specs', 'project', 'roadmap.md'));
    // The "frontend" scope row should not be present (conditional in template)
    expect(content).not.toContain('UI components + State + API integration');
  });
});

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import path from 'node:path';
import {
  createTempDir,
  cleanupTempDirs,
  buildInitConfig,
  buildAddConfig,
  readText,
  fileExists,
} from './helpers/setup.js';
import { initAgent } from '../src/agents/init.agent.js';
import { addAgent } from '../src/agents/add.agent.js';
import { readConfig } from '../src/core/config.js';

/**
 * Workspace update validation — when a service is added via `darkhorse-dotnet add`,
 * workspace-level files should be updated to reflect the new service.
 */

describe('workspace updates after `add api`', () => {
  let projectRoot: string;
  const ns = 'TestCompany.OrderApi';

  beforeAll(async () => {
    const tmpDir = await createTempDir('dh-ws-update-');
    const initConfig = buildInitConfig({ outputDir: tmpDir, name: 'ws-update-test' });
    await initAgent(initConfig);
    projectRoot = initConfig.paths.root;

    const projectConfig = await readConfig(projectRoot);
    const serviceConfig = buildAddConfig({
      archetype: 'api',
      name: 'order-api',
      namespace: ns,
      projectRoot,
    }, projectConfig);
    await addAgent(serviceConfig);
  });

  afterAll(cleanupTempDirs);

  // ---- .darkhorse.yaml ----

  describe('.darkhorse.yaml', () => {
    it('exists after add', async () => {
      expect(await fileExists(path.join(projectRoot, '.darkhorse.yaml'))).toBe(true);
    });

    it('still contains workspace-level config', async () => {
      const content = await readText(path.join(projectRoot, '.darkhorse.yaml'));
      expect(content).toContain('name: ws-update-test');
    });
  });

  // ---- Service was created in correct location ----

  it('service exists at backend/apis/order-api/', async () => {
    expect(await fileExists(path.join(projectRoot, 'backend', 'apis', 'order-api'))).toBe(true);
  });

  it('service has solution file', async () => {
    expect(await fileExists(path.join(projectRoot, 'backend', 'apis', 'order-api', `${ns}.sln`))).toBe(true);
  });

  // ---- Workspace-level context files remain intact and coherent ----

  describe('context files survive add without corruption', () => {
    it('00-START-HERE.md still contains workspace name', async () => {
      const content = await readText(path.join(projectRoot, 'context', '00-START-HERE.md'));
      expect(content).toContain('ws-update-test');
      expect(content).toContain('DDD');
      expect(content).toContain('Onion Architecture');
      expect(content).toContain('backend/');
    });

    it('10-REPO-MAP.md still describes workspace structure', async () => {
      const content = await readText(path.join(projectRoot, 'context', '10-REPO-MAP.md'));
      expect(content).toContain('ws-update-test');
      expect(content).toContain('backend/');
    });

    it('30-BOUNDED-CONTEXTS.md still exists with valid content', async () => {
      const content = await readText(path.join(projectRoot, 'context', '30-BOUNDED-CONTEXTS.md'));
      expect(content).toContain('Bounded Contexts');
      expect(content.length).toBeGreaterThan(100);
    });

    it('50-SEARCH-QUERIES.md still exists with valid content', async () => {
      const content = await readText(path.join(projectRoot, 'context', '50-SEARCH-QUERIES.md'));
      expect(content.length).toBeGreaterThan(100);
    });
  });

  // ---- OpenSpec files remain intact ----

  describe('OpenSpec files survive add without corruption', () => {
    it('AGENTS.md still contains project name', async () => {
      const content = await readText(path.join(projectRoot, 'openspec', 'AGENTS.md'));
      expect(content).toContain('ws-update-test');
      expect(content).toContain('darkhorse-dotnet add api');
    });

    it('roadmap.md still exists and has valid MVP content', async () => {
      const content = await readText(path.join(projectRoot, 'openspec', 'specs', 'project', 'roadmap.md'));
      expect(content).toContain('REQ-');
      expect(content).toContain('MVP 1.0');
    });
  });
});

// ---------------------------------------------------------------------------
// Multiple services in one workspace
// ---------------------------------------------------------------------------

describe('workspace with multiple services', () => {
  let projectRoot: string;

  beforeAll(async () => {
    const tmpDir = await createTempDir('dh-multi-svc-');
    const initConfig = buildInitConfig({ outputDir: tmpDir, name: 'multi-svc-test' });
    await initAgent(initConfig);
    projectRoot = initConfig.paths.root;

    const projectConfig = await readConfig(projectRoot);

    // Add an API service
    const apiConfig = buildAddConfig({
      archetype: 'api',
      name: 'order-api',
      namespace: 'MultiSvc.Orders',
      projectRoot,
    }, projectConfig);
    await addAgent(apiConfig);

    // Add a BFF service
    const bffConfig = buildAddConfig({
      archetype: 'bff-api',
      name: 'web-bff',
      namespace: 'MultiSvc.WebGateway',
      projectRoot,
    }, projectConfig);
    await addAgent(bffConfig);

    // Add a microservice
    const msConfig = buildAddConfig({
      archetype: 'microservice',
      name: 'payment-processor',
      namespace: 'MultiSvc.Payments',
      projectRoot,
    }, projectConfig);
    await addAgent(msConfig);
  });

  afterAll(cleanupTempDirs);

  it('all three services exist in correct category directories', async () => {
    expect(await fileExists(path.join(projectRoot, 'backend', 'apis', 'order-api'))).toBe(true);
    expect(await fileExists(path.join(projectRoot, 'backend', 'bffs', 'web-bff'))).toBe(true);
    expect(await fileExists(path.join(projectRoot, 'backend', 'microservices', 'payment-processor'))).toBe(true);
  });

  it('each service has its own solution file', async () => {
    expect(await fileExists(path.join(projectRoot, 'backend', 'apis', 'order-api', 'MultiSvc.Orders.sln'))).toBe(true);
    expect(await fileExists(path.join(projectRoot, 'backend', 'bffs', 'web-bff', 'MultiSvc.WebGateway.sln'))).toBe(true);
    expect(await fileExists(path.join(projectRoot, 'backend', 'microservices', 'payment-processor', 'MultiSvc.Payments.sln'))).toBe(true);
  });

  it('services do not interfere with each other', async () => {
    // API should have EF Core, BFF should not
    const apiInfra = await readText(path.join(
      projectRoot, 'backend', 'apis', 'order-api',
      'src', 'MultiSvc.Orders.Infrastructure', 'MultiSvc.Orders.Infrastructure.csproj'
    ));
    expect(apiInfra).toContain('EntityFrameworkCore');

    const bffInfra = await readText(path.join(
      projectRoot, 'backend', 'bffs', 'web-bff',
      'src', 'MultiSvc.WebGateway.Infrastructure', 'MultiSvc.WebGateway.Infrastructure.csproj'
    ));
    expect(bffInfra).not.toContain('EntityFrameworkCore');
  });

  it('each service uses its own namespace', async () => {
    const orderSln = await readText(path.join(projectRoot, 'backend', 'apis', 'order-api', 'MultiSvc.Orders.sln'));
    expect(orderSln).toContain('MultiSvc.Orders');
    expect(orderSln).not.toContain('MultiSvc.WebGateway');

    const bffSln = await readText(path.join(projectRoot, 'backend', 'bffs', 'web-bff', 'MultiSvc.WebGateway.sln'));
    expect(bffSln).toContain('MultiSvc.WebGateway');
    expect(bffSln).not.toContain('MultiSvc.Orders');
  });
});

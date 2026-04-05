import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import {
  createTempDir,
  cleanupTempDirs,
  buildInitConfig,
  buildAddConfig,
  fileExists,
} from './helpers/setup.js';
import { initAgent } from '../src/agents/init.agent.js';
import { addAgent } from '../src/agents/add.agent.js';
import { readConfig } from '../src/core/config.js';

const execAsync = promisify(exec);

/**
 * .NET SDK smoke tests — verifies generated projects restore and build.
 *
 * These tests require `dotnet` CLI to be available on the PATH.
 * They are skipped if `dotnet` is not installed.
 */

let hasDotnet = false;

beforeAll(async () => {
  try {
    await execAsync('dotnet --version');
    hasDotnet = true;
  } catch {
    hasDotnet = false;
  }
});

// ---------------------------------------------------------------------------
// Helper: scaffold a full workspace + service
// ---------------------------------------------------------------------------

async function scaffoldService(archetype: 'api' | 'bff-api' | 'microservice', serviceName: string, ns: string) {
  const tmpDir = await createTempDir(`dh-smoke-${archetype}-`);
  const initConfig = buildInitConfig({ outputDir: tmpDir, name: `smoke-${archetype}` });
  await initAgent(initConfig);
  const projectConfig = await readConfig(initConfig.paths.root);

  const serviceConfig = buildAddConfig({
    archetype,
    name: serviceName,
    namespace: ns,
    dotnetVersion: 8,
    projectRoot: initConfig.paths.root,
  }, projectConfig);
  await addAgent(serviceConfig);

  const categories = { api: 'apis', 'bff-api': 'bffs', microservice: 'microservices' };
  const serviceRoot = path.join(initConfig.paths.root, 'backend', categories[archetype], serviceName);
  return { projectRoot: initConfig.paths.root, serviceRoot, ns };
}

// ---------------------------------------------------------------------------
// API archetype smoke test
// ---------------------------------------------------------------------------

describe('dotnet smoke: api', () => {
  let serviceRoot: string;
  let ns: string;

  beforeAll(async () => {
    const result = await scaffoldService('api', 'smoke-order-api', 'Smoke.OrderApi');
    serviceRoot = result.serviceRoot;
    ns = result.ns;
  });

  afterAll(cleanupTempDirs);

  it('solution file exists', async () => {
    expect(await fileExists(path.join(serviceRoot, `${ns}.sln`))).toBe(true);
  });

  it('all csproj files exist', async () => {
    for (const layer of ['Presentation', 'Application', 'Domain', 'Infrastructure']) {
      const csprojPath = path.join(serviceRoot, 'src', `${ns}.${layer}`, `${ns}.${layer}.csproj`);
      expect(await fileExists(csprojPath)).toBe(true);
    }
  });

  it('dotnet restore succeeds', async () => {
    if (!hasDotnet) return; // skip silently if no dotnet
    const slnPath = path.join(serviceRoot, `${ns}.sln`);
    const { stderr } = await execAsync(`dotnet restore "${slnPath}"`, { timeout: 120_000 });
    // Some warnings are OK, but no fatal errors
    expect(stderr).not.toContain('error NU');
  }, 120_000);

  it('dotnet build succeeds', async () => {
    if (!hasDotnet) return;
    const slnPath = path.join(serviceRoot, `${ns}.sln`);
    const { stderr } = await execAsync(`dotnet build "${slnPath}" --no-restore`, { timeout: 120_000 });
    expect(stderr).not.toContain('Build FAILED');
  }, 120_000);

  it('no broken project references', async () => {
    if (!hasDotnet) return;
    const slnPath = path.join(serviceRoot, `${ns}.sln`);
    try {
      await execAsync(`dotnet build "${slnPath}" --no-restore`, { timeout: 120_000 });
    } catch (err: unknown) {
      const stderr = (err as { stderr?: string }).stderr ?? '';
      expect(stderr).not.toContain('could not be found');
      expect(stderr).not.toContain('The project file could not be found');
    }
  }, 120_000);
});

// ---------------------------------------------------------------------------
// BFF-API archetype smoke test
// ---------------------------------------------------------------------------

describe('dotnet smoke: bff-api', () => {
  let serviceRoot: string;
  let ns: string;

  beforeAll(async () => {
    const result = await scaffoldService('bff-api', 'smoke-web-bff', 'Smoke.WebBff');
    serviceRoot = result.serviceRoot;
    ns = result.ns;
  });

  afterAll(cleanupTempDirs);

  it('solution file exists', async () => {
    expect(await fileExists(path.join(serviceRoot, `${ns}.sln`))).toBe(true);
  });

  it('dotnet restore succeeds', async () => {
    if (!hasDotnet) return;
    const slnPath = path.join(serviceRoot, `${ns}.sln`);
    const { stderr } = await execAsync(`dotnet restore "${slnPath}"`, { timeout: 120_000 });
    expect(stderr).not.toContain('error NU');
  }, 120_000);

  it('dotnet build succeeds', async () => {
    if (!hasDotnet) return;
    const slnPath = path.join(serviceRoot, `${ns}.sln`);
    const { stderr } = await execAsync(`dotnet build "${slnPath}" --no-restore`, { timeout: 120_000 });
    expect(stderr).not.toContain('Build FAILED');
  }, 120_000);

  it('no invalid namespace references', async () => {
    if (!hasDotnet) return;
    const slnPath = path.join(serviceRoot, `${ns}.sln`);
    try {
      await execAsync(`dotnet build "${slnPath}" --no-restore`, { timeout: 120_000 });
    } catch (err: unknown) {
      const stderr = (err as { stderr?: string }).stderr ?? '';
      expect(stderr).not.toContain('are you missing a using directive');
    }
  }, 120_000);
});

// ---------------------------------------------------------------------------
// Microservice archetype smoke test
// ---------------------------------------------------------------------------

describe('dotnet smoke: microservice', () => {
  let serviceRoot: string;
  let ns: string;

  beforeAll(async () => {
    const result = await scaffoldService('microservice', 'smoke-payment-ms', 'Smoke.PaymentMs');
    serviceRoot = result.serviceRoot;
    ns = result.ns;
  });

  afterAll(cleanupTempDirs);

  it('solution file exists', async () => {
    expect(await fileExists(path.join(serviceRoot, `${ns}.sln`))).toBe(true);
  });

  it('dotnet restore succeeds', async () => {
    if (!hasDotnet) return;
    const slnPath = path.join(serviceRoot, `${ns}.sln`);
    const { stderr } = await execAsync(`dotnet restore "${slnPath}"`, { timeout: 120_000 });
    expect(stderr).not.toContain('error NU');
  }, 120_000);

  it('dotnet build succeeds', async () => {
    if (!hasDotnet) return;
    const slnPath = path.join(serviceRoot, `${ns}.sln`);
    const { stderr } = await execAsync(`dotnet build "${slnPath}" --no-restore`, { timeout: 120_000 });
    expect(stderr).not.toContain('Build FAILED');
  }, 120_000);

  it('no broken project references', async () => {
    if (!hasDotnet) return;
    const slnPath = path.join(serviceRoot, `${ns}.sln`);
    try {
      await execAsync(`dotnet build "${slnPath}" --no-restore`, { timeout: 120_000 });
    } catch (err: unknown) {
      const stderr = (err as { stderr?: string }).stderr ?? '';
      expect(stderr).not.toContain('could not be found');
    }
  }, 120_000);
});

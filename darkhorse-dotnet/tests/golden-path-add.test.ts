import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import path from 'node:path';
import {
  createTempDir,
  cleanupTempDirs,
  buildInitConfig,
  buildAddConfig,
  fileExists,
  readText,
  getRelativeFiles,
} from './helpers/setup.js';
import { initAgent } from '../src/agents/init.agent.js';
import { addAgent } from '../src/agents/add.agent.js';
import { readConfig } from '../src/core/config.js';

// ---------------------------------------------------------------------------
// Shared: each add test needs a pre-initialized workspace
// ---------------------------------------------------------------------------

async function initWorkspace(tmpDir: string): Promise<{ projectRoot: string; projectConfig: ReturnType<typeof buildInitConfig> }> {
  const config = buildInitConfig({ outputDir: tmpDir, name: 'add-test-project' });
  await initAgent(config);
  const projectConfig = await readConfig(config.paths.root);
  return { projectRoot: config.paths.root, projectConfig };
}

// ---------------------------------------------------------------------------
// Golden path: `darkhorse-dotnet add api`
// ---------------------------------------------------------------------------

describe('add api', () => {
  let projectRoot: string;
  let serviceRoot: string;
  let files: string[];
  const ns = 'TestCompany.OrderApi';

  beforeAll(async () => {
    const tmpDir = await createTempDir('dh-add-api-');
    const { projectRoot: root, projectConfig } = await initWorkspace(tmpDir);
    projectRoot = root;

    const serviceConfig = buildAddConfig({
      archetype: 'api',
      name: 'order-api',
      namespace: ns,
      projectRoot,
    }, projectConfig);
    await addAgent(serviceConfig);

    serviceRoot = path.join(projectRoot, 'backend', 'apis', 'order-api');
    files = await getRelativeFiles(serviceRoot);
  });

  afterAll(cleanupTempDirs);

  // ---- Expected folder structure ----

  it('creates service root at backend/apis/order-api/', async () => {
    expect(await fileExists(serviceRoot)).toBe(true);
  });

  it('creates solution file', () => {
    expect(files).toContain(`${ns}.sln`);
  });

  it('creates all 4 layer .csproj files', () => {
    expect(files).toContain(`src/${ns}.Presentation/${ns}.Presentation.csproj`);
    expect(files).toContain(`src/${ns}.Application/${ns}.Application.csproj`);
    expect(files).toContain(`src/${ns}.Domain/${ns}.Domain.csproj`);
    expect(files).toContain(`src/${ns}.Infrastructure/${ns}.Infrastructure.csproj`);
  });

  it('creates test .csproj files', () => {
    expect(files).toContain(`tests/${ns}.UnitTests/${ns}.UnitTests.csproj`);
    expect(files).toContain(`tests/${ns}.IntegrationTests/${ns}.IntegrationTests.csproj`);
  });

  it('creates CQRS example files', () => {
    expect(files).toContain(`src/${ns}.Application/Examples/ExampleCommandHandler.cs`);
    expect(files).toContain(`src/${ns}.Application/Examples/ExampleQueryHandler.cs`);
  });

  it('creates Persistence directory (api owns data)', async () => {
    expect(await fileExists(path.join(serviceRoot, 'src', `${ns}.Infrastructure`, 'Persistence'))).toBe(true);
  });

  it('creates bounded context placeholder directories', async () => {
    for (const layer of ['Domain', 'Application', 'Infrastructure', 'Presentation']) {
      expect(await fileExists(path.join(serviceRoot, 'src', `${ns}.${layer}`, 'Contexts'))).toBe(true);
    }
  });

  // ---- Template rendering correctness ----

  it('solution file references all projects', async () => {
    const slnContent = await readText(path.join(serviceRoot, `${ns}.sln`));
    expect(slnContent).toContain(`${ns}.Presentation`);
    expect(slnContent).toContain(`${ns}.Application`);
    expect(slnContent).toContain(`${ns}.Domain`);
    expect(slnContent).toContain(`${ns}.Infrastructure`);
    expect(slnContent).toContain(`${ns}.UnitTests`);
    expect(slnContent).toContain(`${ns}.IntegrationTests`);
  });

  it('solution file references workspace Contracts project', async () => {
    const slnContent = await readText(path.join(serviceRoot, `${ns}.sln`));
    expect(slnContent).toContain('AddTestProject.Contracts');
    expect(slnContent).toContain('../../shared/AddTestProject.Contracts/AddTestProject.Contracts.csproj');
  });

  it('does NOT scaffold per-service Common project', async () => {
    expect(files.some((f) => f.includes('.Common'))).toBe(false);
  });

  it('Infrastructure.csproj contains EF Core packages (api owns data)', async () => {
    const content = await readText(path.join(serviceRoot, 'src', `${ns}.Infrastructure`, `${ns}.Infrastructure.csproj`));
    expect(content).toContain('Microsoft.EntityFrameworkCore');
    expect(content).toContain('Npgsql.EntityFrameworkCore.PostgreSQL');
  });

  it('Domain.csproj has zero dependencies', async () => {
    const content = await readText(path.join(serviceRoot, 'src', `${ns}.Domain`, `${ns}.Domain.csproj`));
    expect(content).not.toContain('<ProjectReference');
    expect(content).not.toContain('<PackageReference');
  });

  it('Presentation.csproj references Application and Infrastructure', async () => {
    const content = await readText(path.join(serviceRoot, 'src', `${ns}.Presentation`, `${ns}.Presentation.csproj`));
    expect(content).toContain(`${ns}.Application.csproj`);
    expect(content).toContain(`${ns}.Infrastructure.csproj`);
  });

  it('.csproj files target correct .NET version', async () => {
    const content = await readText(path.join(serviceRoot, 'src', `${ns}.Presentation`, `${ns}.Presentation.csproj`));
    expect(content).toContain('<TargetFramework>net8.0</TargetFramework>');
  });

  it('example command handler is API-style (repository + persist)', async () => {
    const content = await readText(path.join(serviceRoot, 'src', `${ns}.Application`, 'Examples', 'ExampleCommandHandler.cs'));
    expect(content).toContain(`namespace ${ns}.Application.Examples`);
    expect(content).toContain('_orderRepository');
    expect(content).toContain('Persist');
  });

  it('example query handler is API-style (repository query)', async () => {
    const content = await readText(path.join(serviceRoot, 'src', `${ns}.Application`, 'Examples', 'ExampleQueryHandler.cs'));
    expect(content).toContain('_orderRepository');
    expect(content).toContain('repository');
  });

  // ---- Forbidden dependencies ----

  it('API does NOT have MassTransit in Infrastructure.csproj', async () => {
    const content = await readText(path.join(serviceRoot, 'src', `${ns}.Infrastructure`, `${ns}.Infrastructure.csproj`));
    expect(content).not.toContain('MassTransit');
  });

  // ---- Domain model starter files ----

  it('creates domain model example files (aggregate, repo interface, value object)', () => {
    expect(files).toContain(`src/${ns}.Domain/Examples/ExampleAggregate.cs`);
    expect(files).toContain(`src/${ns}.Domain/Examples/IExampleRepository.cs`);
    expect(files).toContain(`src/${ns}.Domain/Examples/ExampleValueObject.cs`);
  });

  it('domain aggregate uses factory method and domain events', async () => {
    const content = await readText(path.join(serviceRoot, 'src', `${ns}.Domain`, 'Examples', 'ExampleAggregate.cs'));
    expect(content).toContain(`namespace ${ns}.Domain.Examples`);
    expect(content).toContain('Place(');
    expect(content).toContain('IDomainEvent');
    expect(content).toContain('DomainEvents');
  });

  it('domain repository interface is in Domain layer (zero infra dependencies)', async () => {
    const content = await readText(path.join(serviceRoot, 'src', `${ns}.Domain`, 'Examples', 'IExampleRepository.cs'));
    expect(content).toContain(`namespace ${ns}.Domain.Examples`);
    expect(content).toContain('interface IExampleRepository');
    expect(content).not.toContain('DbContext');
  });
});

// ---------------------------------------------------------------------------
// Golden path: `darkhorse-dotnet add bff-api`
// ---------------------------------------------------------------------------

describe('add bff-api', () => {
  let projectRoot: string;
  let serviceRoot: string;
  let files: string[];
  const ns = 'TestCompany.GatewayBff';

  beforeAll(async () => {
    const tmpDir = await createTempDir('dh-add-bff-');
    const { projectRoot: root, projectConfig } = await initWorkspace(tmpDir);
    projectRoot = root;

    const serviceConfig = buildAddConfig({
      archetype: 'bff-api',
      name: 'gateway-bff',
      namespace: ns,
      projectRoot,
    }, projectConfig);
    await addAgent(serviceConfig);

    serviceRoot = path.join(projectRoot, 'backend', 'bffs', 'gateway-bff');
    files = await getRelativeFiles(serviceRoot);
  });

  afterAll(cleanupTempDirs);

  it('creates service root at backend/bffs/gateway-bff/', async () => {
    expect(await fileExists(serviceRoot)).toBe(true);
  });

  it('creates all layer csproj and solution files', () => {
    expect(files).toContain(`${ns}.sln`);
    expect(files).toContain(`src/${ns}.Presentation/${ns}.Presentation.csproj`);
    expect(files).toContain(`src/${ns}.Application/${ns}.Application.csproj`);
    expect(files).toContain(`src/${ns}.Domain/${ns}.Domain.csproj`);
    expect(files).toContain(`src/${ns}.Infrastructure/${ns}.Infrastructure.csproj`);
  });

  it('creates Clients and Messaging directories (BFF routing)', async () => {
    expect(await fileExists(path.join(serviceRoot, 'src', `${ns}.Infrastructure`, 'Clients'))).toBe(true);
    expect(await fileExists(path.join(serviceRoot, 'src', `${ns}.Infrastructure`, 'Messaging'))).toBe(true);
  });

  it('does NOT create Persistence directory (BFF has no DB)', async () => {
    expect(await fileExists(path.join(serviceRoot, 'src', `${ns}.Infrastructure`, 'Persistence'))).toBe(false);
  });

  // ---- BFF specific dependencies ----

  it('Infrastructure.csproj does NOT contain EF Core', async () => {
    const content = await readText(path.join(serviceRoot, 'src', `${ns}.Infrastructure`, `${ns}.Infrastructure.csproj`));
    expect(content).not.toContain('Microsoft.EntityFrameworkCore');
    expect(content).not.toContain('Npgsql.EntityFrameworkCore');
  });

  it('Infrastructure.csproj contains HttpClient packages', async () => {
    const content = await readText(path.join(serviceRoot, 'src', `${ns}.Infrastructure`, `${ns}.Infrastructure.csproj`));
    expect(content).toContain('Microsoft.Extensions.Http');
  });

  it('Infrastructure.csproj contains MassTransit for message dispatch', async () => {
    const content = await readText(path.join(serviceRoot, 'src', `${ns}.Infrastructure`, `${ns}.Infrastructure.csproj`));
    expect(content).toContain('MassTransit');
  });

  it('Presentation.csproj contains JWT auth (BFF handles frontend auth)', async () => {
    const content = await readText(path.join(serviceRoot, 'src', `${ns}.Presentation`, `${ns}.Presentation.csproj`));
    expect(content).toContain('JwtBearer');
  });

  // ---- BFF example correctness ----

  it('example command dispatches to broker, NOT repository', async () => {
    const content = await readText(path.join(serviceRoot, 'src', `${ns}.Application`, 'Examples', 'ExampleCommandHandler.cs'));
    expect(content).toContain('_commandSender');
    expect(content).toContain('broker');
    expect(content).not.toContain('_orderRepository');
    expect(content).not.toContain('Persist');
  });

  it('example query calls downstream API, NOT repository', async () => {
    const content = await readText(path.join(serviceRoot, 'src', `${ns}.Application`, 'Examples', 'ExampleQueryHandler.cs'));
    expect(content).toContain('_orderApiClient');
    expect(content).toContain('downstream API');
    expect(content).not.toContain('_orderRepository');
  });
});

// ---------------------------------------------------------------------------
// Golden path: `darkhorse-dotnet add microservice`
// ---------------------------------------------------------------------------

describe('add microservice', () => {
  let projectRoot: string;
  let serviceRoot: string;
  let files: string[];
  const ns = 'TestCompany.OrderProcessor';

  beforeAll(async () => {
    const tmpDir = await createTempDir('dh-add-ms-');
    const { projectRoot: root, projectConfig } = await initWorkspace(tmpDir);
    projectRoot = root;

    const serviceConfig = buildAddConfig({
      archetype: 'microservice',
      name: 'order-processor',
      namespace: ns,
      projectRoot,
    }, projectConfig);
    await addAgent(serviceConfig);

    serviceRoot = path.join(projectRoot, 'backend', 'microservices', 'order-processor');
    files = await getRelativeFiles(serviceRoot);
  });

  afterAll(cleanupTempDirs);

  it('creates service root at backend/microservices/order-processor/', async () => {
    expect(await fileExists(serviceRoot)).toBe(true);
  });

  it('creates solution and all layer csproj files', () => {
    expect(files).toContain(`${ns}.sln`);
    for (const layer of ['Presentation', 'Application', 'Domain', 'Infrastructure']) {
      expect(files).toContain(`src/${ns}.${layer}/${ns}.${layer}.csproj`);
    }
  });

  it('creates Messaging and Events directories', async () => {
    expect(await fileExists(path.join(serviceRoot, 'src', `${ns}.Infrastructure`, 'Messaging'))).toBe(true);
    expect(await fileExists(path.join(serviceRoot, 'src', `${ns}.Infrastructure`, 'Events'))).toBe(true);
  });

  it('does NOT create Clients directory (microservice is not HTTP-first)', async () => {
    expect(await fileExists(path.join(serviceRoot, 'src', `${ns}.Infrastructure`, 'Clients'))).toBe(false);
  });

  // ---- Microservice specific dependencies ----

  it('Infrastructure.csproj contains both EF Core AND MassTransit', async () => {
    const content = await readText(path.join(serviceRoot, 'src', `${ns}.Infrastructure`, `${ns}.Infrastructure.csproj`));
    expect(content).toContain('Microsoft.EntityFrameworkCore');
    expect(content).toContain('MassTransit');
  });

  it('Presentation.csproj does NOT have Swagger by default', async () => {
    const content = await readText(path.join(serviceRoot, 'src', `${ns}.Presentation`, `${ns}.Presentation.csproj`));
    expect(content).not.toContain('Swashbuckle');
  });

  it('Presentation.csproj has health checks', async () => {
    const content = await readText(path.join(serviceRoot, 'src', `${ns}.Presentation`, `${ns}.Presentation.csproj`));
    expect(content).toContain('HealthChecks');
  });

  // ---- Microservice example correctness ----

  it('example command is message-triggered, NOT HTTP', async () => {
    const content = await readText(path.join(serviceRoot, 'src', `${ns}.Application`, 'Examples', 'ExampleCommandHandler.cs'));
    expect(content).toContain('inbound message');
    expect(content).toContain('MassTransit');
    expect(content).toContain('IConsumer');
  });

  it('example command persists via repository (microservice owns data)', async () => {
    const content = await readText(path.join(serviceRoot, 'src', `${ns}.Application`, 'Examples', 'ExampleCommandHandler.cs'));
    expect(content).toContain('_orderRepository');
    expect(content).toContain('integration event');
  });

  it('example query reads from local data store', async () => {
    const content = await readText(path.join(serviceRoot, 'src', `${ns}.Application`, 'Examples', 'ExampleQueryHandler.cs'));
    expect(content).toContain('_readRepository');
    expect(content).toContain('local');
    expect(content).not.toContain('_orderApiClient');
  });

  it('Domain.csproj has zero external dependencies', async () => {
    const content = await readText(path.join(serviceRoot, 'src', `${ns}.Domain`, `${ns}.Domain.csproj`));
    expect(content).not.toContain('<ProjectReference');
    expect(content).not.toContain('<PackageReference');
  });

  // ---- Domain model starter files ----

  it('creates domain model example files (aggregate + repo interface)', () => {
    expect(files).toContain(`src/${ns}.Domain/Examples/ExampleAggregate.cs`);
    expect(files).toContain(`src/${ns}.Domain/Examples/IExampleRepository.cs`);
  });

  it('microservice domain aggregate uses message-triggered factory method', async () => {
    const content = await readText(path.join(serviceRoot, 'src', `${ns}.Domain`, 'Examples', 'ExampleAggregate.cs'));
    expect(content).toContain(`namespace ${ns}.Domain.Examples`);
    expect(content).toContain('Process(');
    expect(content).toContain('IDomainEvent');
  });
});

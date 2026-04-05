import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import path from 'node:path';
import {
  createTempDir,
  cleanupTempDirs,
  buildInitConfig,
  buildAddConfig,
  readText,
  getRelativeFiles,
} from './helpers/setup.js';
import { initAgent } from '../src/agents/init.agent.js';
import { addAgent } from '../src/agents/add.agent.js';
import { readConfig } from '../src/core/config.js';

/**
 * Deep archetype validation — ensures generated services are structurally
 * and semantically correct for each archetype.
 *
 * These go beyond "file exists" to verify content correctness:
 * - Dependency graph matches architecture rules
 * - Namespace consistency across all files
 * - No cross-archetype contamination
 * - Onion architecture layers respected
 */

// ---------------------------------------------------------------------------
// API Archetype — full domain model, persistence, repository pattern
// ---------------------------------------------------------------------------

describe('archetype: api — detailed validation', () => {
  let serviceRoot: string;
  const ns = 'Acme.Inventory';

  beforeAll(async () => {
    const tmpDir = await createTempDir('dh-arch-api-');
    const initConfig = buildInitConfig({ outputDir: tmpDir, name: 'arch-api-test' });
    await initAgent(initConfig);
    const projectConfig = await readConfig(initConfig.paths.root);

    const serviceConfig = buildAddConfig({
      archetype: 'api',
      name: 'inventory-api',
      namespace: ns,
      dotnetVersion: 8,
      projectRoot: initConfig.paths.root,
    }, projectConfig);
    await addAgent(serviceConfig);

    serviceRoot = path.join(initConfig.paths.root, 'backend', 'apis', 'inventory-api');
  });

  afterAll(cleanupTempDirs);

  // ---- Onion layer dependency validation ----

  it('Application.csproj depends on Domain + workspace Contracts (no Infrastructure)', async () => {
    const content = await readText(path.join(serviceRoot, 'src', `${ns}.Application`, `${ns}.Application.csproj`));
    expect(content).toContain(`${ns}.Domain.csproj`);
    expect(content).toContain('Contracts.csproj');
    expect(content).not.toContain(`${ns}.Infrastructure`);
    expect(content).not.toContain(`${ns}.Presentation`);
  });

  it('Infrastructure.csproj depends on Application + Domain + workspace Contracts', async () => {
    const content = await readText(path.join(serviceRoot, 'src', `${ns}.Infrastructure`, `${ns}.Infrastructure.csproj`));
    expect(content).toContain(`${ns}.Application.csproj`);
    expect(content).toContain(`${ns}.Domain.csproj`);
    expect(content).toContain('Contracts.csproj');
    expect(content).not.toContain(`${ns}.Presentation`);
  });

  it('Presentation.csproj depends on Application + Infrastructure (NOT Domain, NOT Contracts directly)', async () => {
    const content = await readText(path.join(serviceRoot, 'src', `${ns}.Presentation`, `${ns}.Presentation.csproj`));
    expect(content).toContain(`${ns}.Application.csproj`);
    expect(content).toContain(`${ns}.Infrastructure.csproj`);
    // Presentation does NOT directly reference Domain or Contracts (transitive)
    expect(content).not.toContain(`${ns}.Domain.csproj`);
    expect(content).not.toContain('Contracts.csproj');
  });

  // ---- EF Core (API owns its data) ----

  it('has EF Core + PostgreSQL driver + EF Tools', async () => {
    const content = await readText(path.join(serviceRoot, 'src', `${ns}.Infrastructure`, `${ns}.Infrastructure.csproj`));
    expect(content).toContain('Microsoft.EntityFrameworkCore');
    expect(content).toContain('Npgsql.EntityFrameworkCore.PostgreSQL');
    expect(content).toContain('Microsoft.EntityFrameworkCore.Tools');
  });

  // ---- Repository pattern indicators ----

  it('example command handler references repository injection', async () => {
    const content = await readText(path.join(serviceRoot, 'src', `${ns}.Application`, 'Examples', 'ExampleCommandHandler.cs'));
    expect(content).toContain('IOrderRepository');
  });

  it('example command handler references domain event publishing', async () => {
    const content = await readText(path.join(serviceRoot, 'src', `${ns}.Application`, 'Examples', 'ExampleCommandHandler.cs'));
    expect(content).toContain('IDomainEventPublisher');
    expect(content).toContain('OrderPlacedEvent');
  });

  // ---- Namespace consistency ----

  it('all .cs files use correct namespace', async () => {
    const files = await getRelativeFiles(serviceRoot);
    const csFiles = files.filter((f) => f.endsWith('.cs') && !f.endsWith('Program.cs'));
    for (const csFile of csFiles) {
      const content = await readText(path.join(serviceRoot, csFile));
      expect(content).toContain(`namespace ${ns}.`);
    }
  });

  // ---- Application layer packages ----

  it('Application.csproj has MediatR (CQRS dispatch)', async () => {
    const content = await readText(path.join(serviceRoot, 'src', `${ns}.Application`, `${ns}.Application.csproj`));
    expect(content).toContain('MediatR');
  });

  it('Application.csproj has FluentValidation', async () => {
    const content = await readText(path.join(serviceRoot, 'src', `${ns}.Application`, `${ns}.Application.csproj`));
    expect(content).toContain('FluentValidation');
  });

  // ---- Presentation layer packages ----

  it('Presentation.csproj has Swagger (API has HTTP endpoints)', async () => {
    const content = await readText(path.join(serviceRoot, 'src', `${ns}.Presentation`, `${ns}.Presentation.csproj`));
    expect(content).toContain('Swashbuckle.AspNetCore');
  });

  it('Presentation.csproj has Serilog', async () => {
    const content = await readText(path.join(serviceRoot, 'src', `${ns}.Presentation`, `${ns}.Presentation.csproj`));
    expect(content).toContain('Serilog.AspNetCore');
  });

  // ---- Full domain model starter files ----

  it('has domain aggregate example with factory method and domain events', async () => {
    const content = await readText(path.join(serviceRoot, 'src', `${ns}.Domain`, 'Examples', 'ExampleAggregate.cs'));
    expect(content).toContain(`namespace ${ns}.Domain.Examples`);
    expect(content).toContain('Aggregate Root');
    expect(content).toContain('Place(');
    expect(content).toContain('IDomainEvent');
    expect(content).toContain('ExamplePlacedEvent');
    expect(content).toContain('DomainEvents');
  });

  it('has domain repository interface example in Domain layer', async () => {
    const content = await readText(path.join(serviceRoot, 'src', `${ns}.Domain`, 'Examples', 'IExampleRepository.cs'));
    expect(content).toContain(`namespace ${ns}.Domain.Examples`);
    expect(content).toContain('interface IExampleRepository');
    expect(content).toContain('SaveAsync');
    expect(content).toContain('FindByIdAsync');
    expect(content).not.toContain('DbContext');
    expect(content).not.toContain('EntityFrameworkCore');
  });

  it('has domain value object example', async () => {
    const content = await readText(path.join(serviceRoot, 'src', `${ns}.Domain`, 'Examples', 'ExampleValueObject.cs'));
    expect(content).toContain(`namespace ${ns}.Domain.Examples`);
    expect(content).toContain('record ExampleValueObject');
    expect(content).toContain('immutable');
  });

  it('domain examples do not reference EF Core or persistence', async () => {
    const domainExampleDir = path.join(serviceRoot, 'src', `${ns}.Domain`, 'Examples');
    const files = await getRelativeFiles(domainExampleDir);
    for (const file of files) {
      const content = await readText(path.join(domainExampleDir, file));
      expect(content).not.toContain('EntityFrameworkCore');
      expect(content).not.toContain('DbContext');
      expect(content).not.toContain('DbSet');
    }
  });
});

// ---------------------------------------------------------------------------
// BFF-API Archetype — routing layer, no persistence
// ---------------------------------------------------------------------------

describe('archetype: bff-api — detailed validation', () => {
  let serviceRoot: string;
  const ns = 'Acme.WebGateway';

  beforeAll(async () => {
    const tmpDir = await createTempDir('dh-arch-bff-');
    const initConfig = buildInitConfig({ outputDir: tmpDir, name: 'arch-bff-test' });
    await initAgent(initConfig);
    const projectConfig = await readConfig(initConfig.paths.root);

    const serviceConfig = buildAddConfig({
      archetype: 'bff-api',
      name: 'web-gateway',
      namespace: ns,
      projectRoot: initConfig.paths.root,
    }, projectConfig);
    await addAgent(serviceConfig);

    serviceRoot = path.join(initConfig.paths.root, 'backend', 'bffs', 'web-gateway');
  });

  afterAll(cleanupTempDirs);

  // ---- NO persistence anywhere ----

  it('Infrastructure.csproj has zero EF Core or DB packages', async () => {
    const content = await readText(path.join(serviceRoot, 'src', `${ns}.Infrastructure`, `${ns}.Infrastructure.csproj`));
    expect(content).not.toContain('EntityFrameworkCore');
    expect(content).not.toContain('Npgsql');
    expect(content).not.toContain('SqlServer');
    expect(content).not.toContain('MongoDB');
  });

  // ---- API client abstractions present ----

  it('example query handler references API client interface', async () => {
    const content = await readText(path.join(serviceRoot, 'src', `${ns}.Application`, 'Examples', 'ExampleQueryHandler.cs'));
    expect(content).toContain('IOrderApiClient');
  });

  // ---- Message sender abstractions present ----

  it('example command handler references message sender interface', async () => {
    const content = await readText(path.join(serviceRoot, 'src', `${ns}.Application`, 'Examples', 'ExampleCommandHandler.cs'));
    expect(content).toContain('IOrderCommandSender');
  });

  // ---- Query → API client flow ----

  it('query handler demonstrates API client call pattern', async () => {
    const content = await readText(path.join(serviceRoot, 'src', `${ns}.Application`, 'Examples', 'ExampleQueryHandler.cs'));
    expect(content).toContain('GetByIdAsync');
    expect(content).toContain('anti-corruption layer');
  });

  // ---- Command → broker flow ----

  it('command handler demonstrates broker dispatch pattern', async () => {
    const content = await readText(path.join(serviceRoot, 'src', `${ns}.Application`, 'Examples', 'ExampleCommandHandler.cs'));
    expect(content).toContain('SendAsync');
    expect(content).toContain('CorrelationId');
  });

  // ---- Infrastructure has HTTP + MassTransit ----

  it('Infrastructure.csproj has HttpClient packages for API calls', async () => {
    const content = await readText(path.join(serviceRoot, 'src', `${ns}.Infrastructure`, `${ns}.Infrastructure.csproj`));
    expect(content).toContain('Microsoft.Extensions.Http');
    expect(content).toContain('Microsoft.Extensions.Http.Polly');
  });

  it('Infrastructure.csproj has MassTransit for message dispatch', async () => {
    const content = await readText(path.join(serviceRoot, 'src', `${ns}.Infrastructure`, `${ns}.Infrastructure.csproj`));
    expect(content).toContain('MassTransit');
    expect(content).toContain('MassTransit.RabbitMQ');
  });

  // ---- BFF-specific Presentation features ----

  it('Presentation.csproj has JWT bearer auth', async () => {
    const content = await readText(path.join(serviceRoot, 'src', `${ns}.Presentation`, `${ns}.Presentation.csproj`));
    expect(content).toContain('Microsoft.AspNetCore.Authentication.JwtBearer');
  });

  // ---- Domain is contracts only ----

  it('Domain.csproj comment indicates interfaces and contracts only', async () => {
    const content = await readText(path.join(serviceRoot, 'src', `${ns}.Domain`, `${ns}.Domain.csproj`));
    expect(content).toContain('Interfaces and contracts ONLY');
    expect(content).toContain('No entities');
  });

  // ---- NO repository files in examples ----

  it('NO repository references in any example file', async () => {
    const files = await getRelativeFiles(serviceRoot);
    const exampleFiles = files.filter((f) => f.includes('Examples/') && f.endsWith('.cs'));
    for (const exFile of exampleFiles) {
      const content = await readText(path.join(serviceRoot, exFile));
      expect(content).not.toContain('IOrderRepository');
      expect(content).not.toContain('_orderRepository');
    }
  });
});

// ---------------------------------------------------------------------------
// Microservice Archetype — message-driven, event sourcing, owns data
// ---------------------------------------------------------------------------

describe('archetype: microservice — detailed validation', () => {
  let serviceRoot: string;
  const ns = 'Acme.PaymentProcessor';

  beforeAll(async () => {
    const tmpDir = await createTempDir('dh-arch-ms-');
    const initConfig = buildInitConfig({ outputDir: tmpDir, name: 'arch-ms-test' });
    await initAgent(initConfig);
    const projectConfig = await readConfig(initConfig.paths.root);

    const serviceConfig = buildAddConfig({
      archetype: 'microservice',
      name: 'payment-processor',
      namespace: ns,
      projectRoot: initConfig.paths.root,
    }, projectConfig);
    await addAgent(serviceConfig);

    serviceRoot = path.join(initConfig.paths.root, 'backend', 'microservices', 'payment-processor');
  });

  afterAll(cleanupTempDirs);

  // ---- MassTransit consumer scaffolding ----

  it('example command handler is triggered by MassTransit message', async () => {
    const content = await readText(path.join(serviceRoot, 'src', `${ns}.Application`, 'Examples', 'ExampleCommandHandler.cs'));
    expect(content).toContain('MassTransit consumer');
    expect(content).toContain('IConsumer');
    expect(content).toContain('PlaceOrderMessage');
  });

  // ---- Event publishing scaffolding ----

  it('example command handler publishes integration events', async () => {
    const content = await readText(path.join(serviceRoot, 'src', `${ns}.Application`, 'Examples', 'ExampleCommandHandler.cs'));
    expect(content).toContain('IIntegrationEventPublisher');
    expect(content).toContain('OrderPlacedIntegrationEvent');
  });

  // ---- NO HTTP-first controller assumptions ----

  it('Presentation.csproj does NOT have Swagger/OpenAPI', async () => {
    const content = await readText(path.join(serviceRoot, 'src', `${ns}.Presentation`, `${ns}.Presentation.csproj`));
    expect(content).not.toContain('Swashbuckle');
    expect(content).not.toContain('OpenApi');
  });

  it('Presentation.csproj comment indicates not HTTP-first', async () => {
    const content = await readText(path.join(serviceRoot, 'src', `${ns}.Presentation`, `${ns}.Presentation.csproj`));
    expect(content).toContain('NOT HTTP-first');
  });

  // ---- Microservice owns its data ----

  it('Infrastructure.csproj has EF Core for data ownership', async () => {
    const content = await readText(path.join(serviceRoot, 'src', `${ns}.Infrastructure`, `${ns}.Infrastructure.csproj`));
    expect(content).toContain('Microsoft.EntityFrameworkCore');
  });

  it('Infrastructure.csproj has MassTransit (primary interface)', async () => {
    const content = await readText(path.join(serviceRoot, 'src', `${ns}.Infrastructure`, `${ns}.Infrastructure.csproj`));
    expect(content).toContain('MassTransit');
    expect(content).toContain('MassTransit.RabbitMQ');
  });

  // ---- No REST client dependency ----

  it('Infrastructure.csproj does NOT have HTTP client packages', async () => {
    const content = await readText(path.join(serviceRoot, 'src', `${ns}.Infrastructure`, `${ns}.Infrastructure.csproj`));
    expect(content).not.toContain('Microsoft.Extensions.Http');
  });

  // ---- Query reads from local store, not API ----

  it('example query reads from local data store', async () => {
    const content = await readText(path.join(serviceRoot, 'src', `${ns}.Application`, 'Examples', 'ExampleQueryHandler.cs'));
    expect(content).toContain('local');
    expect(content).toContain('_readRepository');
    expect(content).not.toContain('_orderApiClient');
  });

  // ---- Command NOT triggered by HTTP ----

  it('example command explicitly states NOT triggered by HTTP', async () => {
    const content = await readText(path.join(serviceRoot, 'src', `${ns}.Application`, 'Examples', 'ExampleCommandHandler.cs'));
    expect(content).toContain('NOT triggered by: HTTP endpoint');
  });

  // ---- Full domain model starter files ----

  it('has domain aggregate example for microservice (message-triggered)', async () => {
    const content = await readText(path.join(serviceRoot, 'src', `${ns}.Domain`, 'Examples', 'ExampleAggregate.cs'));
    expect(content).toContain(`namespace ${ns}.Domain.Examples`);
    expect(content).toContain('Aggregate Root');
    expect(content).toContain('Process(');
    expect(content).toContain('IDomainEvent');
    expect(content).toContain('ExampleProcessingStartedEvent');
  });

  it('has domain repository interface example in Domain layer', async () => {
    const content = await readText(path.join(serviceRoot, 'src', `${ns}.Domain`, 'Examples', 'IExampleRepository.cs'));
    expect(content).toContain(`namespace ${ns}.Domain.Examples`);
    expect(content).toContain('interface IExampleRepository');
    expect(content).toContain('SaveAsync');
    expect(content).toContain('FindByIdAsync');
  });

  it('microservice domain examples do not reference EF Core or HTTP', async () => {
    const domainExampleDir = path.join(serviceRoot, 'src', `${ns}.Domain`, 'Examples');
    const files = await getRelativeFiles(domainExampleDir);
    for (const file of files) {
      const content = await readText(path.join(domainExampleDir, file));
      expect(content).not.toContain('EntityFrameworkCore');
      expect(content).not.toContain('HttpClient');
      expect(content).not.toContain('Controller');
    }
  });
});

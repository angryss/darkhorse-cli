# Archetype Rules (v1.0)

**Defines the three project archetypes and their architectural constraints.**

> Every DarkHorse project is one of: `api`, `bff-api`, or `microservice`. The archetype determines which layers exist, what dependencies are allowed, and how CQRS routes.

---

## Archetypes Overview

| Archetype | Purpose | HTTP? | Persistence? | Messaging? |
|-----------|---------|-------|-------------|------------|
| **api** | Standard REST service with persistence | ✅ Primary | ✅ Owns data | Optional |
| **bff-api** | Backend-for-Frontend routing layer | ✅ Primary | ❌ Forbidden | ✅ Commands via broker |
| **microservice** | Message-driven service | ❌ Not primary | ✅ Owns data | ✅ Primary |

---

## Archetype 1: API

### Purpose

A standard REST API that owns its domain, persists its data, and exposes HTTP endpoints.

### Layer Behavior

| Layer | Behavior |
|-------|----------|
| **Presentation** | ASP.NET Core controllers, request/response models, FluentValidation |
| **Application** | Command handlers persist via repositories. Query handlers read from repositories. MediatR dispatches. |
| **Domain** | Full domain model: entities, value objects, aggregates, domain events, repository interfaces |
| **Infrastructure** | Repository implementations (EF Core), DbContext, database config, optional messaging |

### CQRS Routing

```
HTTP Request
  → Controller (Presentation)
    → IMediator.Send(command) → Command Handler (Application) → Repository → Database
    → IMediator.Send(query)   → Query Handler (Application) → Repository → Database
```

### Allowed Dependencies

- ASP.NET Core (web framework)
- EF Core + Npgsql (PostgreSQL persistence)
- MediatR (CQRS dispatch)
- FluentValidation (request validation)
- AutoMapper (DTO mapping)
- Serilog (structured logging)
- Swashbuckle (Swagger/OpenAPI)
- MassTransit (optional, for publishing integration events)

### Folder Structure

```
backend/src/
├── Namespace.Domain/Contexts/<Context>/
│   ├── Entities/            ← Aggregates, entities
│   ├── ValueObjects/        ← Immutable value types
│   ├── Events/              ← Domain events
│   ├── Exceptions/          ← Domain-specific exceptions
│   ├── Interfaces/          ← Repository interfaces (IOrderRepository)
│   └── GLOSSARY.md
├── Namespace.Application/Contexts/<Context>/
│   ├── Commands/            ← Command handlers (write path)
│   ├── Queries/             ← Query handlers (read path)
│   ├── DTOs/                ← Data transfer objects
│   └── Validators/          ← FluentValidation validators
├── Namespace.Infrastructure/Contexts/<Context>/
│   ├── Repositories/        ← EF Core repository implementations
│   └── EntityConfigurations/ ← EF Core entity type configs
├── Namespace.Infrastructure/Persistence/
│   └── AppDbContext.cs       ← EF Core DbContext
└── Namespace.Presentation/Contexts/<Context>/
    └── Controllers/          ← REST endpoints ([ApiController])
```

---

## Archetype 2: BFF-API (Backend-for-Frontend)

### Purpose

A routing and aggregation layer between a frontend and downstream backend services. The BFF does NOT own data, does NOT execute domain logic, and does NOT persist anything.

### Core Principle

> The BFF is a **thin orchestration layer**. It validates inbound requests, routes queries to downstream APIs, and dispatches commands to a message broker. All business logic lives in downstream services.

### Layer Behavior

| Layer | Behavior |
|-------|----------|
| **Presentation** | ASP.NET Core controllers, JWT authentication, claims/permissions enforcement |
| **Application** | Strict CQRS routing: queries → downstream API clients (HttpClient), commands → broker (MassTransit). **No repository or persistence logic.** |
| **Domain** | Interfaces and contracts ONLY. No business execution logic. Defines API client interfaces and message sender interfaces. |
| **Infrastructure** | Typed HttpClient implementations (Polly resilience), MassTransit message sender implementations |

### CQRS Routing

```
HTTP Request (from frontend)
  → Controller (Presentation — JWT auth, claims, permissions)
    → IMediator.Send(query) → Query Handler (Application) → IApiClient (Infrastructure/Clients) → Downstream API
    → IMediator.Send(command) → Command Handler (Application) → IMessageSender (Infrastructure/Messaging) → Broker
```

### What BFF Does

- ✅ Validate inbound requests (FluentValidation)
- ✅ Enforce authentication and authorization (JWT, claims, permissions)
- ✅ Route queries to downstream APIs via typed HttpClients
- ✅ Dispatch commands to message broker (MassTransit/RabbitMQ)
- ✅ Transform/aggregate responses for the frontend
- ✅ Handle correlation IDs for async command tracking

### What BFF Does NOT Do

- ❌ Persist data (no database, no repository implementations)
- ❌ Execute business/domain logic
- ❌ Own aggregates or entities with state
- ❌ Publish domain events (it dispatches commands, not events)
- ❌ Contain repository interfaces or implementations

### Allowed Dependencies

- ASP.NET Core (serves HTTP to frontend)
- Microsoft.Extensions.Http + Polly (typed HttpClients for downstream APIs)
- MassTransit + RabbitMQ (dispatches commands to broker)
- MediatR (CQRS dispatch)
- FluentValidation (validates inbound requests)
- Microsoft.AspNetCore.Authentication.JwtBearer (JWT auth)
- **NO** EF Core, **NO** Npgsql, **NO** database drivers

### Folder Structure

```
backend/src/
├── Namespace.Domain/Contexts/<Context>/
│   ├── Contracts/            ← API client interfaces, message sender interfaces ONLY
│   ├── Models/               ← Shared DTOs, request/response contracts
│   └── GLOSSARY.md
├── Namespace.Application/Contexts/<Context>/
│   ├── Commands/             ← Command handlers (dispatch to broker)
│   ├── Queries/              ← Query handlers (call downstream APIs)
│   └── DTOs/                 ← Frontend-facing DTOs
├── Namespace.Infrastructure/
│   ├── Clients/              ← Typed HttpClient implementations
│   ├── Messaging/            ← MassTransit message sender implementations
│   └── Auth/                 ← Auth/claims/permissions adapters
└── Namespace.Presentation/Contexts/<Context>/
    └── Controllers/          ← REST endpoints (frontend-facing, [Authorize])
```

### BFF Violations to Detect

| Violation | Description |
|-----------|-------------|
| **Repository in BFF** | BFF must not define or implement repository interfaces |
| **Database dependency** | No EF Core, Npgsql, or database driver packages |
| **Domain logic** | Domain layer must contain only interfaces and contracts |
| **Direct data access** | All data must come from downstream APIs, never from a local store |
| **Event publishing** | BFF dispatches commands to a broker; it does not publish domain events |

---

## Archetype 3: Microservice

### Purpose

A message-driven service that listens for commands/events from a broker, executes domain logic, and persists its own state. Not HTTP-first — messaging is the primary interface.

### Layer Behavior

| Layer | Behavior |
|-------|----------|
| **Presentation** | MassTransit consumers (IConsumer\<T\>), optional thin REST for health/admin |
| **Application** | Command handlers execute domain logic and persist. Event handlers react to integration events. MediatR dispatches. |
| **Domain** | Full domain model: entities, value objects, aggregates, domain events, repository interfaces |
| **Infrastructure** | Repository implementations (EF Core), DbContext, MassTransit bus config, integration event publishers |

### CQRS Routing

```
Inbound Message (from broker)
  → IConsumer<T> (Presentation)
    → IMediator.Send(command) → Command Handler (Application) → Domain Logic → Repository → Database
    → IMediator.Send(event)   → Event Handler (Application) → Update read model / trigger side effects

Outbound:
  → IPublishEndpoint (Infrastructure) → Broker → Other services
```

### What Microservice Does

- ✅ Listen for commands and events from a message broker (MassTransit/RabbitMQ)
- ✅ Execute full domain logic (aggregates, entities, domain services)
- ✅ Persist its own data (EF Core + PostgreSQL, database per service)
- ✅ Publish integration events for other services
- ✅ Maintain optimised read models (CQRS)

### What Microservice Does NOT Do

- ❌ Serve as the primary HTTP API for frontend clients (use a BFF for that)
- ❌ Call downstream APIs as its primary data source (it owns its data)
- ❌ Share its database with other services

### Allowed Dependencies

- MassTransit + RabbitMQ (primary messaging interface)
- EF Core + Npgsql (PostgreSQL persistence — owns its data)
- MediatR (internal CQRS dispatch)
- FluentValidation (message validation)
- AutoMapper (DTO mapping)
- Serilog (structured logging)
- ASP.NET Core (optional, for health checks or admin endpoints only)
- **NO** Swashbuckle/Swagger (not HTTP-first)

### Folder Structure

```
backend/src/
├── Namespace.Domain/Contexts/<Context>/
│   ├── Entities/             ← Aggregates, entities
│   ├── ValueObjects/         ← Immutable value types
│   ├── Events/               ← Domain events + integration events
│   ├── Exceptions/           ← Domain-specific exceptions
│   ├── Interfaces/           ← Repository interfaces
│   └── GLOSSARY.md
├── Namespace.Application/Contexts/<Context>/
│   ├── Commands/             ← Command handlers (triggered by messages)
│   ├── Queries/              ← Query handlers (local read model)
│   ├── Events/               ← Integration event handlers
│   ├── DTOs/                 ← Data transfer objects
│   └── Validators/           ← FluentValidation validators
├── Namespace.Infrastructure/
│   ├── Contexts/<Context>/Repositories/ ← EF Core repository implementations
│   ├── Persistence/          ← DbContext, entity configurations
│   ├── Messaging/            ← MassTransit bus config, event publishers
│   └── Events/               ← Integration event definitions
└── Namespace.Presentation/Contexts/<Context>/
    └── Consumers/            ← MassTransit consumers (IConsumer<T>)
```

---

## Cross-Archetype Rules

These rules apply regardless of archetype:

1. **DDD is mandatory** — All archetypes use bounded contexts and ubiquitous language
2. **Onion Architecture** — Dependencies always point inward (domain has zero external dependencies)
3. **CQRS separation** — Commands and queries are always separate, even in BFF (MediatR)
4. **No cross-context imports** — Communication via events, APIs, or ACL
5. **Inside-out implementation** — Build domain layer first, then outward
6. **Tests are non-negotiable** — 80% line coverage minimum (xUnit + FluentAssertions)

---

## Archetype Selection Guide

| If your service... | Choose |
|---------------------|--------|
| Serves HTTP to clients, owns its database, has full domain logic | `api` |
| Sits between a frontend and backend services, owns no data | `bff-api` |
| Reacts to messages, owns its data, is not HTTP-first | `microservice` |

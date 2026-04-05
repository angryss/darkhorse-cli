# 10 — Repository Map

> Folder layout for **test-ms** (archetype: microservice).

## Top-Level Structure

| Folder | Purpose |
|--------|---------|
| `context/` | AI navigation — helps agents understand the repo |
| `openspec/` | Specs, proposals, archive — spec-driven development |
| `backend/` | .NET solution organized by Onion Architecture layers |
| `deployment/` | Docker, Kubernetes, deployment scripts |

## Backend Structure

```
backend/
├── Test.Ms.sln
├── src/
│   ├── Test.Ms.Presentation/     ← MassTransit consumers, health endpoints
│   │   └── Contexts/
│   │       └── <ContextName>/
│   │           └── Consumers/                         ← Message consumers (IConsumer<T>)
│   ├── Test.Ms.Application/      ← Command/event handlers, queries
│   │   └── Contexts/
│   │       └── <ContextName>/
│   │           ├── Commands/                          ← Command handlers (triggered by messages)
│   │           ├── Queries/                           ← Query handlers (local read model)
│   │           └── Events/                            ← Integration event handlers
│   ├── Test.Ms.Domain/           ← Entities, value objects, events
│   │   └── Contexts/
│   │       └── <ContextName>/
│   │           ├── Entities/                          ← Aggregates, entities
│   │           ├── ValueObjects/                      ← Immutable value types
│   │           ├── Events/                            ← Domain events
│   │           └── Interfaces/                        ← Repository interfaces
│   ├── Test.Ms.Common/           ← Shared contracts, event schemas
│   │   ├── Events/                                    ← Shared integration event schemas
│   │   └── Examples/                                  ← CQRS example handlers (delete after use)
│   └── Test.Ms.Infrastructure/   ← Repos, messaging, broker config
│       ├── Persistence/                               ← EF Core DbContext, configurations
│       ├── Messaging/                                 ← MassTransit config, event publishers
│       ├── Events/                                    ← Integration event publisher implementations
│       └── Contexts/
│           └── <ContextName>/
│               └── Repositories/                      ← Repository implementations
└── tests/
    ├── Test.Ms.UnitTests/
    └── Test.Ms.IntegrationTests/
```

## OpenSpec Structure

```
openspec/
├── AGENTS.md                        ← AI agent instructions
├── specs/
│   ├── architecture/                ← DDD, Onion Arch, CQRS rules
│   ├── domain/                      ← Bounded context definitions
│   ├── patterns/                    ← Backend patterns
│   ├── project/                     ← Roadmap, MVPs, progress
│   └── workflow/                    ← Planning, implementation, troubleshooting
├── changes/                         ← Active proposals (REQ-, BUG-, ENH-)
└── archive/                         ← Completed proposals
```


## Deployment Structure

```
deployment/
├── docker-compose.yml
├── dev/                             ← Development environment
└── prod/                            ← Production environment
```

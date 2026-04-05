# 10 — Repository Map

> Folder layout for **test-mobile** (archetype: microservice).

## Top-Level Structure

| Folder | Purpose |
|--------|---------|
| `context/` | AI navigation — helps agents understand the repo |
| `openspec/` | Specs, proposals, archive — spec-driven development |
| `backend/` | .NET solution organized by Onion Architecture layers |
| `frontend/` | React web application |
| `deployment/` | Docker, Kubernetes, deployment scripts |

## Backend Structure

```
backend/
├── DarkHorse.Mobile.sln
├── src/
│   ├── DarkHorse.Mobile.Presentation/     ← MassTransit consumers, health endpoints
│   │   └── Contexts/
│   │       └── <ContextName>/
│   │           └── Consumers/                         ← Message consumers (IConsumer<T>)
│   ├── DarkHorse.Mobile.Application/      ← Command/event handlers, queries
│   │   └── Contexts/
│   │       └── <ContextName>/
│   │           ├── Commands/                          ← Command handlers (triggered by messages)
│   │           ├── Queries/                           ← Query handlers (local read model)
│   │           └── Events/                            ← Integration event handlers
│   ├── DarkHorse.Mobile.Domain/           ← Entities, value objects, events
│   │   └── Contexts/
│   │       └── <ContextName>/
│   │           ├── Entities/                          ← Aggregates, entities
│   │           ├── ValueObjects/                      ← Immutable value types
│   │           ├── Events/                            ← Domain events
│   │           └── Interfaces/                        ← Repository interfaces
│   ├── DarkHorse.Mobile.Common/           ← Shared contracts, event schemas
│   │   ├── Events/                                    ← Shared integration event schemas
│   │   └── Examples/                                  ← CQRS example handlers (delete after use)
│   └── DarkHorse.Mobile.Infrastructure/   ← Repos, messaging, broker config
│       ├── Persistence/                               ← EF Core DbContext, configurations
│       ├── Messaging/                                 ← MassTransit config, event publishers
│       ├── Events/                                    ← Integration event publisher implementations
│       └── Contexts/
│           └── <ContextName>/
│               └── Repositories/                      ← Repository implementations
└── tests/
    ├── DarkHorse.Mobile.UnitTests/
    └── DarkHorse.Mobile.IntegrationTests/
```

## OpenSpec Structure

```
openspec/
├── AGENTS.md                        ← AI agent instructions
├── specs/
│   ├── architecture/                ← DDD, Onion Arch, CQRS rules
│   ├── domain/                      ← Bounded context definitions
│   ├── patterns/                    ← Backend & frontend patterns
│   ├── project/                     ← Roadmap, MVPs, progress
│   ├── toolkit/                     ← React component reference
│   └── workflow/                    ← Planning, implementation, troubleshooting
├── changes/                         ← Active proposals (REQ-, BUG-, ENH-)
└── archive/                         ← Completed proposals
```

## Frontend Structure

```
frontend/
└── mobile-app/
    ├── package.json
    ├── app/              ← Expo Router screens & layouts
    └── src/
        ├── components/
        ├── hooks/
        ├── services/
        ├── store/
        └── utils/
```

## Deployment Structure

```
deployment/
├── docker-compose.yml
├── dev/                             ← Development environment
└── prod/                            ← Production environment
```

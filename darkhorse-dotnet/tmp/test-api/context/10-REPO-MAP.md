# 10 — Repository Map

> Folder layout for **test-api** (archetype: api).

## Top-Level Structure

| Folder | Purpose |
|--------|---------|
| `context/` | AI navigation — helps agents understand the repo |
| `openspec/` | Specs, proposals, archive — spec-driven development |
| `backend/` | .NET solution organized by archetype category |
| `frontend/` | React web + React Native mobile apps |
| `deployment/` | Docker, Kubernetes, deployment scripts |

## Backend Structure

```
backend/
└── apis/
    ├── TestApi.sln
    ├── src/
    │   ├── TestApi.Presentation/     ← ASP.NET Core controllers, middleware
    │   │   └── Contexts/
    │   │       └── <ContextName>/
    │   │           └── Controllers/                       ← REST endpoints
    │   ├── TestApi.Application/      ← Use cases, CQRS handlers, DTOs
    │   │   ├── Contexts/
    │   │   │   └── <ContextName>/
    │   │   │       ├── Commands/                          ← Command handlers (write path)
    │   │   │       ├── Queries/                           ← Query handlers (read path)
    │   │   │       └── DTOs/                              ← Data transfer objects
    │   │   └── Examples/                              ← CQRS example handlers (delete after use)
    │   ├── TestApi.Domain/           ← Entities, value objects, events
    │   │   └── Contexts/
    │   │       └── <ContextName>/
    │   │           ├── Entities/                          ← Aggregates, entities
    │   │           ├── ValueObjects/                      ← Immutable value types
    │   │           ├── Events/                            ← Domain events
    │   │           └── Interfaces/                        ← Repository interfaces

    │   └── TestApi.Infrastructure/   ← Repos, DB, messaging
    │       ├── Persistence/                               ← EF Core DbContext, configurations
    │       └── Contexts/
    │           └── <ContextName>/
    │               └── Repositories/                      ← Repository implementations
    └── tests/
        ├── TestApi.UnitTests/
        └── TestApi.IntegrationTests/
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
├── web-app/
│   ├── package.json
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── hooks/
│       ├── services/
│       ├── store/
│       └── utils/
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

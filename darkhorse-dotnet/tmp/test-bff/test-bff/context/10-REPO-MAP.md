# 10 — Repository Map

> Folder layout for **test-bff** (archetype: bff-api).

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
├── Test.Bff.sln
├── src/
│   ├── Test.Bff.Presentation/     ← ASP.NET Core controllers, auth middleware
│   │   └── Contexts/
│   │       └── <ContextName>/
│   │           └── Controllers/                       ← Frontend-facing endpoints
│   ├── Test.Bff.Application/      ← CQRS: queries → APIs, commands → broker
│   │   └── Contexts/
│   │       └── <ContextName>/
│   │           ├── Commands/                          ← Command handlers (→ broker)
│   │           ├── Queries/                           ← Query handlers (→ API clients)
│   │           └── DTOs/                              ← Frontend-facing DTOs
│   ├── Test.Bff.Domain/           ← Contracts/interfaces ONLY (no entities)
│   │   └── Contexts/
│   │       └── <ContextName>/
│   │           └── Contracts/                         ← API client interfaces, message sender interfaces
│   ├── Test.Bff.Common/           ← Shared contracts
│   │   └── Examples/                                  ← CQRS example handlers (delete after use)
│   └── Test.Bff.Infrastructure/   ← REST clients, message senders
│       ├── Clients/                                   ← Typed HttpClient implementations
│       ├── Messaging/                                 ← MassTransit message sender implementations
│       └── Contexts/
│           └── <ContextName>/
│               ├── Clients/                           ← Context-specific API clients
│               └── Messaging/                         ← Context-specific message senders
└── tests/
    ├── Test.Bff.UnitTests/
    └── Test.Bff.IntegrationTests/
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

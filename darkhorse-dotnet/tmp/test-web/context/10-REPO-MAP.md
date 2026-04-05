# 10 — Repository Map

> Folder layout for **test-web** (archetype: bff-api).

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
├── DarkHorse.Web.sln
├── src/
│   ├── DarkHorse.Web.Presentation/     ← ASP.NET Core controllers, auth middleware
│   │   └── Contexts/
│   │       └── <ContextName>/
│   │           └── Controllers/                       ← Frontend-facing endpoints
│   ├── DarkHorse.Web.Application/      ← CQRS: queries → APIs, commands → broker
│   │   └── Contexts/
│   │       └── <ContextName>/
│   │           ├── Commands/                          ← Command handlers (→ broker)
│   │           ├── Queries/                           ← Query handlers (→ API clients)
│   │           └── DTOs/                              ← Frontend-facing DTOs
│   ├── DarkHorse.Web.Domain/           ← Contracts/interfaces ONLY (no entities)
│   │   └── Contexts/
│   │       └── <ContextName>/
│   │           └── Contracts/                         ← API client interfaces, message sender interfaces
│   ├── DarkHorse.Web.Common/           ← Shared contracts
│   │   └── Examples/                                  ← CQRS example handlers (delete after use)
│   └── DarkHorse.Web.Infrastructure/   ← REST clients, message senders
│       ├── Clients/                                   ← Typed HttpClient implementations
│       ├── Messaging/                                 ← MassTransit message sender implementations
│       └── Contexts/
│           └── <ContextName>/
│               ├── Clients/                           ← Context-specific API clients
│               └── Messaging/                         ← Context-specific message senders
└── tests/
    ├── DarkHorse.Web.UnitTests/
    └── DarkHorse.Web.IntegrationTests/
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
└── web-app/
    ├── package.json
    └── src/
        ├── components/
        ├── pages/
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

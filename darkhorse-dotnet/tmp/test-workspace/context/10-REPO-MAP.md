# 10 — Repository Map

> Folder layout for **test-workspace**.

## Top-Level Structure

| Folder | Purpose |
|--------|---------|
| `context/` | AI navigation — helps agents understand the repo |
| `openspec/` | Specs, proposals, archive — spec-driven development |
| `backend/` | .NET services organized by archetype category |
| `deployment/` | Docker, Kubernetes, deployment scripts |

## Backend Structure

```
backend/
├── apis/             ← REST services (darkhorse-dotnet add api)
│   └── (empty)       ← Add: darkhorse-dotnet add api --name <name> --namespace <Namespace>
├── bffs/             ← BFF routing services (darkhorse-dotnet add bff-api)
│   └── (empty)       ← Add: darkhorse-dotnet add bff-api --name <name> --namespace <Namespace>
└── microservices/    ← Message-driven services (darkhorse-dotnet add microservice)
    └── (empty)       ← Add: darkhorse-dotnet add microservice --name <name> --namespace <Namespace>
```

Each added service follows the Onion Architecture layout:
```
backend/<category>/<service-name>/
├── <Namespace>.sln
├── src/
│   ├── <Namespace>.Presentation/     ← Controllers / Consumers
│   ├── <Namespace>.Application/      ← CQRS handlers, use cases
│   ├── <Namespace>.Domain/           ← Entities, value objects, events
│   └── <Namespace>.Infrastructure/   ← Repos, DB, messaging clients
└── tests/
    ├── <Namespace>.UnitTests/
    └── <Namespace>.IntegrationTests/
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

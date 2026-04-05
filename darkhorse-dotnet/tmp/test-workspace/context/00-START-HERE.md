# 00 — Start Here

> **Entry point for all AI agents and developers working on test-workspace.**

## What Is This Project?

**test-workspace** — Test workspace

- **Architecture:** DDD + Onion Architecture + CQRS (per service)
- **Backend:** ASP.NET Core (.NET, service-level)
> **Workspace initialized.** No services yet. Run `darkhorse-dotnet add api` to scaffold your first service.

## Navigation

| File | Purpose |
|------|---------|
| `context/00-START-HERE.md` | You are here |
| `context/10-REPO-MAP.md` | Folder layout and file descriptions |
| `context/30-BOUNDED-CONTEXTS.md` | Domain contexts and relationships |
| `context/50-SEARCH-QUERIES.md` | Search patterns for finding code |
| `openspec/AGENTS.md` | **Read next** — AI agent rules and instructions |

## Workspace Structure

```
test-workspace/
├── context/                   ← AI navigation (this folder)
├── openspec/                  ← Specs, proposals, workflow
│   ├── AGENTS.md              ← AI reads this second
│   ├── specs/                 ← Architecture, patterns, domain, workflow
│   ├── changes/               ← Active proposals
│   └── archive/               ← Completed proposals
├── backend/
│   ├── apis/                  ← REST API services
│   ├── bffs/                  ← Backend-for-Frontend services
│   └── microservices/         ← Message-driven services

├── deployment/                ← Docker, Kubernetes
└── .darkhorse.yaml            ← Workspace configuration
```

## Service Archetypes

| Command | Category | Purpose |
|---------|----------|---------|
| `darkhorse-dotnet add api` | `backend/apis/` | REST service with persistence |
| `darkhorse-dotnet add bff-api` | `backend/bffs/` | BFF routing layer, no persistence |
| `darkhorse-dotnet add microservice` | `backend/microservices/` | Message-driven, event handling |


## What To Do Next

1. Read `openspec/AGENTS.md` for workspace architecture rules
2. Define your project roadmap in `openspec/specs/project/roadmap.md`
3. Identify your bounded contexts in `openspec/specs/domain/`
4. Add your first service: `darkhorse-dotnet add api --name <service-name> --namespace <Namespace>`

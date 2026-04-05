# 00 — Start Here

> **Entry point for all AI agents and developers working on test-api.**

## What Is This Project?

**test-api** — Test API

- **Archetype:** api
- **Framework:** ASP.NET Core (.NET 8)
- **Architecture:** DDD + Onion Architecture + CQRS
- **Build:** dotnet CLI
- **Frontend:** React + DarkHorse Toolkit

> **API archetype** — Standard REST service with persistence and full domain logic.

## Navigation

| File | Purpose |
|------|---------|
| `context/00-START-HERE.md` | You are here |
| `context/10-REPO-MAP.md` | Folder layout and file descriptions |
| `context/30-BOUNDED-CONTEXTS.md` | Domain contexts and relationships |
| `context/50-SEARCH-QUERIES.md` | Search patterns for finding code |
| `openspec/AGENTS.md` | **Read next** — AI agent rules and instructions |

## Quick Reference

```
test-api/
├── context/             ← AI navigation (this folder)
├── openspec/            ← Specs, proposals, workflow
│   ├── AGENTS.md        ← AI reads this second
│   ├── specs/           ← Architecture, patterns, domain, workflow
│   ├── changes/         ← Active proposals
│   └── archive/         ← Completed proposals
├── backend/             ← .NET solution (Onion Architecture)
│   └── apis/
│       ├── TestApi.sln
│       ├── src/
│       │   ├── TestApi.Presentation/
│       │   ├── TestApi.Application/
│       │   ├── TestApi.Domain/
│       │   └── TestApi.Infrastructure/
│       └── tests/
├── frontend/            ← Web + Mobile apps
├── deployment/          ← Docker, Kubernetes
└── .darkhorse.yaml      ← Project configuration
```

## What To Do Next

1. Read `openspec/AGENTS.md` for architecture rules
2. Check `openspec/specs/domain/` for bounded contexts
3. Check `openspec/specs/project/roadmap.md` for project roadmap
4. Look at `openspec/changes/` for active work items

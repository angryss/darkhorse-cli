# 00 — Start Here

> **Entry point for all AI agents and developers working on test-bff.**

## What Is This Project?

**test-bff** — Test BFF

- **Archetype:** bff-api
- **Framework:** ASP.NET Core (.NET 9)
- **Architecture:** DDD + Onion Architecture + CQRS
- **Build:** dotnet CLI

> **BFF-API archetype** — Backend-for-Frontend routing layer. No persistence, no domain logic execution. Queries route to downstream APIs, commands dispatch to a message broker.

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
test-bff/
├── context/             ← AI navigation (this folder)
├── openspec/            ← Specs, proposals, workflow
│   ├── AGENTS.md        ← AI reads this second
│   ├── specs/           ← Architecture, patterns, domain, workflow
│   ├── changes/         ← Active proposals
│   └── archive/         ← Completed proposals
├── backend/             ← .NET solution (Onion Architecture)
│   ├── Test.Bff.sln
│   ├── src/
│   │   ├── Test.Bff.Presentation/
│   │   ├── Test.Bff.Application/
│   │   ├── Test.Bff.Domain/
│   │   ├── Test.Bff.Common/
│   │   └── Test.Bff.Infrastructure/
│   └── tests/
├── deployment/          ← Docker, Kubernetes
└── .darkhorse.yaml      ← Project configuration
```

## What To Do Next

1. Read `openspec/AGENTS.md` for architecture rules
2. Check `openspec/specs/domain/` for bounded contexts
3. Check `openspec/specs/project/roadmap.md` for project roadmap
4. Look at `openspec/changes/` for active work items

# 00 — Start Here

> **Entry point for all AI agents and developers working on test-ms.**

## What Is This Project?

**test-ms** — Test MS

- **Archetype:** microservice
- **Framework:** ASP.NET Core (.NET 8)
- **Architecture:** DDD + Onion Architecture + CQRS
- **Build:** dotnet CLI

> **Microservice archetype** — Message-driven service. Listens for commands/events from a broker, executes domain logic, owns its data. Not HTTP-first.

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
test-ms/
├── context/             ← AI navigation (this folder)
├── openspec/            ← Specs, proposals, workflow
│   ├── AGENTS.md        ← AI reads this second
│   ├── specs/           ← Architecture, patterns, domain, workflow
│   ├── changes/         ← Active proposals
│   └── archive/         ← Completed proposals
├── backend/             ← .NET solution (Onion Architecture)
│   ├── Test.Ms.sln
│   ├── src/
│   │   ├── Test.Ms.Presentation/
│   │   ├── Test.Ms.Application/
│   │   ├── Test.Ms.Domain/
│   │   ├── Test.Ms.Common/
│   │   └── Test.Ms.Infrastructure/
│   └── tests/
├── deployment/          ← Docker, Kubernetes
└── .darkhorse.yaml      ← Project configuration
```

## What To Do Next

1. Read `openspec/AGENTS.md` for architecture rules
2. Check `openspec/specs/domain/` for bounded contexts
3. Check `openspec/specs/project/roadmap.md` for project roadmap
4. Look at `openspec/changes/` for active work items

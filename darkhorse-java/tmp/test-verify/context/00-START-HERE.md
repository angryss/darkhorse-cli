# 00 — Start Here

> **Entry point for all AI agents and developers working on test-verify.**

## What Is This Project?

**test-verify** — Verify log

- **Archetype:** bff-api
- **Framework:** Quarkus (Java 21)
- **Architecture:** DDD + Onion Architecture + CQRS
- **Build:** Maven
- **Frontend:** React + DarkHorse Toolkit

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
test-verify/
├── context/             ← AI navigation (this folder)
├── openspec/            ← Specs, proposals, workflow
│   ├── AGENTS.md        ← AI reads this second
│   ├── specs/           ← Architecture, patterns, domain, workflow
│   ├── changes/         ← Active proposals
│   └── archive/         ← Completed proposals
├── backend/             ← Java/Quarkus code (DDD)
│   ├── contexts/        ← Bounded contexts
│   └── common/          ← Shared contracts
├── frontend/            ← React web application
├── deployment/          ← Docker, Kubernetes
└── .darkhorse.yaml      ← Project configuration
```

## What To Do Next

1. Read `openspec/AGENTS.md` for architecture rules
2. Check `openspec/specs/domain/` for bounded contexts
3. Check `openspec/specs/project/roadmap.md` for project roadmap
4. Look at `openspec/changes/` for active work items

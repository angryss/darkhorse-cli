# AGENTS.md — test-project

> **AI Agent Entry Point.** Read this file first when working on this project.

## Project

- **Name:** test-project
- **Description:** E2E test
- **Framework:** Quarkus (Java 17)
- **Architecture:** DDD + Onion Architecture + CQRS
- **Generated:** 2026-04-03 by DarkHorse Java CLI v0.1.0

## Reading Order

1. `context/00-START-HERE.md` — Project overview and navigation
2. **This file** — AI agent instructions
3. `openspec/specs/architecture/` — Mandatory architecture rules
4. `openspec/specs/patterns/` — Implementation patterns
5. `openspec/specs/workflow/` — Development workflow
6. `openspec/specs/domain/` — Bounded contexts (project-specific)
7. `openspec/changes/` — Active proposals and tasks

## Architecture Rules (Mandatory)

All code MUST follow:

- **DDD:** Bounded contexts, ubiquitous language, aggregates, domain events
- **Onion Architecture:** Domain → Application → Infrastructure → Presentation (dependencies point inward)
- **CQRS:** Commands and queries are separated
- **Repository Pattern:** One repository per aggregate root
- **Integration Events:** Cross-context communication via async events

See `openspec/specs/architecture/` for full rules.

## Canonical Structure

```
test-project/
├── context/          ← AI navigation (you are reading from here)
├── openspec/         ← Specs, proposals, archive
├── backend/          ← Java/Quarkus services (DDD bounded contexts)
├── frontend/         ← React web application
├── deployment/       ← Docker, Kubernetes, IaC
└── .darkhorse.yaml   ← Project configuration
```

## Code Placement Rules

| Location | Contains |
|----------|----------|
| `backend/contexts/<name>/domain/` | Entities, value objects, events, repository interfaces |
| `backend/contexts/<name>/application/` | Commands, queries, handlers, DTOs |
| `backend/contexts/<name>/infrastructure/` | Repository implementations, messaging, persistence |
| `backend/contexts/<name>/presentation/` | REST controllers, routes |
| `backend/common/` | Shared contracts, utilities |
| `frontend/web-app/src/` | React components, pages, hooks, services |
| `deployment/` | Docker, scripts, config |
| `openspec/` | Specs and proposals only — NO executable code |

## Forbidden

- No agent frameworks (LangChain, AutoGen, CrewAI)
- No extra top-level directories
- No code in `openspec/`
- No cross-context direct dependencies (use integration events)
- Domain layer has ZERO external dependencies

## Workflow

1. **Plan** — Create proposal in `openspec/changes/<id>/`
2. **Implement** — Follow `tasks.md`, write code to `backend/` or `frontend/`
3. **Test** — Run tests, file bugs as BUG proposals
4. **Fix** — Investigate and fix bugs
5. **Archive** — Move completed proposals to `openspec/archive/`

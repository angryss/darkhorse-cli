# AGENTS.md — test-verify

> **AI Agent Entry Point.** Read this file first when working on this project.

## Project

- **Name:** test-verify
- **Description:** Verify log
- **Archetype:** bff-api
- **Framework:** Quarkus (Java 21)
- **Architecture:** DDD + Onion Architecture + CQRS
- **Generated:** 2026-04-03 by DarkHorse Java CLI v0.1.0

## Archetype: bff-api

This is a **BFF API (Backend-for-Frontend)** — it is a routing layer between a frontend and downstream services.
- **Commands dispatch to a message broker** — they do NOT persist
- **Queries call downstream REST APIs** — they do NOT access a database
- Domain layer contains **interfaces and contracts only** — no business logic execution
- **No persistence dependencies** — no repositories, no database, no ORM

## Reading Order

1. `context/00-START-HERE.md` — Project overview and navigation
2. **This file** — AI agent instructions
3. `openspec/specs/architecture/archetype-rules.md` — **Archetype constraints (read this)**
4. `openspec/specs/architecture/` — Mandatory architecture rules
5. `openspec/specs/patterns/` — Implementation patterns
6. `openspec/specs/workflow/` — Development workflow
7. `openspec/specs/domain/` — Bounded contexts (project-specific)
8. `openspec/changes/` — Active proposals and tasks

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
test-verify/
├── context/          ← AI navigation (you are reading from here)
├── openspec/         ← Specs, proposals, archive
├── backend/          ← Java/Quarkus services (DDD bounded contexts)
├── frontend/         ← React Native mobile application (Expo)
├── deployment/       ← Docker, Kubernetes, IaC
└── .darkhorse.yaml   ← Project configuration
```

## Code Placement Rules

| Location | Contains |
|----------|----------|
| `backend/contexts/<name>/domain/` | Contracts/interfaces ONLY (API client interfaces, message sender interfaces) |
| `backend/contexts/<name>/application/` | Command handlers (→ broker), query handlers (→ API clients) |
| `backend/contexts/<name>/infrastructure/` | REST API client implementations, message sender implementations, auth adapters |
| `backend/contexts/<name>/presentation/` | REST controllers (frontend-facing), auth middleware |
| `backend/common/` | Shared contracts, client abstractions, messaging abstractions |
| `frontend/mobile-app/app/` | React Native screens, navigation, components |
| `deployment/` | Docker, scripts, config |
| `openspec/` | Specs and proposals only — NO executable code |

## Forbidden

- No agent frameworks (LangChain, AutoGen, CrewAI)
- No extra top-level directories
- No code in `openspec/`
- No cross-context direct dependencies (use integration events)
- Domain layer has ZERO external dependencies
- **No database or persistence dependencies** (no Hibernate, no JDBC, no Panache)
- **No repository interfaces or implementations**
- **No domain logic execution** — domain layer contains interfaces/contracts only
- **No domain events** — BFF dispatches commands to broker, not events

## Workflow

1. **Plan** — Create proposal in `openspec/changes/<id>/`
2. **Implement** — Follow `tasks.md`, write code to `backend/` or `frontend/`
3. **Test** — Run tests, file bugs as BUG proposals
4. **Fix** — Investigate and fix bugs
5. **Archive** — Move completed proposals to `openspec/archive/`

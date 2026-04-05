# AGENTS.md — test-api

> **AI Agent Entry Point.** Read this file first when working on this project.

## Project

- **Name:** test-api
- **Description:** Test API
- **Archetype:** api
- **Framework:** ASP.NET Core (.NET 8)
- **Architecture:** DDD + Onion Architecture + CQRS
- **Generated:** 2026-04-03 by DarkHorse .NET CLI v0.1.0

## Archetype: api

This is a **standard API** — it owns its data, exposes HTTP endpoints, and contains full domain logic.
- Commands persist via repositories (EF Core)
- Queries read from repositories or read models
- Full domain model with entities, value objects, aggregates

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
- **CQRS:** Commands and queries are separated (MediatR)
- **Repository Pattern:** One repository per aggregate root (EF Core implementations)
- **Integration Events:** Cross-context communication via async events (MassTransit)

See `openspec/specs/architecture/` for full rules.

## Canonical Structure

```
test-api/
├── context/          ← AI navigation (you are reading from here)
├── openspec/         ← Specs, proposals, archive
├── backend/          ← .NET solution (Onion Architecture)
│   └── apis/
│       ├── src/
│       │   ├── TestApi.Presentation/
│       │   ├── TestApi.Application/
│       │   ├── TestApi.Domain/
│       │   └── TestApi.Infrastructure/
│       └── tests/
├── frontend/         ← React (Web) + React Native (Mobile)
├── deployment/       ← Docker, Kubernetes, IaC
└── .darkhorse.yaml   ← Project configuration
```

## .NET Layer Mapping (Onion Architecture)

| Layer | Project | Depends On |
|-------|---------|------------|
| **Domain** | `TestApi.Domain` | NOTHING (zero dependencies) |
| **Application** | `TestApi.Application` | Domain |
| **Infrastructure** | `TestApi.Infrastructure` | Application, Domain |
| **Presentation** | `TestApi.Presentation` | Application, Infrastructure |

> **Common:** Shared contracts and utilities are consumed as a NuGet package (`TestApi.Common`), not as a local project.

## Code Placement Rules

| Location | Contains |
|----------|----------|
| `*.Domain/Contexts/<Name>/Entities/` | Aggregates, entities, value objects |
| `*.Domain/Contexts/<Name>/Events/` | Domain events |
| `*.Domain/Contexts/<Name>/Interfaces/` | Repository interfaces |
| `*.Application/Contexts/<Name>/Commands/` | Command handlers (write path) |
| `*.Application/Contexts/<Name>/Queries/` | Query handlers (read path) |
| `*.Application/Contexts/<Name>/DTOs/` | Data transfer objects |
| `*.Infrastructure/Contexts/<Name>/Repositories/` | EF Core repository implementations |
| `*.Infrastructure/Persistence/` | DbContext, entity configurations |
| `*.Presentation/Contexts/<Name>/Controllers/` | REST controllers |
| `frontend/web-app/src/` | React components, pages, hooks, services |
| `frontend/mobile-app/app/` | React Native screens, navigation, components |
| `deployment/` | Docker, scripts, config |
| `openspec/` | Specs and proposals only — NO executable code |

## Forbidden

- No agent frameworks (LangChain, AutoGen, CrewAI, Semantic Kernel)
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

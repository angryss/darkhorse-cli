# AGENTS.md — test-ms

> **AI Agent Entry Point.** Read this file first when working on this project.

## Project

- **Name:** test-ms
- **Description:** Test MS
- **Archetype:** microservice
- **Framework:** ASP.NET Core (.NET 8)
- **Architecture:** DDD + Onion Architecture + CQRS
- **Generated:** 2026-04-03 by DarkHorse .NET CLI v0.1.0

## Archetype: microservice

This is a **Microservice** — it is message-driven, owns its data, and is NOT HTTP-first.
- Commands triggered by inbound messages from a broker (MassTransit), not HTTP requests
- Full domain logic with persistence (EF Core)
- Publishes integration events for other services
- REST endpoints only for health checks or admin

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
test-ms/
├── context/          ← AI navigation (you are reading from here)
├── openspec/         ← Specs, proposals, archive
├── backend/          ← .NET solution (Onion Architecture)
│   ├── src/
│   │   ├── Test.Ms.Presentation/
│   │   ├── Test.Ms.Application/
│   │   ├── Test.Ms.Domain/
│   │   ├── Test.Ms.Common/
│   │   └── Test.Ms.Infrastructure/
│   └── tests/
├── deployment/       ← Docker, Kubernetes, IaC
└── .darkhorse.yaml   ← Project configuration
```

## .NET Layer Mapping (Onion Architecture)

| Layer | Project | Depends On |
|-------|---------|------------|
| **Domain** | `Test.Ms.Domain` | NOTHING (zero dependencies) |
| **Application** | `Test.Ms.Application` | Domain, Common |
| **Infrastructure** | `Test.Ms.Infrastructure` | Application, Domain, Common |
| **Presentation** | `Test.Ms.Presentation` | Application, Infrastructure, Common |
| **Common** | `Test.Ms.Common` | Domain |

## Code Placement Rules

| Location | Contains |
|----------|----------|
| `*.Domain/Contexts/<Name>/Entities/` | Aggregates, entities, value objects |
| `*.Domain/Contexts/<Name>/Events/` | Domain events |
| `*.Domain/Contexts/<Name>/Interfaces/` | Repository interfaces |
| `*.Application/Contexts/<Name>/Commands/` | Command handlers (triggered by messages) |
| `*.Application/Contexts/<Name>/Events/` | Integration event handlers |
| `*.Application/Contexts/<Name>/Queries/` | Query handlers (local read model) |
| `*.Infrastructure/Contexts/<Name>/Repositories/` | EF Core repository implementations |
| `*.Infrastructure/Messaging/` | MassTransit config, event publishers |
| `*.Presentation/Contexts/<Name>/Consumers/` | MassTransit consumers (IConsumer<T>) |
| `*.Common/Events/` | Shared integration event schemas |
| `deployment/` | Docker, scripts, config |
| `openspec/` | Specs and proposals only — NO executable code |

## Forbidden

- No agent frameworks (LangChain, AutoGen, CrewAI, Semantic Kernel)
- No extra top-level directories
- No code in `openspec/`
- No cross-context direct dependencies (use integration events)
- Domain layer has ZERO external dependencies
- **No HTTP-first design** — messaging (MassTransit) is the primary interface
- **No shared databases** — this service owns its data exclusively

## Workflow

1. **Plan** — Create proposal in `openspec/changes/<id>/`
2. **Implement** — Follow `tasks.md`, write code to `backend/`
3. **Test** — Run tests, file bugs as BUG proposals
4. **Fix** — Investigate and fix bugs
5. **Archive** — Move completed proposals to `openspec/archive/`

# AGENTS.md — test-bff

> **AI Agent Entry Point.** Read this file first when working on this project.

## Project

- **Name:** test-bff
- **Description:** Test BFF
- **Archetype:** bff-api
- **Framework:** ASP.NET Core (.NET 9)
- **Architecture:** DDD + Onion Architecture + CQRS
- **Generated:** 2026-04-03 by DarkHorse .NET CLI v0.1.0

## Archetype: bff-api

This is a **BFF API (Backend-for-Frontend)** — it is a routing layer between a frontend and downstream services.
- **Commands dispatch to a message broker (MassTransit/RabbitMQ)** — they do NOT persist
- **Queries call downstream REST APIs (HttpClient)** — they do NOT access a database
- Domain layer contains **interfaces and contracts only** — no business logic execution
- **No persistence dependencies** — no EF Core, no repositories, no database

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
test-bff/
├── context/          ← AI navigation (you are reading from here)
├── openspec/         ← Specs, proposals, archive
├── backend/          ← .NET solution (Onion Architecture)
│   ├── src/
│   │   ├── Test.Bff.Presentation/
│   │   ├── Test.Bff.Application/
│   │   ├── Test.Bff.Domain/
│   │   ├── Test.Bff.Common/
│   │   └── Test.Bff.Infrastructure/
│   └── tests/
├── deployment/       ← Docker, Kubernetes, IaC
└── .darkhorse.yaml   ← Project configuration
```

## .NET Layer Mapping (Onion Architecture)

| Layer | Project | Depends On |
|-------|---------|------------|
| **Domain** | `Test.Bff.Domain` | NOTHING (zero dependencies) |
| **Application** | `Test.Bff.Application` | Domain, Common |
| **Infrastructure** | `Test.Bff.Infrastructure` | Application, Domain, Common |
| **Presentation** | `Test.Bff.Presentation` | Application, Infrastructure, Common |
| **Common** | `Test.Bff.Common` | Domain |

## Code Placement Rules

| Location | Contains |
|----------|----------|
| `*.Domain/Contexts/<Name>/Contracts/` | API client interfaces, message sender interfaces ONLY |
| `*.Application/Contexts/<Name>/Commands/` | Command handlers (→ broker via MassTransit) |
| `*.Application/Contexts/<Name>/Queries/` | Query handlers (→ API clients via HttpClient) |
| `*.Application/Contexts/<Name>/DTOs/` | Frontend-facing DTOs |
| `*.Infrastructure/Clients/` | Typed HttpClient implementations |
| `*.Infrastructure/Messaging/` | MassTransit message sender implementations |
| `*.Presentation/Contexts/<Name>/Controllers/` | REST controllers (frontend-facing) |
| `*.Common/` | Shared contracts, client abstractions |
| `deployment/` | Docker, scripts, config |
| `openspec/` | Specs and proposals only — NO executable code |

## Forbidden

- No agent frameworks (LangChain, AutoGen, CrewAI, Semantic Kernel)
- No extra top-level directories
- No code in `openspec/`
- No cross-context direct dependencies (use integration events)
- Domain layer has ZERO external dependencies
- **No EF Core or persistence dependencies**
- **No repository interfaces or implementations**
- **No domain logic execution** — domain layer contains interfaces/contracts only
- **No domain events** — BFF dispatches commands to broker, not events

## Workflow

1. **Plan** — Create proposal in `openspec/changes/<id>/`
2. **Implement** — Follow `tasks.md`, write code to `backend/`
3. **Test** — Run tests, file bugs as BUG proposals
4. **Fix** — Investigate and fix bugs
5. **Archive** — Move completed proposals to `openspec/archive/`

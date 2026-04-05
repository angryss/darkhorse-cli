# AGENTS.md — test-workspace

> **AI Agent Entry Point.** Read this file first when working on this project.

## Workspace

- **Name:** test-workspace
- **Description:** Test workspace
- **Architecture:** DDD + Onion Architecture + CQRS (per service)
- **Services:** None yet — run `darkhorse-dotnet add api` to scaffold your first service
- **Generated:** 2026-04-03 by DarkHorse .NET CLI v0.1.0

## Reading Order

1. `context/00-START-HERE.md` — Workspace overview and navigation
2. **This file** — AI agent instructions
3. `openspec/specs/architecture/archetype-rules.md` — Archetype constraints
4. `openspec/specs/architecture/` — Mandatory architecture rules
5. `openspec/specs/patterns/` — Implementation patterns
6. `openspec/specs/workflow/` — Development workflow
7. `openspec/specs/domain/` — Bounded contexts (project-specific)
8. `openspec/changes/` — Active proposals and tasks

## Workspace Archetypes

This workspace supports three service types. Add services with:

| Command | Path | Purpose |
|---------|------|---------|
| `darkhorse-dotnet add api` | `backend/apis/<name>/` | REST service with persistence, full domain |
| `darkhorse-dotnet add bff-api` | `backend/bffs/<name>/` | BFF routing layer, no persistence |
| `darkhorse-dotnet add microservice` | `backend/microservices/<name>/` | Message-driven, event handling |


## Architecture Rules (Mandatory)

All code MUST follow:

- **DDD:** Bounded contexts, ubiquitous language, aggregates, domain events
- **Onion Architecture:** Domain → Application → Infrastructure → Presentation (dependencies point inward only)
  - Domain: ZERO external dependencies
  - Application: depends on Domain + Common (NuGet)
  - Infrastructure: depends on Application, Domain + Common (NuGet)
  - Presentation: depends on Application, Infrastructure + Common (NuGet)
- **CQRS via MediatR:** Commands and queries are separate `IRequest<T>` types with separate handlers. MediatR is the only approved dispatch mechanism. Query handlers MUST NOT modify state or publish events.
- **Repository Pattern:** One repository per aggregate root. Interfaces in Domain, implementations in Infrastructure.
- **Integration Events:** Cross-context communication via async events (MassTransit)

## Common Package

`<Namespace>.Common` is an external NuGet package — not a local project.
It contains shared DTOs, API contracts, and cross-service primitives. Do not duplicate its contents locally. Reference it via `PackageReference` only.

See `openspec/specs/architecture/` for full rules.

## Canonical Structure

```
test-workspace/
├── context/          ← AI navigation (you are reading from here)
├── openspec/         ← Specs, proposals, archive
├── backend/
│   ├── apis/           ← (empty) add: darkhorse-dotnet add api
│   ├── bffs/           ← (empty) add: darkhorse-dotnet add bff-api
│   └── microservices/  ← (empty) add: darkhorse-dotnet add microservice
├── deployment/       ← Docker, Kubernetes, IaC
└── .darkhorse.yaml   ← Workspace configuration
```


## Forbidden

- No agent frameworks (LangChain, AutoGen, CrewAI, Semantic Kernel)
- No extra top-level directories
- No code in `openspec/`
- No cross-context direct dependencies (use integration events)
- Domain layer has ZERO external dependencies

## Workflow

```bash
npx darkhorse-dotnet plan          # Create an architecture-compliant proposal
npx darkhorse-dotnet implement     # Execute an approved proposal
npx darkhorse-dotnet troubleshoot  # Investigate and fix a bug
npx darkhorse-dotnet validate      # Validate specs and architecture compliance
npx darkhorse-dotnet add api       # Add a new API service to the workspace
```

1. **Plan** — Create proposal in `openspec/changes/<id>/`
2. **Implement** — Follow `tasks.md`, write code inside-out: Domain → Application → Infrastructure → Presentation
3. **Test** — Run tests, file bugs as BUG proposals
4. **Fix** — Investigate and fix bugs
5. **Archive** — Move completed proposals to `openspec/archive/`

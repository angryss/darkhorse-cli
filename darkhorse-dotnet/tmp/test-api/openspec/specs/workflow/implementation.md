# Skill: Implementation

## Metadata

```yaml
id: implementation
version: 1.0.0
category: workflow
status: active
next_skill: validation
```

## Purpose

Scaffold new bounded contexts or extend existing ones based on an approved proposal. All implementation follows Onion Architecture (domain-first, inside-out) and must have a valid proposal ID from the Planning skill.

## Required Context

Load these files before executing the skill:

```yaml
proposal:
  - openspec/changes/<proposal_id>/proposal.md
  - openspec/changes/<proposal_id>/tasks.md

architecture:
  - openspec/specs/architecture/ddd-principles.md
  - openspec/specs/architecture/onion-architecture.md
  - openspec/specs/architecture/cqrs-patterns.md

patterns:
  - openspec/specs/patterns/backend.md
  - openspec/specs/patterns/frontend.md

context:
  - context/30-BOUNDED-CONTEXTS.md

toolkit:
  - openspec/specs/toolkit/README.md
```

## Steps

1. **Load Proposal** — Read the proposal and task list from `openspec/changes/<id>/`.
2. **Validate Proposal** — Confirm architecture checklist passes. If any check fails, return to Planning skill.
3. **Determine Mode** — Check if context folders exist in layer projects:
   - Exists → **EXTEND EXISTING**
   - Missing → **SCAFFOLD NEW**
4. **Implement Domain Layer** — Entities, Value Objects, Domain Events, Repository Interfaces. Zero external dependencies. (`Namespace.Domain/Contexts/<Context>/`)
5. **Implement Application Layer** — MediatR Commands, Queries, Handlers, DTOs, Validators. Depends only on Domain. (`Namespace.Application/Contexts/<Context>/`)
6. **Implement Infrastructure Layer** — EF Core repositories, MassTransit config, HttpClient implementations. (`Namespace.Infrastructure/Contexts/<Context>/`)
7. **Implement Presentation Layer** — ASP.NET Core controllers or MassTransit consumers. (`Namespace.Presentation/Contexts/<Context>/`)
8. **Implement Frontend** (if applicable) — Check toolkit first; build pages, components, state, API calls.
9. **Implement Deployment** (if applicable) — Docker configs, scripts, environment setup.
10. **Write Tests** — Unit tests (xUnit + Moq + FluentAssertions) for domain and application, integration tests (WebApplicationFactory) for API endpoints.
11. **Update Context Maps** — Update `context/30-BOUNDED-CONTEXTS.md` and `openspec/specs/domain/`.
12. **Mark Tasks Complete** — Update `openspec/changes/<id>/tasks.md`.

## Output Format

```markdown
# Implementation Report: [Proposal ID]

## Mode
scaffold-new / extend-existing

## Changes Made

### Domain Layer (Namespace.Domain)
- Files created/modified: [list]
- Entities: [list]
- Value Objects: [list]
- Events: [list]

### Application Layer (Namespace.Application)
- Commands: [list]
- Queries: [list]
- Handlers: [list]

### Infrastructure Layer (Namespace.Infrastructure)
- Repositories: [list]
- Messaging: [list]

### Presentation Layer (Namespace.Presentation)
- Controllers: [list]
- Consumers: [list]

### Frontend (if applicable)
- Pages: [list]
- Toolkit components used: [list]

## Tests Written
| Layer          | Test File                | Coverage |
|----------------|--------------------------|----------|
| Domain         | [path]                   | [%]      |
| Application    | [path]                   | [%]      |
| Infrastructure | [path]                   | [%]      |

## Architecture Validation
- DDD compliant: yes/no
- Onion layers respected: yes/no
- CQRS patterns followed: yes/no
- No cross-context imports: yes/no

## Next Actions
- [ ] Run tests (`dotnet test`)
- [ ] Archive proposal if complete
```

## Constraints

- All code MUST be written to `backend/`, `frontend/`, or `deployment/`.
- NO files may be written to `toolkit/` or `openspec/specs/toolkit/`.
- Every implementation MUST have a proposal ID.
- Implementation order: Domain → Application → Infrastructure → Presentation → Frontend → Deployment.
- Tests are non-negotiable: 80%+ line coverage, 75%+ branch coverage.
- Check toolkit FIRST before building custom UI components.

## Next Skill

- **Issues found** → **Troubleshooting** (`workflows/skills/troubleshooting.md`)
- **All clear** → archive the proposal

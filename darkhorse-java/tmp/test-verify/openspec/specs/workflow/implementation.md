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
2. **Validate Proposal** — Confirm architecture checklist passes (DDD, Onion Architecture, CQRS, scaffolding rules). If any check fails, return to Planning skill.
3. **Determine Mode** — Check if `backend/contexts/<context>/` exists:
   - Exists → **EXTEND EXISTING**
   - Missing → **SCAFFOLD NEW**
4. **Implement Domain Layer** — Entities, Value Objects, Domain Events, Domain Services, Repository Interfaces. Zero external dependencies.
5. **Implement Application Layer** — Commands, Queries, Handlers, DTOs. Depends only on Domain.
6. **Implement Infrastructure Layer** — Repository implementations, Messaging, Persistence. Implements interfaces from Application.
7. **Implement Presentation Layer** — Controllers, Routes. HTTP adapters only.
8. **Implement Frontend** (if applicable) — Check toolkit first; build pages, components, state, API calls.
9. **Implement Deployment** (if applicable) — Docker configs, scripts, environment setup.
10. **Write Tests** — Unit tests for domain and application, integration tests for infrastructure.
11. **Update Context Maps** — Update `context/30-BOUNDED-CONTEXTS.md` and `openspec/specs/domain/` if new context or domain concepts added.
12. **Mark Tasks Complete** — Update `openspec/changes/<id>/tasks.md`.

## Output Format

```markdown
# Implementation Report: [Proposal ID]

## Mode
scaffold-new / extend-existing

## Changes Made

### Domain Layer
- Files created/modified: [list]
- Entities: [list]
- Value Objects: [list]
- Events: [list]

### Application Layer
- Commands: [list]
- Queries: [list]
- Handlers: [list]

### Infrastructure Layer
- Repositories: [list]
- Messaging: [list]

### Presentation Layer
- Controllers: [list]
- Routes: [list]

### Frontend (if applicable)
- Pages: [list]
- Components: [list]
- Toolkit components used: [list]

### Deployment (if applicable)
- Configs: [list]

## Tests Written
| Layer          | Test File                | Coverage |
|----------------|--------------------------|----------|
| Domain         | [path]                   | [%]      |
| Application    | [path]                   | [%]      |
| Infrastructure | [path]                   | [%]      |

## Context Maps Updated
- [ ] context/30-BOUNDED-CONTEXTS.md
- [ ] openspec/specs/domain/

## Architecture Validation
- DDD compliant: yes/no
- Onion layers respected: yes/no
- CQRS patterns followed: yes/no
- No cross-context imports: yes/no

## Next Actions
- [ ] Run tests and validate
- [ ] Archive proposal if complete
```

## Constraints

- All code MUST be written to `backend/`, `frontend/`, or `deployment/`.
- NO files may be written to `toolkit/` or `openspec/specs/toolkit/`.
- Every implementation MUST have a proposal ID.
- Implementation order is always inside-out: Domain → Application → Infrastructure → Presentation → Frontend → Deployment.
- Tests are non-negotiable: 80%+ line coverage, 75%+ branch coverage.
- Check toolkit FIRST before building custom UI components.

## Next Skill

After implementation is complete, the workflow is typically done. If issues are found during validation:

- **Issues found** → proceed to **Troubleshooting** (`workflows/skills/troubleshooting.md`)
- **All clear** → archive the proposal

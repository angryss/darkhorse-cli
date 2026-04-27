# Skill: Implementation

## Metadata

```yaml
id: implementation
version: 1.1.0
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
  - openspec/changes/mvp-<MVP>/<proposal_id>/proposal.md
  - openspec/changes/mvp-<MVP>/<proposal_id>/tasks.md

architecture:
  - openspec/specs/architecture/architecture-rules.md
  - openspec/specs/architecture/archetype-rules.md
  - openspec/specs/architecture/scaffolding-rules.md
  - openspec/specs/architecture/testing-rules.md
  - openspec/specs/architecture/agent-limits.md

patterns:
  - openspec/specs/patterns/backend-patterns.md
  - openspec/specs/patterns/frontend-patterns.md

context:
  - context/30-BOUNDED-CONTEXTS.md

toolkit:
  - openspec/specs/toolkit/README.md
```

## Steps

1. **Verify Proposal Exists** — Check that `openspec/changes/mvp-<MVP>/<id>/proposal.md` exists AND the requirement row is present in `openspec/changes/mvp-<MVP>/progress-tracker.md`. If either is missing, **STOP** — do not write any code. Direct the user to the Planning skill first.
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
11. **Zero Tech Debt — MANDATORY before marking any task complete:** Run the full test suite for every service touched (`mvn test` for Java services, `npx vitest run` for frontend). **ALL pre-existing test failures must be fixed before proceeding** — no failures may be left behind, whether introduced by this change or already present. A red suite is never acceptable. If a test failure is unrelated to the current requirement, fix it immediately as part of this task.
12. **Update Context Maps** — Update `context/30-BOUNDED-CONTEXTS.md` and `openspec/specs/domain/` if new context or domain concepts added.
13. **Mark Tasks Complete — IMMEDIATELY after each task is implemented:** check the corresponding `- [ ]` box to `- [x]` in `tasks.md`. Do not defer to the end. After each phase completes, all boxes in that phase MUST be `[x]`. When ALL phases are done, update the `**Status:**` header in `tasks.md` to `Done` and set the requirement row to `Done` in `progress-tracker.md`.
14. **Check MVP Completion** — If ALL requirements in `openspec/changes/mvp-<MVP>/progress-tracker.md` are `Done` and all tests pass: update `roadmap.md` to `Completed`, then move `openspec/changes/mvp-<MVP>/` to `openspec/archive/mvp-<MVP>/`.

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
- [ ] Archive proposal if complete: check `openspec/changes/mvp-<MVP>/progress-tracker.md`
- [ ] If ALL MVP requirements are Done: archive `openspec/changes/mvp-<MVP>/` → `openspec/archive/mvp-<MVP>/` and update `roadmap.md`
```

## Constraints

- **HARD STOP — No Unapproved Work:** MUST NOT write any code without a valid proposal file at `openspec/changes/mvp-<MVP>/<id>/proposal.md` that also appears in `progress-tracker.md`. If no proposal exists, STOP immediately and direct to the Planning skill.
- **HARD RULE — Real-Time Task Tracking:** Task checkboxes in `tasks.md` MUST be ticked `[x]` as each task is completed, not batched at the end. If a session ends mid-implementation, the checkboxes MUST reflect exactly which tasks were done. At the start of any session continuing a prior implementation, cross-reference `tasks.md` unchecked boxes against actual code — if code exists, mark the task done before proceeding.
- **HARD RULE — Status Synchronisation:** `tasks.md` `**Status:**` header and `progress-tracker.md` row MUST always agree. If `progress-tracker.md` says `Done`, every checkbox in `tasks.md` MUST be `[x]` and the header MUST say `Done`. Any mismatch is a tracking debt that must be resolved before new work begins.
- All code MUST be written to `backend/`, `frontend/`, or `deployment/`.
- NO files may be written to `toolkit/` or `openspec/specs/toolkit/`.
- Every implementation MUST have a proposal ID.
- Implementation order is always inside-out: Domain → Application → Infrastructure → Presentation → Frontend → Deployment.
- Tests are non-negotiable: 80%+ line coverage, 75%+ branch coverage.
- Check toolkit FIRST before building custom UI components.
- **MVP Archiving**: When all proposal tasks in an MVP are Done and tests pass, move `openspec/changes/mvp-<MVP>/` to `openspec/archive/mvp-<MVP>/` and update `openspec/specs/project/roadmap.md` status to `Completed`.

## Next Skill

After implementation is complete, the workflow is typically done. If issues are found during validation:

- **Issues found** → proceed to **Troubleshooting** (`workflows/skills/troubleshooting.md`)
- **All clear** → archive the proposal

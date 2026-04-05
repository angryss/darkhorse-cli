# Skill: Planning

## Metadata

```yaml
id: planning
version: 1.1.0
category: workflow
status: active
next_skill: implementation
```

## Purpose

Create architecture-compliant proposals for features, enhancements, or bug fixes. Every proposal must identify the bounded context, define ubiquitous language, and validate against DDD, Onion Architecture, and CQRS rules before implementation can begin.

## Required Context

Load these files before executing the skill:

```yaml
architecture:
  - openspec/specs/architecture/ddd-principles.md
  - openspec/specs/architecture/onion-architecture.md
  - openspec/specs/architecture/cqrs-patterns.md
  - openspec/specs/architecture/common-packages.md

patterns:
  - openspec/specs/patterns/backend.md
  - openspec/specs/patterns/frontend.md

context:
  - context/20-WORKSPACE-PROJECTS.md
  - context/30-BOUNDED-CONTEXTS.md
  - openspec/specs/domain/context-map.md

mvp:
  - openspec/specs/project/roadmap.md
  - openspec/changes/mvp-[MVP]/progress-tracker.md

toolkit:
  - openspec/specs/toolkit/README.md
```

## Steps

1. **Load Architecture Rules** — Read all architecture specs to understand constraints.
2. **Read Context Maps** — Identify existing bounded contexts and relationships.
3. **Read MVP State** — Load `openspec/specs/project/roadmap.md` and `openspec/changes/mvp-[MVP]/progress-tracker.md` to understand current scope and progress.
4. **Identify Bounded Context** — Determine if the request targets a new or existing context. If cross-context, identify the integration pattern (ACL, Events, Shared Kernel).
5. **Define Ubiquitous Language** — List domain terms, entity names, and event names with definitions.
6. **Check Toolkit** — If UI is needed, check available toolkit components before proposing custom ones.
7. **Validate Against Rules** — Verify DDD compliance, Onion Architecture layers, CQRS patterns, and scaffolding rules.
8. **Create Proposal** — Generate `openspec/changes/mvp-[MVP]/REQ-[MVP]-[###]/proposal.md` and `openspec/changes/mvp-[MVP]/REQ-[MVP]-[###]/tasks.md`.
9. **Update Progress Tracker** — Add the new requirement row to `openspec/changes/mvp-[MVP]/progress-tracker.md` with status `Not Started`.

## Output Format

```markdown
# REQ-[MVP]-[###]: [Title]

## Summary
[One-line description using ubiquitous language]

## Bounded Context
- Context Name: [name]
- New Context: yes/no
- Cross-Context: yes/no
- Integration Pattern: [ACL/Events/Shared Kernel/None]

## Ubiquitous Language
| Term | Definition | Context |
|------|------------|---------|
| ...  | ...        | ...     |

## Architecture Compliance
- DDD: [pass/fail + details]
- Onion Architecture: [pass/fail + details]
- CQRS: [pass/fail + details]
- Scaffolding Rules: [pass/fail + details]

## Classification
- Type: feature / enhancement / bug-fix
- Priority: P0 / P1 / P2 / P3
- Full Slice: backend / frontend / full-slice / infrastructure

## Code Locations
| Layer          | Path                                                  |
|----------------|-------------------------------------------------------|
| Domain         | backend/src/Namespace.Domain/Contexts/<Context>/      |
| Application    | backend/src/Namespace.Application/Contexts/<Context>/ |
| Infrastructure | backend/src/Namespace.Infrastructure/Contexts/<Context>/ |
| Presentation   | backend/src/Namespace.Presentation/Contexts/<Context>/ |
| Frontend       | frontend/web-app/src/                                 |
| Deployment     | deployment/                                           |

## Requirements
- FR-001: [functional requirement]
- NFR-001: [non-functional requirement]

## Test Plan
- [ ] Unit tests for domain logic (xUnit + FluentAssertions)
- [ ] Unit tests for command/query handlers (Moq)
- [ ] Integration tests for repositories (WebApplicationFactory)

## Next Actions
- [ ] Add to `openspec/changes/mvp-[MVP]/progress-tracker.md` (status: Not Started)
- [ ] Proceed to **Implementation** skill with this proposal ID
```

## Constraints

- **HARD STOP — Proposals Only:** This skill produces proposal documents ONLY. Writing source code, creating application files, or modifying any file outside `openspec/changes/` is a HARD STOP violation. If you feel the urge to write code during planning, stop immediately and complete the proposal instead.
- Never propose new toolkit components (toolkit is frozen).
- Project code targets `backend/`, `frontend/`, `deployment/` only.
- Every proposal MUST identify a bounded context and define ubiquitous language.
- Proposals MUST pass architecture validation before implementation begins.

## Next Skill

After planning is complete, proceed to: **Implementation** (`workflows/skills/implementation.md`)

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

Create architecture-compliant proposals for features, enhancements, or bug fixes. Every proposal must identify the bounded context (crate scope), define ubiquitous language, and validate against clean architecture and CQRS rules before implementation can begin.

## Required Context

Load these files before executing the skill:

```yaml
architecture:
  - openspec/specs/architecture/clean-architecture.md
  - openspec/specs/architecture/cqrs-patterns.md

patterns:
  - openspec/specs/patterns/backend.md
  - openspec/specs/patterns/frontend.md

context:
  - context/20-WORKSPACE-PROJECTS.md
  - context/30-BOUNDED-CONTEXTS.md

mvp:
  - openspec/specs/project/roadmap.md
  - openspec/changes/mvp-[MVP]/progress-tracker.md
```

## Steps

1. **Load Architecture Rules** — Read all architecture specs to understand constraints.
2. **Read Context Maps** — Identify existing bounded contexts and crate relationships.
3. **Read MVP State** — Load `openspec/specs/project/roadmap.md` and `openspec/changes/mvp-[MVP]/progress-tracker.md` to understand current scope and progress.
4. **Identify Bounded Context** — Determine if the request targets a new or existing context. Map to the correct domain/application/infrastructure crate modules.
5. **Define Ubiquitous Language** — List domain terms, entity names, and value object names with definitions.
6. **Validate Against Rules** — Verify clean architecture layers, CQRS patterns, and project structure rules.
7. **Create Proposal** — Generate `openspec/changes/mvp-[MVP]/REQ-[MVP]-[###]/proposal.md` and `openspec/changes/mvp-[MVP]/REQ-[MVP]-[###]/tasks.md`.
8. **Update Bounded Context Registry** — Update `context/30-BOUNDED-CONTEXTS.md` for any new or expanded bounded context. Create `openspec/specs/domain/<context-name>.md` if this is a new context. Mark N/A if purely infrastructure/cross-cutting.
9. **Update Roadmap** — Add the REQ row to the Requirements table in `openspec/specs/project/roadmap.md` under the active MVP section. Add the source DISC to Discovery Sources if not already present. Update Goals if materially changed.
10. **Update Progress Tracker** — Add the new requirement row to `openspec/changes/mvp-[MVP]/progress-tracker.md` with status `Not Started`. Update the Total Requirements count.

## Output Format

```markdown
# REQ-[MVP]-[###]: [Title]

## Summary
[One-line description using ubiquitous language]

## Bounded Context
- Context Name: [name]
- New Context: yes/no
- Cross-Context: yes/no

## Ubiquitous Language
| Term | Definition | Context |
|------|------------|---------|
| ...  | ...        | ...     |

## Architecture Compliance
- Clean Architecture: [pass/fail + details]
- CQRS: [pass/fail + details]
- Crate boundaries: [pass/fail + details]

## Classification
- Type: feature / enhancement / bug-fix
- Priority: P0 / P1 / P2 / P3
- Scope: backend / frontend / full-slice / infrastructure

## Code Locations
| Layer          | Path                                      |
|----------------|-------------------------------------------|
| Domain         | crates/<prefix>-domain/src/<context>/      |
| Application    | crates/<prefix>-application/src/<context>/ |
| Infrastructure | crates/<prefix>-infrastructure/src/<context>/ |
| Desktop Shell  | crates/<prefix>-desktop/src/               |
| Frontend       | frontend/src/                              |

## Requirements
- FR-001: [functional requirement]
- NFR-001: [non-functional requirement]

## Test Plan
- [ ] Unit tests for domain logic (#[cfg(test)] modules)
- [ ] Unit tests for application commands
- [ ] Integration tests for infrastructure (in-memory SQLite)

## Next Actions
- [ ] Update `context/30-BOUNDED-CONTEXTS.md` — add/expand bounded context entry (or mark N/A if no context change)
- [ ] Create `openspec/specs/domain/<context-name>.md` stub — if new bounded context (or mark N/A)
- [ ] Update `openspec/specs/project/roadmap.md` — add REQ to active MVP Requirements table; add DISC to Discovery Sources if applicable; update Goals if materially changed
- [ ] Add to `openspec/changes/mvp-[MVP]/progress-tracker.md` (status: Not Started) and update Total Requirements count
- [ ] Proceed to **Implementation** skill with this proposal ID
```

## Constraints

- **HARD STOP — Proposals Only:** This skill produces proposal documents ONLY. Writing source code, creating application files, or modifying any file outside `openspec/changes/`, `context/`, `openspec/specs/project/roadmap.md` is a HARD STOP violation.
- Every proposal MUST identify a bounded context and define ubiquitous language.
- Proposals MUST pass architecture validation before implementation begins.
- `context/30-BOUNDED-CONTEXTS.md` MUST be updated whenever a new bounded context is introduced or an existing one is materially expanded.
- `openspec/specs/project/roadmap.md` MUST be updated for every new REQ — the Requirements table in the active MVP section and Discovery Sources if applicable.

## Next Skill

After planning is complete, proceed to: **Implementation** (`workflows/skills/implementation.md`)

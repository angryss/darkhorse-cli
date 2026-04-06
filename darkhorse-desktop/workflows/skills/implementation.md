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

Create new bounded contexts or extend existing ones based on an approved proposal. All implementation follows Clean Architecture (domain-first, inside-out) and must have a valid proposal ID from the Planning skill.

## Required Context

Load these files before executing the skill:

```yaml
proposal:
  - openspec/changes/mvp-<MVP>/<proposal_id>/proposal.md
  - openspec/changes/mvp-<MVP>/<proposal_id>/tasks.md

architecture:
  - openspec/specs/architecture/clean-architecture.md
  - openspec/specs/architecture/cqrs-patterns.md

patterns:
  - openspec/specs/patterns/backend.md
  - openspec/specs/patterns/frontend.md

context:
  - context/30-BOUNDED-CONTEXTS.md
```

## Steps

1. **Verify Proposal Exists** — Check that `openspec/changes/mvp-<MVP>/<id>/proposal.md` exists AND the requirement row is present in `openspec/changes/mvp-<MVP>/progress-tracker.md`. If either is missing, **STOP** — do not write any code. Direct the user to the Planning skill first.
2. **Validate Proposal** — Confirm architecture checklist passes. If any check fails, return to Planning skill.
3. **Determine Mode** — Check if context modules exist in crate source:
   - Exists → **EXTEND EXISTING**
   - Missing → **CREATE NEW**
4. **Implement Domain Layer** — Entities, Value Objects, Domain Services, Repository Traits (port interfaces). Zero external dependencies. (`crates/<prefix>-domain/src/`)
5. **Implement Application Layer** — Commands, Handlers, DTOs, Port Traits. Depends only on Domain. (`crates/<prefix>-application/src/`)
6. **Implement Infrastructure Layer** — SQLite repositories, filesystem operations, settings implementations. (`crates/<prefix>-infrastructure/src/`)
7. **Implement Desktop Shell** (if applicable) — Tauri bridge commands, state management. (`crates/<prefix>-desktop/src/`)
8. **Implement Frontend** (if applicable) — Pages, components, services, state. (`frontend/src/`)
9. **Write Tests** — Unit tests (`#[cfg(test)]` modules) for domain and application, integration tests (in-memory SQLite) for infrastructure.
10. **Update Context Maps** — Update `context/30-BOUNDED-CONTEXTS.md` if new context or domain concepts added.
11. **Mark Tasks Complete** — Update `openspec/changes/mvp-<MVP>/<id>/tasks.md` and set requirement status to `Done` in `openspec/changes/mvp-<MVP>/progress-tracker.md`.
12. **Check MVP Completion** — If ALL requirements in `openspec/changes/mvp-<MVP>/progress-tracker.md` are `Done` and all tests pass: update `roadmap.md` to `Completed`, then move `openspec/changes/mvp-<MVP>/` to `openspec/archive/mvp-<MVP>/`.

## Output Format

```markdown
# Implementation Report: [Proposal ID]

## Mode
create-new / extend-existing

## Changes Made

### Domain Layer (<prefix>-domain)
- Files created/modified: [list]
- Entities: [list]
- Value Objects: [list]
- Domain Services: [list]
- Port Traits: [list]

### Application Layer (<prefix>-application)
- Commands: [list]
- Handlers: [list]
- Port Traits: [list]

### Infrastructure Layer (<prefix>-infrastructure)
- Repositories: [list]
- Migrations: [list]
- Filesystem: [list]

### Desktop Shell (<prefix>-desktop, if applicable)
- Bridge commands: [list]
- State changes: [list]

### Frontend (if applicable)
- Pages: [list]
- Components: [list]
- Services: [list]

## Tests Written
| Layer          | Test Module              | Coverage |
|----------------|--------------------------|----------|
| Domain         | [path]                   | [%]      |
| Application    | [path]                   | [%]      |
| Infrastructure | [path]                   | [%]      |

## Architecture Validation
- Clean architecture layers respected: yes/no
- Crate dependency direction correct: yes/no
- CQRS patterns followed: yes/no
- No cross-context imports: yes/no

## Next Actions
- [ ] Run tests (`cargo test`)
- [ ] Archive proposal if complete: check `openspec/changes/mvp-<MVP>/progress-tracker.md`
- [ ] If ALL MVP requirements are Done: archive to `openspec/archive/mvp-<MVP>/` and update `roadmap.md`
```

## Constraints

- **HARD STOP — No Unapproved Work:** MUST NOT write any code without a valid proposal file at `openspec/changes/mvp-<MVP>/<id>/proposal.md` that also appears in `progress-tracker.md`. If no proposal exists, STOP immediately and direct to the Planning skill.
- All code MUST be written to `crates/` or `frontend/`.
- Every implementation MUST have a proposal ID.
- Implementation order: Domain → Application → Infrastructure → Desktop Shell → Frontend.
- Tests are non-negotiable: every public function must have test coverage.
- **MVP Archiving**: When all proposal tasks in an MVP are Done and tests pass, move `openspec/changes/mvp-<MVP>/` to `openspec/archive/mvp-<MVP>/` and update `openspec/specs/project/roadmap.md` status to `Completed`.

## Next Skill

- **Issues found** → **Troubleshooting** (`workflows/skills/troubleshooting.md`)
- **All clear** → archive the proposal

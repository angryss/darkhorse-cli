# Requirements Guide — Rust/Tauri Desktop

> How to write and manage requirements for Dark Horse Rust/Tauri projects.

## Requirement Structure

Each requirement lives in a proposal directory:

```
openspec/changes/mvp-X.Y/REQ-X.Y-NNN/
├── proposal.md        ← What to build and why
├── design.md          ← Technical approach (optional for small changes)
└── checklist.md       ← Implementation verification checklist
```

## Requirement ID Format

`REQ-{MVP}-{###}` — e.g., `REQ-1.0-001`, `REQ-1.0-002`

## Proposal Template

```markdown
# REQ-X.Y-NNN — [Title]

## Summary
[One-paragraph description of what this requirement delivers]

## Motivation
[Why is this needed? What problem does it solve?]

## Scope
- [ ] Domain changes (entities, values, services)
- [ ] Application changes (commands, handlers, ports)
- [ ] Infrastructure changes (database, filesystem)
- [ ] Desktop changes (Tauri commands, state)
- [ ] Frontend changes (pages, services, components)

## Acceptance Criteria
1. [Specific, testable criterion]
2. [Another criterion]

## Implementation Notes
[Any technical guidance, constraints, or design decisions]
```

## Classification Types

| Type | Description |
|------|-------------|
| **full-slice** | End-to-end: domain → application → infrastructure → desktop → frontend |
| **backend** | Rust crate changes only (no frontend) |
| **frontend** | TypeScript UI changes only (no Rust) |
| **infrastructure** | Persistence, filesystem, settings |
| **docs** | Documentation, context, or spec updates |

## Workflow

1. **Define** — Create requirement in `openspec/specs/project/roadmap.md`
2. **Propose** — Write detailed proposal in `openspec/changes/mvp-X.Y/REQ-X.Y-NNN/`
3. **Implement** — Execute inside-out (domain → application → infrastructure → desktop → frontend)
4. **Track** — Update `progress-tracker.md` status after each step
5. **Archive** — Move completed MVP from `changes/` to `archive/`

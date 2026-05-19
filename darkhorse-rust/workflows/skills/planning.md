# Planning Skill

> Create detailed implementation plans for approved requirements.

## Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `requirement_id` | Yes | The requirement ID (e.g., REQ-1.0-001) |
| `mvp` | Yes | The MVP version (e.g., 1.0) |

## Steps

1. **Load requirement** — Read from `openspec/specs/project/roadmap.md`
2. **Analyze impact** — Determine which crates and layers are affected
3. **Design interfaces** — Define port traits, command structs, entity models
4. **Plan database** — Design SQLite schema changes if needed
5. **Define test strategy** — Specify tests per layer
6. **Write proposal** — Create `openspec/changes/mvp-{mvp}/{requirement_id}/proposal.md`
7. **Update Bounded Context Registry** — Update `context/30-BOUNDED-CONTEXTS.md` for any new or expanded bounded context. Create `openspec/specs/domain/<context-name>.md` if this is a new context. Mark N/A if purely infrastructure/cross-cutting.
8. **Update Roadmap** — Add the REQ row to the Requirements table in `openspec/specs/project/roadmap.md` under the active MVP section. Add source DISC to Discovery Sources if not already present.
9. **Update Progress Tracker** — Add the new requirement row to `openspec/changes/mvp-{mvp}/progress-tracker.md` with status `Not Started`. Update the Total Requirements count.

## Output

Proposal created at `openspec/changes/mvp-{mvp}/{requirement_id}/proposal.md` containing:

- Summary and motivation
- Scope (affected layers/crates)
- Interface/trait definitions
- Database schema changes
- Inside-out implementation order
- Test strategy per layer
- Acceptance criteria

# Implementation Skill

> Execute an approved proposal inside-out from domain to presentation.

## Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `proposal_id` | Yes | The requirement/proposal ID (e.g., REQ-1.0-001) |
| `mvp` | Yes | The MVP version (e.g., 1.0) |
| `task` | No | Specific task within the proposal to implement |

## Pre-Conditions

- Proposal MUST exist at `openspec/changes/mvp-{mvp}/{proposal_id}/proposal.md`
- Do NOT begin implementation without an approved proposal

## Steps

### 1. Domain Layer (`<prefix>-domain`)

- Create entities in `src/entities/`
- Create value objects in `src/values/`
- Create domain services in `src/services/`
- Define domain errors in `src/errors.rs`
- Write unit tests (`#[cfg(test)]`)

### 2. Application Layer (`<prefix>-application`)

- Create command structs in `src/commands/`
- Create handler functions
- Define port traits in `src/ports/`
- Write unit tests with mock port implementations

### 3. Infrastructure Layer (`<prefix>-infrastructure`)

- Implement port traits (SQLite repositories, filesystem adapters)
- Create database migrations
- Write integration tests with in-memory SQLite

### 4. Desktop Layer (`<prefix>-desktop`)

- Add Tauri commands that dispatch to application handlers
- Wire state management
- Verify compilation: `cargo check`

### 5. Frontend

- Create service layer functions (Tauri IPC wrappers)
- Create page components
- Wire into application routing

### 6. Verify

- Run `cargo check` — no errors
- Run `cargo test` — all tests pass
- Update progress tracker status to "Done"

## Output Format

```markdown
# Implementation Report — {proposal_id}

## Files Created
- [file path]: [purpose]

## Files Modified
- [file path]: [what changed]

## Tests Written
- [test name]: [what it verifies]

## Progress
- [requirement_id] status updated to: Done
```

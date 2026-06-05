---
description: Execute an approved proposal inside-out for the WPF desktop project
---

# /implement

Invoke the `@implement` agent to execute an approved proposal.

## Usage

```
/implement [proposal-id or REQ-X.Y-NNN] [--mvp X.Y]
```

## Examples

```
/implement REQ-1.0-001
/implement orders-create-feature --mvp 1.0
/implement the OrderManagement domain layer
```

## Execution Order (Mandatory)

```
1. Common (if new primitives needed)
2. Domain entities, value objects, domain events, repository interfaces
3. Application commands, queries, handlers, validators
4. Infrastructure repositories, EF Core configurations
5. Presentation ViewModels + XAML Views
6. Tests
```

## Pre-conditions

- `openspec/changes/mvp-{X.Y}/{proposal-id}/proposal.md` must exist
- Proposal must have passed the architecture checklist
- Requirement must be in `progress-tracker.md`

## Post-conditions

- All tasks in `tasks.md` are checked
- `dotnet test` passes with zero failures
- `context/30-BOUNDED-CONTEXTS.md` is updated (if new context)
- Requirement status is `Done` in progress tracker

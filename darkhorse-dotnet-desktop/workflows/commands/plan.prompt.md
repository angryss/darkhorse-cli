---
description: Create a DDD-compliant proposal for a WPF desktop feature
---

# /plan

Invoke the `@plan` agent to create a structured proposal for implementation.

## Usage

```
/plan [feature description] [--context ContextName] [--mvp X.Y]
```

## Examples

```
/plan Add OrderManagement bounded context with create/list/cancel operations for MVP 1.0
/plan Implement REQ-1.0-002: domain model for the Inventory context
/plan Add a notification bell to the MainWindow shell that shows unread alerts
```

## What This Produces

A proposal at `openspec/changes/mvp-{X.Y}/{proposal-id}/`:
- `proposal.md` — requirement, acceptance criteria, architecture decisions
- `tasks.md` — task checklist organized by layer

## Architecture Checklist (auto-checked by @plan)

- Domain has no new external dependencies
- Handlers do not call Infrastructure directly
- ViewModels dispatch via `IMediator`
- Implementation order is inside-out

## Next Step

After plan approval: `/implement [proposal-id]`

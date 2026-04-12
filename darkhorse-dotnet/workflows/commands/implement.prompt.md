---
description: "Execute an approved proposal using inside-out DDD implementation order"
mode: agent
---

Execute the **Implementation** workflow.

## Skill

Read and follow every step in `openspec/specs/workflow/skills/implementation.md`.

## Context

Load the proposal from `openspec/changes/mvp-{MVP}/{proposal_id}/` and all required context files listed in the skill.

## Parameters

- **proposal_id**: The proposal ID (e.g., REQ-1.0-001 or BUG-1.0-003)
- **mvp**: The target MVP (e.g., 1.0)
- **task**: What to implement
- **service**: Target service or bounded context

## Constraints

- Proposal MUST exist before implementation begins
- Follow inside-out order: Domain → Application → Infrastructure → Presentation → Frontend → Deployment
- Update `openspec/changes/mvp-{MVP}/progress-tracker.md` as tasks complete
- When ALL MVP requirements are Done, archive to `openspec/archive/mvp-{MVP}/`

## Handoff

After completing all requirements for an MVP, archive and update `openspec/specs/project/roadmap.md`.
